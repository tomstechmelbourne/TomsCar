package com.tomstechsolutions.car

import android.service.notification.NotificationListenerService

/**
 * Empty notification listener. Android only lets an app read "what is playing now"
 * (title, artist, play/pause) from other music apps when it has notification access,
 * which is granted through this service in Settings.
 */
class MediaListener : NotificationListenerService()
