package com.tomstechsolutions.car

import android.app.Activity
import android.app.ActivityOptions
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Rect
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import org.json.JSONArray

/** Opens the apps of a Workspace side by side, and starts navigation. */
object Launcher {

    /** Workspace keys from the board -> candidate packages, first installed one wins. */
    private val APPS = mapOf(
        "maps" to listOf("com.google.android.apps.maps", "com.waze"),
        "waze" to listOf("com.waze", "com.google.android.apps.maps"),
        "here" to listOf("com.here.app.maps"),
        "yt" to listOf("com.google.android.youtube"),
        "music" to listOf("com.tomstechsolutions.jukebox", "com.google.android.apps.youtube.music", "com.spotify.music"),
        "shield" to listOf("com.tomstechsolutions.shield")
    )

    private fun launchIntent(a: Activity, key: String): Intent? {
        val pm = a.packageManager
        for (p in APPS[key] ?: listOf(key)) {
            val i = pm.getLaunchIntentForPackage(p)
            if (i != null) return i
        }
        return null
    }

    private fun isDesktop(a: Activity): Boolean {
        // Samsung DeX and other desktop / freeform windowing
        val cfg = a.resources.configuration
        val dex = try {
            val c = cfg.javaClass
            c.getField("semDesktopModeEnabled").getInt(cfg) == c.getField("SEM_DESKTOP_MODE_ENABLED").getInt(null)
        } catch (_: Exception) { false }
        return dex || a.packageManager.hasSystemFeature(PackageManager.FEATURE_FREEFORM_WINDOW_MANAGEMENT) && a.isInMultiWindowMode
    }

    /** json = [["maps",60],["music",40]] (key, percent of the width). */
    fun workspace(a: Activity, json: String) {
        val arr = try { JSONArray(json) } catch (_: Exception) { return }
        val items = (0 until arr.length()).map { arr.getJSONArray(it) }.map { it.getString(0) to it.getInt(1) }
        val found = items.mapNotNull { (k, pct) -> launchIntent(a, k)?.let { Triple(k, pct, it) } }
        if (found.isEmpty()) { toast(a, "Chưa cài app nào của Workspace này"); return }
        val missing = items.size - found.size
        if (missing > 0) toast(a, "Có $missing app chưa cài trên máy")

        val h = Handler(Looper.getMainLooper())
        if (isDesktop(a)) {
            // DeX / freeform: place each app in its own window, side by side by percentage
            val w = a.window.decorView.rootView.width.takeIf { it > 0 } ?: a.resources.displayMetrics.widthPixels
            val ht = a.window.decorView.rootView.height.takeIf { it > 0 } ?: a.resources.displayMetrics.heightPixels
            val total = found.sumOf { it.second }.coerceAtLeast(1)
            var x = 0
            found.forEachIndexed { i, (_, pct, intent) ->
                val ww = if (i == found.lastIndex) w - x else w * pct / total
                val r = Rect(x, 0, x + ww, ht); x += ww
                h.postDelayed({ start(a, intent, ActivityOptions.makeBasic().setLaunchBounds(r).toBundle(), false) }, i * 450L)
            }
        } else {
            // Phone / tablet: first app full screen, second app next to it (split screen where the phone allows)
            start(a, found[0].third, null, false)
            if (found.size > 1) h.postDelayed({ start(a, found[1].third, null, true) }, 900L)
        }
    }

    private fun start(a: Activity, intent: Intent, opts: android.os.Bundle?, adjacent: Boolean) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (adjacent) intent.addFlags(Intent.FLAG_ACTIVITY_LAUNCH_ADJACENT or Intent.FLAG_ACTIVITY_MULTIPLE_TASK)
        try { a.startActivity(intent, opts) } catch (_: Exception) { try { a.startActivity(intent) } catch (_: Exception) {} }
    }

    /** Navigate with Waze (main), else Google Maps, else any map app. */
    fun navigate(a: Activity, address: String) {
        val q = Uri.encode(address)
        val tries = listOf(
            Intent(Intent.ACTION_VIEW, Uri.parse("https://waze.com/ul?q=$q&navigate=yes")).setPackage("com.waze"),
            Intent(Intent.ACTION_VIEW, Uri.parse("google.navigation:q=$q")).setPackage("com.google.android.apps.maps"),
            Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$q"))
        )
        for (i in tries) {
            try { a.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); return } catch (_: ActivityNotFoundException) {}
        }
        toast(a, "Chưa có app bản đồ")
    }

    fun toast(a: Activity, s: String) = Toast.makeText(a, s, Toast.LENGTH_SHORT).show()
}
