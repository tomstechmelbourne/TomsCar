package com.tomstechsolutions.car

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.media.AudioManager
import android.media.ToneGenerator
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.CallLog
import android.provider.ContactsContract
import android.provider.Telephony
import android.telecom.TelecomManager
import android.telephony.PhoneStateListener
import android.telephony.SmsManager
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executor

/** Incoming / ongoing calls, call log, SMS, contacts. */
class Phone(private val a: Activity) {
    var state: String? = null          // null | ring | talk
    var number: String = ""
    var name: String = ""
    var group: String = "Số Lạ"
    var since: Long = 0
    var missed = 0
    private var wasRinging = false
    private val tm = a.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    private val main = Handler(Looper.getMainLooper())
    private var cb: Any? = null

    private fun has(p: String) = a.checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED

    @Suppress("DEPRECATION")
    fun start() {
        if (cb != null || !has(Manifest.permission.READ_PHONE_STATE)) return
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                val c = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
                    override fun onCallStateChanged(st: Int) { onState(st, null) }
                }
                tm.registerTelephonyCallback(Executor { main.post(it) }, c); cb = c
            } else {
                val l = object : PhoneStateListener() {
                    override fun onCallStateChanged(st: Int, num: String?) { onState(st, num) }
                }
                tm.listen(l, PhoneStateListener.LISTEN_CALL_STATE); cb = l
            }
        } catch (_: Exception) {}
    }

    @Suppress("DEPRECATION")
    fun stop() {
        val c = cb ?: return
        try { if (Build.VERSION.SDK_INT >= 31) tm.unregisterTelephonyCallback(c as TelephonyCallback) else tm.listen(c as PhoneStateListener, PhoneStateListener.LISTEN_NONE) } catch (_: Exception) {}
        cb = null
    }

    private fun onState(st: Int, num: String?) {
        when (st) {
            TelephonyManager.CALL_STATE_RINGING -> {
                state = "ring"; wasRinging = true; since = System.currentTimeMillis()
                number = num ?: lastIncomingNumber() ?: ""
                val c = contact(number); name = c.first; group = c.second
                chime(group)
            }
            TelephonyManager.CALL_STATE_OFFHOOK -> { if (state != "talk") since = System.currentTimeMillis(); state = "talk"; wasRinging = false }
            TelephonyManager.CALL_STATE_IDLE -> {
                if (wasRinging && state == "ring") missed++
                state = null; wasRinging = false; number = ""; name = ""
            }
        }
    }

    /** A short chime per contact group, on top of the phone's own ring (the name is never read out). */
    private fun chime(g: String) {
        try {
            val t = ToneGenerator(AudioManager.STREAM_MUSIC, 70)
            val tone = when (g) { "Gia Đình" -> ToneGenerator.TONE_PROP_ACK; "Khách Hàng" -> ToneGenerator.TONE_PROP_BEEP2; "Bạn Bè" -> ToneGenerator.TONE_PROP_PROMPT; else -> ToneGenerator.TONE_PROP_NACK }
            t.startTone(tone, 400); main.postDelayed({ t.release() }, 800)
        } catch (_: Exception) {}
    }

    fun json(): JSONObject? {
        val s = state ?: return null
        return JSONObject().put("state", s).put("number", number).put("name", name).put("group", group).put("since", since)
    }

    @Suppress("DEPRECATION")
    @SuppressLint("MissingPermission")
    fun action(arg: String) {
        val telecom = a.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
        val am = a.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        try {
            when {
                arg == "answer" -> if (has(Manifest.permission.ANSWER_PHONE_CALLS)) telecom.acceptRingingCall() else Launcher.toast(a, "Cần cấp quyền nghe máy (Cài Đặt → Quyền)")
                arg.startsWith("decline") || arg == "end" -> {
                    val num = number
                    val ok = if (Build.VERSION.SDK_INT >= 28 && has(Manifest.permission.ANSWER_PHONE_CALLS)) telecom.endCall() else false
                    if (!ok) Launcher.toast(a, "Máy không cho Tom's Car gác máy — bấm trên màn hình gọi")
                    if (arg == "decline:1" && num.isNotBlank()) sms(num, "Mình đang lái xe, lát gọi lại nha")
                }
                arg == "mute" -> am.isMicrophoneMute = true
                arg == "unmute" -> am.isMicrophoneMute = false
                arg == "speaker" -> am.isSpeakerphoneOn = true
                arg == "phone" -> am.isSpeakerphoneOn = false
                arg.startsWith("dial:") -> dial(arg.removePrefix("dial:"))
                arg.startsWith("dialName:") -> { val n = findByName(arg.removePrefix("dialName:")); if (n != null) dial(n) else Launcher.toast(a, "Không thấy tên này trong danh bạ") }
            }
        } catch (e: Exception) { Launcher.toast(a, "Không làm được: ${e.message}") }
    }

    @SuppressLint("MissingPermission")
    private fun dial(num: String) {
        if (num.isBlank()) return
        val i = if (has(Manifest.permission.CALL_PHONE)) Intent(Intent.ACTION_CALL, Uri.parse("tel:" + Uri.encode(num))) else Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + Uri.encode(num)))
        a.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    fun sms(num: String, text: String) {
        if (!has(Manifest.permission.SEND_SMS)) { Launcher.toast(a, "Cần quyền gửi SMS để tự nhắn lại"); return }
        try {
            @Suppress("DEPRECATION") val sm = if (Build.VERSION.SDK_INT >= 31) a.getSystemService(SmsManager::class.java) else SmsManager.getDefault()
            sm.sendTextMessage(num, null, text, null, null)
        } catch (_: Exception) {}
    }

    // ---------------------------------------------------------------- contacts
    private fun lastIncomingNumber(): String? {
        if (!has(Manifest.permission.READ_CALL_LOG)) return null
        return try {
            a.contentResolver.query(CallLog.Calls.CONTENT_URI, arrayOf(CallLog.Calls.NUMBER), null, null, CallLog.Calls.DATE + " DESC")?.use { if (it.moveToFirst()) it.getString(0) else null }
        } catch (_: Exception) { null }
    }

    /** name + group (Gia Đình / Khách Hàng / Bạn Bè / Số Lạ) from the phone's contact groups. */
    fun contact(num: String): Pair<String, String> {
        if (num.isBlank() || !has(Manifest.permission.READ_CONTACTS)) return "" to "Số Lạ"
        try {
            val u = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(num))
            val (id, nm) = a.contentResolver.query(u, arrayOf(ContactsContract.PhoneLookup._ID, ContactsContract.PhoneLookup.DISPLAY_NAME), null, null, null)?.use {
                if (it.moveToFirst()) it.getLong(0) to (it.getString(1) ?: "") else null
            } ?: return "" to "Số Lạ"
            return nm to groupOf(id)
        } catch (_: Exception) { return "" to "Số Lạ" }
    }

    private val groupTitles by lazy {
        val m = HashMap<Long, String>()
        try {
            a.contentResolver.query(ContactsContract.Groups.CONTENT_URI, arrayOf(ContactsContract.Groups._ID, ContactsContract.Groups.TITLE), null, null, null)?.use {
                while (it.moveToNext()) m[it.getLong(0)] = it.getString(1) ?: ""
            }
        } catch (_: Exception) {}
        m
    }

    private fun groupOf(contactId: Long): String {
        try {
            a.contentResolver.query(ContactsContract.Data.CONTENT_URI, arrayOf(ContactsContract.CommonDataKinds.GroupMembership.GROUP_ROW_ID),
                ContactsContract.Data.CONTACT_ID + "=? AND " + ContactsContract.Data.MIMETYPE + "=?",
                arrayOf(contactId.toString(), ContactsContract.CommonDataKinds.GroupMembership.CONTENT_ITEM_TYPE), null)?.use {
                while (it.moveToNext()) {
                    val t = (groupTitles[it.getLong(0)] ?: "").lowercase()
                    if (t.contains("gia đình") || t.contains("family")) return "Gia Đình"
                    if (t.contains("khách") || t.contains("customer") || t.contains("client") || t.contains("work") || t.contains("co-worker")) return "Khách Hàng"
                }
            }
        } catch (_: Exception) {}
        return "Bạn Bè"
    }

    private fun findByName(q: String): String? {
        if (!has(Manifest.permission.READ_CONTACTS)) return null
        return try {
            a.contentResolver.query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI, arrayOf(ContactsContract.CommonDataKinds.Phone.NUMBER),
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " LIKE ?", arrayOf("%" + q.trim() + "%"), null)?.use { if (it.moveToFirst()) it.getString(0) else null }
        } catch (_: Exception) { null }
    }

    // ---------------------------------------------------------------- call log + SMS for the Liên Lạc tab
    private fun whenTxt(t: Long): String {
        val c = Calendar.getInstance(); val today = c.get(Calendar.DAY_OF_YEAR); c.timeInMillis = t
        val hm = SimpleDateFormat("HH:mm", Locale.US).format(Date(t))
        val now = Calendar.getInstance()
        return when {
            c.get(Calendar.DAY_OF_YEAR) == today && c.get(Calendar.YEAR) == now.get(Calendar.YEAR) -> hm
            c.get(Calendar.DAY_OF_YEAR) == today - 1 -> "Hôm qua $hm"
            else -> SimpleDateFormat("dd/MM", Locale.US).format(Date(t))
        }
    }

    /** [[name, group, sub, time, kind, number], ...] */
    fun callLog(): JSONArray {
        val out = JSONArray()
        if (!has(Manifest.permission.READ_CALL_LOG)) return out
        try {
            a.contentResolver.query(CallLog.Calls.CONTENT_URI, arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.CACHED_NAME, CallLog.Calls.TYPE, CallLog.Calls.DATE, CallLog.Calls.DURATION),
                null, null, CallLog.Calls.DATE + " DESC")?.use { cur: Cursor ->
                var n = 0
                while (cur.moveToNext() && n < 40) {
                    val num = cur.getString(0) ?: ""; val cached = cur.getString(1)
                    val type = cur.getInt(2); val date = cur.getLong(3); val dur = cur.getLong(4)
                    val c = contact(num)
                    val nm = cached?.takeIf { it.isNotBlank() } ?: c.first.ifBlank { num }
                    val kind = when (type) { CallLog.Calls.MISSED_TYPE, CallLog.Calls.REJECTED_TYPE -> "miss"; CallLog.Calls.OUTGOING_TYPE -> "out"; else -> "in" }
                    val sub = when (kind) { "miss" -> "Gọi nhỡ"; "out" -> "Gọi đi · " + (dur / 60) + " ph"; else -> "Gọi đến · " + (dur / 60) + " ph" }
                    out.put(JSONArray().put(nm).put(if (c.first.isBlank() && cached.isNullOrBlank()) "Số Lạ" else c.second).put(sub).put(whenTxt(date)).put(kind).put(num))
                    n++
                }
            }
        } catch (_: Exception) {}
        return out
    }

    /** SMS inbox rows: [name, group, 'sms', text, time, unread, key] */
    fun smsInbox(): List<Pair<Long, JSONArray>> {
        val out = ArrayList<Pair<Long, JSONArray>>()
        if (!has(Manifest.permission.READ_SMS)) return out
        try {
            a.contentResolver.query(Telephony.Sms.Inbox.CONTENT_URI, arrayOf(Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE, Telephony.Sms.READ),
                null, null, Telephony.Sms.DATE + " DESC")?.use { cur ->
                val seen = HashSet<String>()
                while (cur.moveToNext() && out.size < 25) {
                    val num = cur.getString(0) ?: continue
                    if (!seen.add(num)) continue
                    val c = contact(num)
                    out += cur.getLong(2) to JSONArray().put(c.first.ifBlank { num }).put(if (c.first.isBlank()) "Số Lạ" else c.second).put("sms")
                        .put(cur.getString(1) ?: "").put(whenTxt(cur.getLong(2))).put(if (cur.getInt(3) == 0) 1 else 0).put("sms:$num")
                }
            }
        } catch (_: Exception) {}
        return out
    }
}
