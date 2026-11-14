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
            // DeX / freeform (Note 8 and newer): the apps share the whole DeX screen by the saved percentages, side by side.
            // Tom's Car then steps aside to the taskbar instead of calling itself back to the front (#51) —
            // DeX does not resize a window that is already open, so bringing Tom's Car back would cover the apps.
            val area = screenArea(a)
            val w = area.width()
            val total = found.sumOf { it.second }.coerceAtLeast(1)
            var x = area.left
            found.forEachIndexed { i, (_, pct, intent) ->
                val ww = if (i == found.lastIndex) area.left + w - x else w * pct / total
                val r = Rect(x, area.top, x + ww, area.bottom); x += ww
                h.postDelayed({ start(a, intent, ActivityOptions.makeBasic().setLaunchBounds(r).toBundle(), false) }, i * 450L)
            }
            h.postDelayed({ try { a.moveTaskToBack(true) } catch (_: Exception) {} }, found.size * 450L + 250L)
        } else {
            // Phone / tablet (no DeX): Samsung split screen, top + bottom; Samsung decides the sizes (Tom drags the bar).
            // One app, or a phone that cannot split: the first app full screen.
            start(a, found[0].third, null, false)
            if (found.size == 1) return
            h.postDelayed({ start(a, found[1].third, null, true) }, 900L)
            if (found.size > 2) h.postDelayed({ toast(a, "Điện thoại chỉ chia được 2 app — app thứ 3 mở khi cắm DeX") }, 1200L)
        }
    }

    /** Usable screen: the whole display minus the DeX taskbar / system bars. */
    fun screenArea(a: Activity): Rect {
        return if (android.os.Build.VERSION.SDK_INT >= 30) {
            val wm = a.windowManager.maximumWindowMetrics
            val ins = wm.windowInsets.getInsetsIgnoringVisibility(android.view.WindowInsets.Type.systemBars() or android.view.WindowInsets.Type.displayCutout())
            Rect(wm.bounds.left + ins.left, wm.bounds.top + ins.top, wm.bounds.right - ins.right, wm.bounds.bottom - ins.bottom)
        } else {
            val dm = android.util.DisplayMetrics()
            @Suppress("DEPRECATION") a.windowManager.defaultDisplay.getRealMetrics(dm)
            val taskbar = (48 * dm.density).toInt()
            Rect(0, 0, dm.widthPixels, dm.heightPixels - taskbar)
        }
    }

    private fun reposition(a: Activity, r: Rect) {
        try {
            val i = Intent(a, a.javaClass).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            a.startActivity(i, ActivityOptions.makeBasic().setLaunchBounds(r).toBundle())
        } catch (_: Exception) {}
    }

    /** Road Trip + Bản Đồ: the map app beside Tom's Car. json = {frac, side, map} or "off". */
    fun split(a: Activity, arg: String) {
        if (arg == "off") { if (isDesktop(a)) reposition(a, screenArea(a)); return }
        val o = try { org.json.JSONObject(arg) } catch (_: Exception) { return }
        val frac = o.optDouble("frac", 0.36).coerceIn(0.05, 0.8)
        val key = when (o.optString("map")) { "gmaps" -> "maps"; "here" -> "here"; else -> "waze" }
        val intent = launchIntent(a, key) ?: run { toast(a, "Chưa cài app bản đồ"); return }
        if (isDesktop(a)) {
            val area = screenArea(a)
            val carW = (area.width() * frac).toInt()
            val left = o.optString("side") != "right"   // map on the left by default
            val mapR = if (left) Rect(area.left, area.top, area.right - carW, area.bottom) else Rect(area.left + carW, area.top, area.right, area.bottom)
            val carR = if (left) Rect(area.right - carW, area.top, area.right, area.bottom) else Rect(area.left, area.top, area.left + carW, area.bottom)
            start(a, intent, ActivityOptions.makeBasic().setLaunchBounds(mapR).toBundle(), false)
            Handler(Looper.getMainLooper()).postDelayed({ reposition(a, carR) }, 600)
        } else {
            start(a, intent, null, true)   // phone / tablet: Android split screen
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
        val ll = Regex("^-?\\d+\\.\\d+,-?\\d+\\.\\d+$").matches(address.trim())
        val tries = listOf(
            Intent(Intent.ACTION_VIEW, Uri.parse(if (ll) "https://waze.com/ul?ll=${address.trim()}&navigate=yes" else "https://waze.com/ul?q=$q&navigate=yes")).setPackage("com.waze"),
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
