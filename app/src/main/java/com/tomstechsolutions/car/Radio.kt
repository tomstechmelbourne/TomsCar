package com.tomstechsolutions.car

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import org.json.JSONObject

/** Internet radio (the phone has no FM tuner). */
class Radio(private val c: Context) {
    private var mp: MediaPlayer? = null
    var name = ""; var url = ""; var playing = false; var err = ""
    private val am = c.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var focus: AudioFocusRequest? = null

    fun play(u: String, n: String) {
        stop(); if (u.isBlank()) { err = "Đài này chưa có link phát"; return }
        name = n; url = u; err = ""
        try {
            val p = MediaPlayer()
            p.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
            p.setDataSource(u)
            p.setOnPreparedListener { it.start(); playing = true }
            p.setOnErrorListener { _, _, _ -> playing = false; err = "Mất sóng — chuyển sang nhạc trong máy?"; true }
            p.setOnCompletionListener { playing = false }
            p.prepareAsync(); mp = p
            if (Build.VERSION.SDK_INT >= 26) {
                focus = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN).build().also { am.requestAudioFocus(it) }
            }
        } catch (e: Exception) { err = "Không mở được đài này" }
    }

    fun stop() {
        try { mp?.stop() } catch (_: Exception) {}
        try { mp?.release() } catch (_: Exception) {}
        mp = null; playing = false
        if (Build.VERSION.SDK_INT >= 26) focus?.let { am.abandonAudioFocusRequest(it) }
    }

    fun toggle() { if (playing) stop() else if (url.isNotBlank()) play(url, name) }

    fun json(): JSONObject = JSONObject().put("name", name).put("url", url).put("playing", playing).put("err", err)
}
