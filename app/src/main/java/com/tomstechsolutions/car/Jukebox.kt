package com.tomstechsolutions.car

import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.browse.MediaBrowser
import android.media.session.MediaController
import android.os.Build

/**
 * Talks to Tom's Jukebox (com.tomstechsolutions.jukebox):
 *  - connects to its media service so ▶ can start / resume playback in the background,
 *  - sends "play" commands (playlist, album, artist, station, podcast, search) through its CarBridge,
 *  - asks for the library summary + current look; the answer comes back as JSON.
 */
class Jukebox(private val ctx: Context, private val onJson: (String) -> Unit) {
    companion object {
        const val PKG = "com.tomstechsolutions.jukebox"
        private val SERVICE = ComponentName(PKG, "$PKG.playback.PlaybackService")
    }

    private var browser: MediaBrowser? = null
    private var controller: MediaController? = null
    private var pendingPlay = false

    fun installed(): Boolean = try { ctx.packageManager.getPackageInfo(PKG, 0); true } catch (_: Exception) { false }

    private val rx = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { i.getStringExtra("json")?.let(onJson) }
    }

    fun start() {
        val f = IntentFilter("com.tomstechsolutions.car.JUKEBOX")
        if (Build.VERSION.SDK_INT >= 33) ctx.registerReceiver(rx, f, Context.RECEIVER_EXPORTED) else @Suppress("UnspecifiedRegisterReceiverFlag") ctx.registerReceiver(rx, f)
    }

    fun stop() {
        try { ctx.unregisterReceiver(rx) } catch (_: Exception) { }
        try { browser?.disconnect() } catch (_: Exception) { }
        browser = null; controller = null
    }

    private fun connect(then: () -> Unit) {
        controller?.let { then(); return }
        if (!installed()) return
        try {
            val b = MediaBrowser(ctx, SERVICE, object : MediaBrowser.ConnectionCallback() {
                override fun onConnected() {
                    try { controller = MediaController(ctx, browser!!.sessionToken) } catch (_: Exception) { }
                    then()
                }
                override fun onConnectionFailed() { bridge("play", "resume", "") }
                override fun onConnectionSuspended() { controller = null }
            }, null)
            browser = b; b.connect()
        } catch (_: Exception) { bridge("play", "resume", "") }
    }

    /** Resume whatever Jukebox played last, without opening its screen. */
    fun resume() {
        if (!installed()) return
        pendingPlay = true
        connect {
            if (pendingPlay) { pendingPlay = false; controller?.transportControls?.play() ?: bridge("play", "resume", "") }
        }
        // the bridge also resumes, in case the session refuses a cold start
        bridge("play", "resume", "")
    }

    fun pause() { connect { controller?.transportControls?.pause() } }
    fun next() { connect { controller?.transportControls?.skipToNext() } }
    fun prev() { connect { controller?.transportControls?.skipToPrevious() } }

    fun play(kind: String, name: String) = bridge("play", kind, name)
    fun query() = bridge("query", "", "")

    private fun bridge(cmd: String, kind: String, name: String) {
        if (!installed()) return
        try {
            ctx.sendBroadcast(Intent("$PKG.CAR").setPackage(PKG).putExtra("cmd", cmd).putExtra("kind", kind).putExtra("name", name))
        } catch (_: Exception) { }
    }

    /** Last resort: open Jukebox, ask it to play, come back. */
    fun openAndPlay(back: () -> Unit) {
        val i = ctx.packageManager.getLaunchIntentForPackage(PKG) ?: return
        try { ctx.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) { return }
        bridge("play", "resume", "")
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(back, 1800)
    }
}
