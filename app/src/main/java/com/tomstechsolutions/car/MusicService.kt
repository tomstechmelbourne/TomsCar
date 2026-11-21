package com.tomstechsolutions.car

import android.app.PendingIntent
import android.content.Intent
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

/**
 * 0.9.15 (#138): background playback for the music built into Tom's Car (songs in the phone, radio, podcasts).
 * The session is what the car's Bluetooth buttons, steering-wheel buttons, headsets and the lock screen control.
 * Audio focus is handled by the player: a phone call pauses it and it plays on after the call; the navigation
 * voice makes it duck.
 */
@OptIn(UnstableApi::class)
class MusicService : MediaSessionService() {
    private var session: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val p = ExoPlayer.Builder(this)
            .setAudioAttributes(AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MUSIC).build(), true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .build()
        p.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) { if (!isPlaying) Music.saveLast() }
            override fun onMediaItemTransition(mediaItem: androidx.media3.common.MediaItem?, reason: Int) { Music.saveLast() }
        })
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        session = MediaSession.Builder(this, p).setSessionActivity(open).setCallback(object : MediaSession.Callback {
            // items come from Tom's Car with the address in mediaId; rebuild the playable address here
            override fun onAddMediaItems(s: MediaSession, c: MediaSession.ControllerInfo, items: MutableList<androidx.media3.common.MediaItem>) =
                com.google.common.util.concurrent.Futures.immediateFuture(items.map { it.buildUpon().setUri(it.localConfiguration?.uri ?: android.net.Uri.parse(it.mediaId)).build() }.toMutableList())
        }).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = session

    override fun onTaskRemoved(rootIntent: Intent?) {
        val p = session?.player
        if (p == null || !p.playWhenReady || p.mediaItemCount == 0) stopSelf()
    }

    override fun onDestroy() {
        Music.saveLast()
        session?.run { player.release(); release() }
        session = null
        super.onDestroy()
    }
}
