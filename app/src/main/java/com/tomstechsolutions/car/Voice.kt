package com.tomstechsolutions.car

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioManager
import android.media.ToneGenerator
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

    private fun applyVoice() {
        val t = tts ?: return
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
                override fun onPartialResult(h: String?) {}
                override fun onResult(h: String?) { if (h != null && isWake(h)) wake() }
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

    fun stopHotword() {
        try { hot?.stop(); hot?.shutdown() } catch (_: Exception) {}
        hot = null
    }

    private fun wake() { main.post { if (!busy) listen() } }

    /** Hear one command (button, steering-wheel button or "Hey Tom"). */
    fun listen() {
        if (!hasMic()) { emit(JSONObject().put("state", "error").put("text", "Cần cấp quyền micro (Cài Đặt → Quyền)")); return }
        if (!SpeechRecognizer.isRecognitionAvailable(a)) { emit(JSONObject().put("state", "error").put("text", "Máy chưa có bộ nhận giọng nói của Google")); return }
        busy = true; stopHotword()
        beep()
        main.postDelayed({
            try {
                sr?.destroy()
                val r = SpeechRecognizer.createSpeechRecognizer(a); sr = r
                r.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(p: Bundle?) {
                        heardSomething = false; emit(JSONObject().put("state", "listening"))
                        main.postDelayed({ if (busy && !heardSomething) { try { sr?.cancel() } catch (_: Exception) {}; emit(JSONObject().put("state", "closed")); done() } }, 3500)
                    }
                    override fun onBeginningOfSpeech() { heardSomething = true }
                    override fun onRmsChanged(v: Float) {}
                    override fun onBufferReceived(b: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(e: Int) {
                        if (!busy) return
                        if (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) emit(JSONObject().put("state", if (heardSomething) "error" else "closed").put("text", "Không nghe rõ — bấm mic thử lại"))
                        else emit(JSONObject().put("state", "error").put("text", "Trợ lý chưa nghe được (lỗi $e)"))
                        done()
                    }
                    override fun onResults(b: Bundle?) {
                        val t = b?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: ""
                        emit(JSONObject().put("state", "result").put("text", t)); done()
                    }
                    override fun onPartialResults(b: Bundle?) {
                        val t = b?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: return
                        emit(JSONObject().put("state", "partial").put("text", t))
                    }
                    override fun onEvent(t: Int, p: Bundle?) {}
                })
                val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                    .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "vi-VN")
                    .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                    .putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", arrayOf("en-AU"))
                r.startListening(i)
            } catch (e: Exception) { emit(JSONObject().put("state", "error").put("text", "Trợ lý lỗi: ${e.message}")); done() }
        }, 250)
    }

    fun cancel() { try { sr?.cancel() } catch (_: Exception) {}; done() }

    private fun done() { busy = false; main.postDelayed({ startHotword() }, 600) }

    private fun beep() { try { val t = ToneGenerator(AudioManager.STREAM_MUSIC, 40); t.startTone(ToneGenerator.TONE_PROP_BEEP, 120); main.postDelayed({ t.release() }, 400) } catch (_: Exception) {} }

    fun say(text: String) {
        if (!ttsOk) return
        if (!viReady) { emit(JSONObject().put("state", "tts").put("ok", true).put("vi", false).put("google", hasGoogleTts())); return }
        val b = Bundle(); b.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, b, "tc")
    }

    fun pause(p: Boolean) { paused = p; if (p) { stopHotword(); cancel() } else startHotword() }

    fun release() { stopHotword(); try { sr?.destroy() } catch (_: Exception) {}; tts?.shutdown() }
}
