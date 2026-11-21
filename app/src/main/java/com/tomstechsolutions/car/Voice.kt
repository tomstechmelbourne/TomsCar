package com.tomstechsolutions.car

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import org.json.JSONObject
import org.vosk.Model
import org.vosk.Recognizer
import org.vosk.android.SpeechService
import org.vosk.android.StorageService
import java.util.Locale

/**
 * Trợ lý giọng nói:
 *  - "Hey Tom" / "Hi Tom" is heard on the phone itself (Vosk, offline, nothing leaves the phone),
 *  - the command is then understood by Android's speech recogniser (Vietnamese, English as backup),
 *  - answers are spoken with the phone's text-to-speech voice.
 */
class Voice(private val a: Activity, private val emit: (JSONObject) -> Unit) {
    private val main = Handler(Looper.getMainLooper())
    private var tts: TextToSpeech? = null
    private var ttsOk = false
    private var sr: SpeechRecognizer? = null
    private var model: Model? = null
    private var hot: SpeechService? = null
    var hotwordWanted = true
    var busy = false          // a command is being heard
    var paused = false        // phone call etc.

    /** true when a Vietnamese voice is ready; false = missing (Settings shows "Tải Giọng Việt"). */
    var viReady = false
    var engine = ""
    private var rate = 1.0f
    private var pitch = 1.0f
    private var voiceName = ""
    // wake word tuning
    var sensitivity = 1          // 0 low, 1 medium, 2 high
    var muteWhenMusic = false    // "tạm tắt Hey Tom khi đang nghe nhạc to"
    private var lastWake = 0L
    private val wakeLog = ArrayList<String>()

    private val googleTts = "com.google.android.tts"
    private fun hasGoogleTts() = try { a.packageManager.getPackageInfo(googleTts, 0); true } catch (_: Exception) { false }

    fun init() {
        val listener = TextToSpeech.OnInitListener { st ->
            ttsOk = st == TextToSpeech.SUCCESS
            if (ttsOk) applyVoice()
            report()
        }
        tts = if (hasGoogleTts()) TextToSpeech(a, listener, googleTts) else TextToSpeech(a, listener)
        engine = if (hasGoogleTts()) googleTts else "default"
        if (hasMic()) loadHotword()
    }

    /** "vi" or "en" (0.9.10 #83: English mode speaks and listens in en-AU) */
    var lang = "vi"
    private fun applyVoice() {
        val t = tts ?: return
        if (lang == "en") { t.setLanguage(Locale("en", "AU")); viReady = true; t.setSpeechRate(rate); t.setPitch(pitch); return }
        val vi = Locale("vi", "VN")
        val r = t.setLanguage(vi)
        viReady = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED
        if (viReady && voiceName.isNotBlank()) try { t.voices?.firstOrNull { it.name == voiceName }?.let { t.voice = it } } catch (_: Exception) {}
        t.setSpeechRate(rate); t.setPitch(pitch)
    }

    /** Tell the screen which engine/voices we have (Cài Đặt → Trợ Lý, Quyền & Kết Nối). */
    fun report() {
        val list = org.json.JSONArray()
        try { tts?.voices?.filter { it.locale.language == "vi" }?.sortedBy { it.name }?.forEach { v ->
            list.put(JSONObject().put("name", v.name).put("offline", !v.isNetworkConnectionRequired)) } } catch (_: Exception) {}
        emit(JSONObject().put("state", "tts").put("ok", ttsOk).put("vi", viReady).put("google", hasGoogleTts()).put("voices", list).put("voice", voiceName))
    }

    /** Settings from the screen: {"rate":1,"pitch":1,"voice":"vi-vn-x-gft-local","sens":1,"muteMusic":false,"hot":true} */
    fun config(o: JSONObject) {
        rate = o.optDouble("rate", rate.toDouble()).toFloat(); pitch = o.optDouble("pitch", pitch.toDouble()).toFloat()
        voiceName = o.optString("voice", voiceName); sensitivity = o.optInt("sens", sensitivity)
        muteWhenMusic = o.optBoolean("muteMusic", muteWhenMusic)
        navVol = o.optInt("navVol", navVol).coerceIn(30, 100)
        lang = o.optString("lang", lang)
        clipVoice = o.optString("clip", clipVoice).let { if (it == "doan" || it == "son") it else "" }
        val hw = o.optBoolean("hot", hotwordWanted)
        if (hw != hotwordWanted) { hotwordWanted = hw; if (hw) startHotword() else stopHotword() }
        if (ttsOk) applyVoice()
    }

    /** Open the page that downloads the Vietnamese voice (Google engine, free, works offline). */
    fun installVi() {
        try {
            val i = Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (hasGoogleTts()) i.setPackage(googleTts)
            a.startActivity(i)
        } catch (_: Exception) {
            try { a.startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse("market://details?id=$googleTts")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {}
        }
    }

    fun recheck() { if (ttsOk) applyVoice(); report() }

    private fun hasMic() = a.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

    private fun loadHotword() {
        if (model != null) { startHotword(); return }
        try {
            StorageService.unpack(a, "model-en", "model", { m: Model -> model = m; main.post { startHotword() } }, { _: java.io.IOException -> })
        } catch (_: Exception) {}
    }

    fun startHotword() {
        val m = model ?: return
        if (!hotwordWanted || busy || paused || hot != null || !hasMic()) return
        try {
            // a wider word list gives the recogniser somewhere else to put music / chatter,
            // so it does not force every sound into "hey tom"
            val rec = Recognizer(m, 16000.0f, "[\"hey tom\", \"hi tom\", \"hey\", \"hi\", \"tom\", \"okay\", \"hello\", \"time\", \"stop\", \"the\", \"a\", \"[unk]\"]")
            rec.setWords(true)
            val s = SpeechService(rec, 16000.0f)
            s.startListening(object : org.vosk.android.RecognitionListener {
                // 0.9.12 (#110): react while "hey tom" is still being heard (2 partial hits in a row), not after the pause
                override fun onPartialResult(h: String?) {
                    if (sensitivity == 0 || h == null) return
                    val t = try { JSONObject(h).optString("partial").trim() } catch (_: Exception) { "" }
                    if (t.endsWith("hey tom") || t.endsWith("hi tom")) { partHits++; if (partHits >= 2 && System.currentTimeMillis() - lastWake > 5000) { lastWake = System.currentTimeMillis(); partHits = 0; wake() } } else partHits = 0
                }
                override fun onResult(h: String?) { partHits = 0; if (h != null && isWake(h)) wake() }
                override fun onFinalResult(h: String?) {}
                override fun onError(e: Exception?) { stopHotword() }
                override fun onTimeout() {}
            })
            hot = s
        } catch (_: Exception) { hot = null }
    }

    /** Only a whole "hey tom" / "hi tom" heard with good confidence counts. */
    private fun isWake(json: String): Boolean {
        val o = try { JSONObject(json) } catch (_: Exception) { return false }
        val t = o.optString("text").trim()
        if (!(t == "hey tom" || t == "hi tom" || t.endsWith(" hey tom") || t.endsWith(" hi tom"))) return false
        val words = o.optJSONArray("result") ?: return false
        var tom = 0.0; var greet = 0.0
        for (i in 0 until words.length()) { val w = words.getJSONObject(i); when (w.optString("word")) { "tom" -> tom = w.optDouble("conf"); "hey", "hi" -> greet = w.optDouble("conf") } }
        val need = when (sensitivity) { 0 -> 0.97; 2 -> 0.80; else -> 0.92 }
        val ok = tom >= need && greet >= need - 0.1
        val now = System.currentTimeMillis()
        if (ok && now - lastWake < 5000) return false
        if (ok && muteWhenMusic) {
            val am = a.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
            if (am.isMusicActive && am.getStreamVolume(AudioManager.STREAM_MUSIC) > am.getStreamMaxVolume(AudioManager.STREAM_MUSIC) * 0.6) return false
        }
        if (ok) {
            lastWake = now
            val stamp = java.text.SimpleDateFormat("HH:mm:ss", Locale.US).format(java.util.Date())
            wakeLog.add(0, "$stamp · \"$t\" · ${(tom * 100).toInt()}%"); while (wakeLog.size > 20) wakeLog.removeAt(wakeLog.size - 1)
            emit(JSONObject().put("state", "wakelog").put("log", org.json.JSONArray(wakeLog)))
        }
        return ok
    }

    private var heardSomething = false
    private var partHits = 0
    private var lastPartial = ""
    private var partialAt = 0L
    private var offlineOk = true   // the phone's own Vietnamese recogniser works without internet; off after it fails once
    private var srGen = 0

    fun stopHotword() {
        try { hot?.stop(); hot?.shutdown() } catch (_: Exception) {}
        hot = null
    }

    private fun wake() { main.post { if (!busy) listen() } }

    /** Hear one command (button, steering-wheel button or "Hey Tom"). */
    fun listen() {
        if (!hasMic()) { emit(JSONObject().put("state", "error").put("text", "Cần cấp quyền micro (Cài Đặt → Quyền)")); return }
        if (!SpeechRecognizer.isRecognitionAvailable(a)) { emit(JSONObject().put("state", "error").put("text", if (lang == "en") "This phone has no Google speech recogniser" else "Máy chưa có bộ nhận giọng nói của Google")); return }
        busy = true; stopHotword()
        beep(); emit(JSONObject().put("state", "listening"))
        main.postDelayed({ startSr(offlineOk) }, 120)
    }

    /** 0.9.12 (#110): listen at most ~7 s; when the words stop changing for 1.2 s, take them — noise in the car
     *  (engine, fan) no longer keeps the recogniser waiting for silence for up to a minute. */
    private fun startSr(offline: Boolean) {
            val gen = ++srGen
            lastPartial = ""; partialAt = 0L
            main.postDelayed({ if (busy && gen == srGen) finishWith(lastPartial) }, 9000)   // even if the recogniser never answers
            try {
                sr?.destroy()
                val r = SpeechRecognizer.createSpeechRecognizer(a); sr = r
                r.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(p: Bundle?) {
                        heardSomething = false; emit(JSONObject().put("state", "listening"))
                        main.postDelayed({ if (busy && gen == srGen && !heardSomething && lastPartial.isEmpty()) { try { sr?.cancel() } catch (_: Exception) {}; emit(JSONObject().put("state", "closed")); done() } }, 4000)
                        main.postDelayed({ if (busy && gen == srGen) finishWith(lastPartial) }, 7500)   // hard limit
                    }
                    override fun onBeginningOfSpeech() { heardSomething = true }
                    override fun onRmsChanged(v: Float) {}
                    override fun onBufferReceived(b: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(e: Int) {
                        if (!busy || gen != srGen) return
                        // the phone has no offline Vietnamese pack (or it failed): ask Google online once, and remember
                        if (offline && (e == 12 || e == 13 || e == SpeechRecognizer.ERROR_SERVER || e == SpeechRecognizer.ERROR_CLIENT) && lastPartial.isEmpty()) { offlineOk = false; main.post { startSr(false) }; return }
                        if (lastPartial.isNotEmpty()) { finishWith(lastPartial); return }
                        if (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) emit(JSONObject().put("state", if (heardSomething) "error" else "closed").put("text", if (lang == "en") "Didn't catch that — tap the mic again" else "Không nghe rõ — bấm mic thử lại"))
                        else emit(JSONObject().put("state", "error").put("text", "Trợ lý chưa nghe được (lỗi $e)"))
                        done()
                    }
                    override fun onResults(b: Bundle?) {
                        if (!busy || gen != srGen) return
                        val t = b?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: ""
                        finishWith(if (t.isNotBlank()) t else lastPartial)
                    }
                    override fun onPartialResults(b: Bundle?) {
                        val t = b?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()?.trim() ?: return
                        if (t.isEmpty() || gen != srGen) return
                        emit(JSONObject().put("state", "partial").put("text", t))
                        if (t != lastPartial) { lastPartial = t; val at = System.currentTimeMillis(); partialAt = at
                            main.postDelayed({ if (busy && gen == srGen && partialAt == at) { try { sr?.stopListening() } catch (_: Exception) {}; main.postDelayed({ if (busy && gen == srGen) finishWith(lastPartial) }, 900) } }, 1200) }
                    }
                    override fun onEvent(t: Int, p: Bundle?) {}
                })
                val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                    .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    .putExtra(RecognizerIntent.EXTRA_LANGUAGE, if (lang == "en") "en-AU" else "vi-VN")
                    .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                    .putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("en-AU"))
                    .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, offline)
                    .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 900L)
                    .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 700L)
                r.startListening(i)
            } catch (e: Exception) { emit(JSONObject().put("state", "error").put("text", "Trợ lý lỗi: ${e.message}")); done() }
    }

    private fun finishWith(t: String) {
        if (!busy) return
        srGen++   // ignore anything the old recogniser still sends
        try { sr?.cancel() } catch (_: Exception) {}
        if (t.isNotBlank()) emit(JSONObject().put("state", "result").put("text", t))
        else emit(JSONObject().put("state", "error").put("text", if (lang == "en") "Didn't catch that — say it again" else "Mình chưa nghe rõ, nói lại giúp mình nha"))
        done()
    }

    fun cancel() { try { sr?.cancel() } catch (_: Exception) {}; done() }

    private fun done() { busy = false; main.postDelayed({ startHotword() }, 600) }

    private fun beep() { try { val t = ToneGenerator(AudioManager.STREAM_MUSIC, 40); t.startTone(ToneGenerator.TONE_PROP_BEEP, 120); main.postDelayed({ t.release() }, 400) } catch (_: Exception) {} }

    // ---- #77: pre-recorded southern voice (VieNeu · Thục Đoan / Thái Sơn) for fixed phrases ----
    var clipVoice = ""   // "", "doan", "son"
    private var clipKeys: Map<String, Int>? = null
    private var clipPlayer: android.media.MediaPlayer? = null
    private fun clipIndex(): Map<String, Int> {
        clipKeys?.let { return it }
        val m = HashMap<String, Int>()
        try { val o = JSONObject(a.assets.open("voice/index.json").bufferedReader().readText()).getJSONObject("keys"); o.keys().forEach { k -> m[k] = o.getInt(k) } } catch (_: Exception) {}
        clipKeys = m; return m
    }
    /** All parts of the sentence must be recorded, otherwise the Google voice reads it all (no mixed voices). */
    private fun clipPlan(text: String): List<Int>? {
        if (clipVoice.isEmpty() || lang == "en") return null
        val idx = clipIndex(); if (idx.isEmpty()) return null
        val norm = text.lowercase().trim().trimEnd('.', '!', '?')
        idx[norm]?.let { return listOf(it) }
        val parts = norm.split(Regex("[,.] +")).map { it.trim().trimEnd('.', '!', '?') }.filter { it.isNotEmpty() }
        val ids = parts.map { idx[it] ?: return null }
        return ids
    }
    // 0.9.11 (#100): the voice keeps its own loudness — if music is turned low, lift the stream while speaking, then put it back.
    private var floorFrom = -1
    var navVol = 80   // 0.9.12 (#119): voice loudness (% of the phone's music volume), Cài Đặt › Chỉ đường
    private var focusReq: android.media.AudioFocusRequest? = null
    private fun duckOn() {   // music apps lower themselves while the voice speaks
        if (Build.VERSION.SDK_INT < 26 || focusReq != null) return
        try { val am = a.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
            val r = android.media.AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE).setContentType(android.media.AudioAttributes.CONTENT_TYPE_SPEECH).build()).build()
            am.requestAudioFocus(r); focusReq = r } catch (_: Exception) {}
    }
    private fun duckOff() {
        val r = focusReq ?: return; focusReq = null
        try { (a.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager).abandonAudioFocusRequest(r) } catch (_: Exception) {}
    }
    private fun floorOn() {
        duckOn()
        val am = a.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
        val mx = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC); val cur = am.getStreamVolume(AudioManager.STREAM_MUSIC)
        val want = Math.round(mx * navVol / 100f)
        if (floorFrom < 0 && cur < want) { floorFrom = cur; Vol.lifting = true; am.setStreamVolume(AudioManager.STREAM_MUSIC, want, 0) }
    }
    private fun floorOff() {
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ if (floorFrom < 0 && clipPlayer == null && tts?.isSpeaking != true) duckOff() }, 500)
        if (floorFrom < 0) return
        val am = a.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
        val f = floorFrom; floorFrom = -1
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ if (floorFrom < 0) { am.setStreamVolume(AudioManager.STREAM_MUSIC, f, 0); android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ if (floorFrom < 0) Vol.lifting = false }, 300) } }, 400)
    }
    private var ttsCbSet = false
    /** 0.9.15 (#145): a road name to read in English after the Vietnamese part ("Quẹo trái vô§Taylors Road") */
    private var tail: String? = null
    private fun sayTail(): Boolean {
        val n = tail ?: return false; tail = null
        val t = tts ?: return false
        if (!ttsOk) return false
        try { t.setLanguage(Locale("en", "AU")) } catch (_: Exception) {}
        val b = Bundle(); b.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC)
        ensureCb(); floorOn(); t.speak(n, TextToSpeech.QUEUE_FLUSH, b, "tcEn"); return true
    }
    private fun playClips(ids: List<Int>, i: Int = 0) {
        if (i >= ids.size) { clipPlayer?.release(); clipPlayer = null; if (!sayTail()) floorOff(); return }
        if (i == 0) floorOn()
        try {
            val fd = a.assets.openFd("voice/$clipVoice/${ids[i]}.mp3")
            val mp = android.media.MediaPlayer()
            mp.setAudioAttributes(android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE).setContentType(android.media.AudioAttributes.CONTENT_TYPE_SPEECH).build())
            mp.setDataSource(fd.fileDescriptor, fd.startOffset, fd.length); fd.close()
            mp.setOnCompletionListener { it.release(); if (clipPlayer === it) clipPlayer = null; playClips(ids, i + 1) }
            mp.prepare(); clipPlayer?.release(); clipPlayer = mp; mp.start()
        } catch (_: Exception) { clipPlayer = null; floorOff() }
    }

    fun say(text0: String) {
        val cut = text0.indexOf('§')
        tail = if (cut >= 0) text0.substring(cut + 1).trim().ifBlank { null } else null
        val text = if (cut >= 0) text0.substring(0, cut).trim() else text0
        if (text.isBlank()) { if (!sayTail()) floorOff(); return }
        val plan = clipPlan(text)
        if (plan != null) { tts?.stop(); playClips(plan); return }
        if (!ttsOk) return
        if (!viReady) { emit(JSONObject().put("state", "tts").put("ok", true).put("vi", false).put("google", hasGoogleTts())); return }
        val b = Bundle(); b.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC)
        ensureCb()
        floorOn()
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, b, "tc")
    }

    private fun ensureCb() {
        if (!ttsCbSet) { ttsCbSet = true; tts?.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
            override fun onStart(id: String?) {}
            override fun onDone(id: String?) { if (id == "tc") { if (!sayTail()) floorOff() } else if (id == "tcEn") { backToVi(); floorOff() } }
            @Deprecated("old api") override fun onError(id: String?) { if (id == "tc" || id == "tcEn") { if (id == "tcEn") backToVi(); tail = null; floorOff() } }
            override fun onStop(id: String?, interrupted: Boolean) { if (id == "tc" || id == "tcEn") { if (id == "tcEn") backToVi(); floorOff() } }
        }) }
    }
    private fun backToVi() { if (lang != "en") try { tts?.setLanguage(Locale("vi", "VN")) } catch (_: Exception) {} }

    fun pause(p: Boolean) { paused = p; if (p) { stopHotword(); cancel() } else startHotword() }

    fun release() { stopHotword(); try { sr?.destroy() } catch (_: Exception) {}; tts?.shutdown() }
}
