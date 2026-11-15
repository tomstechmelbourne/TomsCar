package com.tomstechsolutions.car

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

/** #65: parking reminder (1P / 2P / 4P) — a notification 10 minutes before the parking time runs out. */
class ParkAlarm : BroadcastReceiver() {
    override fun onReceive(ctx: Context, i: Intent) {
        val text = i.getStringExtra("text") ?: "Sắp hết giờ đậu xe"
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(NotificationChannel(CH, "Nhắc giờ đậu xe", NotificationManager.IMPORTANCE_HIGH))
        val open = PendingIntent.getActivity(ctx, 0, Intent(ctx, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT), PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(ctx, CH).setSmallIcon(R.mipmap.ic_launcher).setContentTitle("Tom's Car · Đậu xe").setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_HIGH).setAutoCancel(true).setContentIntent(open).build()
        try { nm.notify(42, n) } catch (_: SecurityException) {}
    }

    companion object {
        private const val CH = "park"
        fun set(ctx: Context, at: Long, text: String) {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val pi = PendingIntent.getBroadcast(ctx, 7, Intent(ctx, ParkAlarm::class.java).putExtra("text", text), PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
            am.cancel(pi)
            if (at <= System.currentTimeMillis()) return
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
    }
}
