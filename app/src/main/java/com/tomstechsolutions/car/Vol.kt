package com.tomstechsolutions.car

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper

/** 0.9.11 (#100): music volume for the bar's 🔊 button — set / mute, follows the phone and steering-wheel keys,
 *  and remembers a level per output (car Bluetooth, headphones, phone speaker). */
class Vol(private val ctx: Context, private val changed: () -> Unit) {
    companion object { @Volatile var lifting = false }
    private val am = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val prefs = ctx.getSharedPreferences("vol", Context.MODE_PRIVATE)
    private val main = Handler(Looper.getMainLooper())
    var changedAt = 0L; private set
    private var muteFrom = -1
    private var outKey = ""
    private var restoring = false

    private val max get() = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)
    val percent: Int get() = Math.round(am.getStreamVolume(AudioManager.STREAM_MUSIC) * 100f / max)
    val muted: Boolean get() = am.getStreamVolume(AudioManager.STREAM_MUSIC) == 0

    fun set(p: Int) { val v = Math.round(p.coerceIn(0, 100) * max / 100f); am.setStreamVolume(AudioManager.STREAM_MUSIC, v, 0); if (v > 0) muteFrom = -1; save(); changedAt = System.currentTimeMillis(); changed() }
    fun step(d: Int) = set(percent + d)
    fun toggleMute() { if (muted) set(if (muteFrom > 0) muteFrom else 40) else { muteFrom = percent; set(0) } }

    private fun currentOut(): String {
        if (Build.VERSION.SDK_INT < 23) return "phone"
        val outs = am.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        outs.firstOrNull { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP }?.let { return "bt:" + (it.productName ?: "") }
        outs.firstOrNull { it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES || it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET || it.type == AudioDeviceInfo.TYPE_USB_HEADSET }?.let { return "wired" }
        return "phone"
    }
    private fun save() { if (!restoring && outKey.isNotEmpty()) prefs.edit().putInt(outKey, percent).apply() }
    private fun onOutChange() {
        val k = currentOut(); if (k == outKey) return; outKey = k
        val p = prefs.getInt(k, -1)
        if (p >= 0) { restoring = true; am.setStreamVolume(AudioManager.STREAM_MUSIC, Math.round(p * max / 100f), 0); restoring = false; changed() }
    }

    private val rx = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) {
            if (i.getIntExtra("android.media.EXTRA_VOLUME_STREAM_TYPE", -1) != AudioManager.STREAM_MUSIC) return
            if (restoring || lifting) return
            save(); changedAt = System.currentTimeMillis()
            changed()
        }
    }
    private val devCb = if (Build.VERSION.SDK_INT >= 23) object : AudioDeviceCallback() {
        override fun onAudioDevicesAdded(a: Array<out AudioDeviceInfo>?) { main.postDelayed({ onOutChange() }, 800) }
        override fun onAudioDevicesRemoved(a: Array<out AudioDeviceInfo>?) { main.postDelayed({ onOutChange() }, 800) }
    } else null

    fun start() {
        outKey = currentOut()
        val f = IntentFilter("android.media.VOLUME_CHANGED_ACTION")
        if (Build.VERSION.SDK_INT >= 33) ctx.registerReceiver(rx, f, Context.RECEIVER_NOT_EXPORTED) else ctx.registerReceiver(rx, f)
        if (Build.VERSION.SDK_INT >= 23) am.registerAudioDeviceCallback(devCb as AudioDeviceCallback, main)
    }
    fun stop() {
        try { ctx.unregisterReceiver(rx) } catch (_: Exception) {}
        if (Build.VERSION.SDK_INT >= 23) try { am.unregisterAudioDeviceCallback(devCb as AudioDeviceCallback) } catch (_: Exception) {}
    }
}
