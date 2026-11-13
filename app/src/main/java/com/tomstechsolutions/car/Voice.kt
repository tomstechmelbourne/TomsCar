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

    fun init() {
        tts = TextToSpeech(a) { st ->
            ttsOk = st == TextToSpeech.SUCCESS
            if (ttsOk) {
                val vi = Locale("vi", "VN")
                val r = tts?.setLanguage(vi) ?: TextToSpeech.LANG_NOT_SUPPORTED
                if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) tts?.language = Locale("en", "AU")
            }
        }
        if (hasMic()) loadHotword()
    }

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
            val rec = Recognizer(m, 16000.0f, "[\"hey tom\", \"hi tom\", \"hey thom\", \"[unk]\"]")
            val s = SpeechService(rec, 16000.0f)
            s.startListening(object : org.vosk.android.RecognitionListener {
                override fun onPartialResult(h: String?) { if (h != null && isWake(h, "partial")) wake() }
                override fun onResult(h: String?) { if (h != null && isWake(h, "text")) wake() }
                override fun onFinalResult(h: String?) {}
                override fun onError(e: Exception?) { stopHotword() }
                override fun onTimeout() {}
            })
            hot = s
        } catch (_: Exception) { hot = null }
    }

    private fun isWake(json: String, key: String): Boolean {
        val t = try { JSONObject(json).optString(key) } catch (_: Exception) { "" }
        return t.contains("hey tom") || t.contains("hi tom") || t.contains("hey thom")
    }

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
                    override fun onReadyForSpeech(p: Bundle?) { emit(JSONObject().put("state", "listening")) }
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(v: Float) {}
                    override fun onBufferReceived(b: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(e: Int) {
                        emit(JSONObject().put("state", "error").put("text", if (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) "Không nghe rõ — bấm mic thử lại" else "Trợ lý chưa nghe được (lỗi $e)"))
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
        val b = Bundle(); b.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, b, "tc")
    }

    fun pause(p: Boolean) { paused = p; if (p) { stopHotword(); cancel() } else startHotword() }

    fun release() { stopHotword(); try { sr?.destroy() } catch (_: Exception) {}; tts?.shutdown() }
}
