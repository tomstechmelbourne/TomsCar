package com.tomstechsolutions.car

import android.app.Notification
import android.app.RemoteInput
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import org.json.JSONObject

/**
 * Notification access: lets Tom's Car see what is playing (media sessions) and keep new messages from
 * WhatsApp, Messenger, Signal, Telegram and Google Messages so they show in the Liên Lạc tab.
 * Android does not let other apps read their old history – only new messages from now on.
 */
class MediaListener : NotificationListenerService() {

    companion object {
        val APPS = mapOf(
            "com.whatsapp" to "wa", "com.whatsapp.w4b" to "wa",
            "com.facebook.orca" to "msgr", "com.facebook.mlite" to "msgr",
            "org.thoughtcrime.securesms" to "signal",
            "org.telegram.messenger" to "tg", "org.telegram.messenger.web" to "tg",
            "com.google.android.apps.messaging" to "sms", "com.samsung.android.messaging" to "sms"
        )
        /** latest reply action per conversation key (only while Tom's Car runs) */
        val replies = HashMap<String, Notification.Action>()

        private fun store(c: Context) = c.getSharedPreferences("tomscar_msgs", Context.MODE_PRIVATE)

        /** rows: [name, group, app, text, time(ms), unread, key] newest first, one per conversation */
        fun load(c: Context, keepDays: Int): JSONArray {
            val arr = try { JSONArray(store(c).getString("rows", "[]")) } catch (_: Exception) { JSONArray() }
            if (keepDays <= 0) return arr
            val cut = System.currentTimeMillis() - keepDays * 86400000L
            val out = JSONArray()
            for (i in 0 until arr.length()) { val r = arr.getJSONArray(i); if (r.optLong(4) >= cut) out.put(r) }
            if (out.length() != arr.length()) store(c).edit().putString("rows", out.toString()).apply()
            return out
        }

        fun markRead(c: Context) {
            val arr = load(c, 0)
            for (i in 0 until arr.length()) arr.getJSONArray(i).put(5, 0)
            store(c).edit().putString("rows", arr.toString()).apply()
        }

        fun reply(c: Context, key: String, text: String): Boolean {
            val act = replies[key] ?: return false
            val ri = act.remoteInputs?.firstOrNull() ?: return false
            return try {
                val i = Intent(); val b = Bundle(); b.putCharSequence(ri.resultKey, text)
                RemoteInput.addResultsToIntent(arrayOf(ri), i, b)
                act.actionIntent.send(c, 0, i); true
            } catch (_: Exception) { false }
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val app = APPS[sbn.packageName] ?: return
        val n = sbn.notification ?: return
        if (n.flags and Notification.FLAG_GROUP_SUMMARY != 0) return
        val ex = n.extras ?: return
        val title = ex.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE)?.toString()
            ?: ex.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: return
        val text = (ex.getCharSequence(Notification.EXTRA_TEXT) ?: ex.getCharSequence(Notification.EXTRA_BIG_TEXT))?.toString() ?: return
        if (text.isBlank()) return
        val key = app + ":" + title
        n.actions?.firstOrNull { a -> a.remoteInputs?.isNotEmpty() == true }?.let { replies[key] = it }
        val c = applicationContext
        val arr = load(c, 0)
        val out = JSONArray()
        var unread = 1
        for (i in 0 until arr.length()) {
            val r = arr.getJSONArray(i)
            if (r.optString(6) == key) { unread = r.optInt(5) + 1; continue }
            out.put(r)
        }
        val row = JSONArray().put(title).put("Bạn Bè").put(app).put(text).put(System.currentTimeMillis()).put(unread).put(key)
        val res = JSONArray().put(row)
        for (i in 0 until minOf(out.length(), 60)) res.put(out.get(i))
        store(c).edit().putString("rows", res.toString()).apply()
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}
}
