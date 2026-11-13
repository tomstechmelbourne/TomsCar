package com.tomstechsolutions.car

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.media.AudioManager
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

class MainActivity : Activity() {

    private lateinit var web: WebView
    private val main = Handler(Looper.getMainLooper())
    private val bg = Executors.newSingleThreadExecutor()
    private val prefs by lazy { getSharedPreferences("tomscar", Context.MODE_PRIVATE) }

    private var obd: Obd? = null
    private var location: Location? = null
    private var lastGeo: Location? = null
    private var place: JSONObject? = null
    private var ready = false

    // ---------------------------------------------------------------- lifecycle
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        immersive()

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        web.setBackgroundColor(0xFF010407.toInt())
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.mediaPlaybackRequiresUserGesture = false
        web.overScrollMode = View.OVER_SCROLL_NEVER
        web.isVerticalScrollBarEnabled = false
        web.isHorizontalScrollBarEnabled = false
        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest) =
                loader.shouldInterceptRequest(request.url)
        }
        web.addJavascriptInterface(Bridge(), "TCNative")
        setContentView(web)
        web.loadUrl("https://appassets.androidplatform.net/assets/web/index.html")

        askPermissions()
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        obd = Obd(bm?.adapter) { prefs.getString("obd", null) }
    }

    override fun onResume() {
        super.onResume()
        immersive()
        startLocation()
        if (hasBtPermission()) obd?.start()
        main.removeCallbacks(tick); main.post(tick)
    }

    override fun onDestroy() {
        main.removeCallbacks(tick)
        obd?.stop()
        try { (getSystemService(Context.LOCATION_SERVICE) as LocationManager).removeUpdates(locListener) } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) { super.onWindowFocusChanged(hasFocus); if (hasFocus) immersive() }

    @Deprecated("Back goes to the phone home instead of closing Tom's Car")
    override fun onBackPressed() { moveTaskToBack(true) }

    private fun immersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let {
                it.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN)
        }
    }

    // ---------------------------------------------------------------- permissions
    private fun askPermissions() {
        val want = mutableListOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
        if (Build.VERSION.SDK_INT >= 31) want += Manifest.permission.BLUETOOTH_CONNECT
        val missing = want.filter { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) requestPermissions(missing.toTypedArray(), 7)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        startLocation()
        if (hasBtPermission()) obd?.start()
    }

    private fun hasBtPermission() = Build.VERSION.SDK_INT < 31 ||
        checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED

    private fun hasLocation() = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    // ---------------------------------------------------------------- GPS
    private var locStarted = false
    private val locListener = LocationListener { l -> onLocation(l) }

    @SuppressLint("MissingPermission")
    private fun startLocation() {
        if (locStarted || !hasLocation()) return
        val lm = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        try {
            if (lm.allProviders.contains(LocationManager.GPS_PROVIDER))
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, locListener, Looper.getMainLooper())
            if (lm.allProviders.contains(LocationManager.NETWORK_PROVIDER))
                lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 5000L, 0f, locListener, Looper.getMainLooper())
            locStarted = true
            (lm.getLastKnownLocation(LocationManager.GPS_PROVIDER) ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER))?.let { onLocation(it) }
        } catch (_: Exception) {}
    }

    private fun onLocation(l: Location) {
        val prev = location
        // prefer GPS fixes; accept network fixes only when GPS is old
        if (prev != null && l.provider != LocationManager.GPS_PROVIDER && prev.provider == LocationManager.GPS_PROVIDER &&
            l.time - prev.time < 10000) return
        location = l
        val g = lastGeo
        if (g == null || g.distanceTo(l) > 250 || l.time - g.time > 60000) { lastGeo = l; geocode(l) }
    }

    private fun geocode(l: Location) {
        if (!Geocoder.isPresent()) return
        bg.execute {
            try {
                @Suppress("DEPRECATION")
                val a = Geocoder(this, Locale("en", "AU")).getFromLocation(l.latitude, l.longitude, 1)?.firstOrNull() ?: return@execute
                place = JSONObject().put("street", a.thoroughfare ?: a.featureName ?: "").put("suburb", a.locality ?: a.subAdminArea ?: "").put("state", a.adminArea ?: "")
            } catch (_: Exception) {}
        }
    }

    // ---------------------------------------------------------------- periodic push to the board
    private val tick = object : Runnable {
        override fun run() {
            if (ready) push()
            main.postDelayed(this, 1000L)
        }
    }

    private fun push() {
        val o = JSONObject()
        val l = location
        val fresh = l != null && System.currentTimeMillis() - l.time < 15000
        val ob = obd
        val obdSpeed = ob?.speed
        when {
            obdSpeed != null -> o.put("speed", obdSpeed)
            fresh && l!!.hasSpeed() -> o.put("speed", l.speed * 3.6)
            fresh -> o.put("speed", 0)
        }
        o.put("gps", fresh && l?.provider == LocationManager.GPS_PROVIDER)
        if (l != null) { o.put("lat", l.latitude); o.put("lon", l.longitude) }
        place?.let { o.put("place", it) }
        o.put("bat", battery())
        val bt = btDevices()
        o.put("devs", bt.first); o.put("bt", bt.second)
        if (ob != null && ob.connected) {
            o.put("obd", JSONObject().apply {
                ob.rpm?.let { put("rpm", it) }; ob.coolant?.let { put("coolant", it) }; ob.volt?.let { put("volt", it) }
                ob.speed?.let { put("speed", it) }; put("protocol", ob.protocol)
            })
        }
        media()?.let { o.put("media", it) }
        web.evaluateJavascript("window.tcLive && tcLive(" + JSONObject.quote(o.toString()) + ")", null)
    }

    private fun battery(): JSONObject {
        val i = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val lvl = i?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = i?.getIntExtra(BatteryManager.EXTRA_SCALE, 100) ?: 100
        val plugged = (i?.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0) ?: 0) != 0
        val temp = (i?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0) / 10.0
        return JSONObject().put("level", if (lvl >= 0) lvl * 100 / scale.coerceAtLeast(1) else 0)
            .put("charging", plugged).put("hot", temp >= 42.0).put("temp", temp)
    }

    /** Connected Bluetooth devices with their battery level (when the device reports it). */
    @SuppressLint("MissingPermission")
    private fun btDevices(): Pair<JSONArray, Boolean> {
        val arr = JSONArray()
        if (!hasBtPermission()) return arr to false
        val adapter = (getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter ?: return arr to false
        if (!adapter.isEnabled) return arr to false
        val bonded: Set<BluetoothDevice> = try { adapter.bondedDevices ?: emptySet() } catch (_: SecurityException) { emptySet() }
        var any = false
        for (d in bonded) {
            val on = try { d.javaClass.getMethod("isConnected").invoke(d) as Boolean } catch (_: Exception) { false }
            if (!on) continue
            any = true
            val name = try { d.name ?: "Bluetooth" } catch (_: SecurityException) { "Bluetooth" }
            if (name.lowercase().let { n -> listOf("obd", "elm", "veepeak", "vgate", "obdlink").any { n.contains(it) } }) continue
            val lvl = try { d.javaClass.getMethod("getBatteryLevel").invoke(d) as Int } catch (_: Exception) { -1 }
            val major = try { d.bluetoothClass?.majorDeviceClass ?: 0 } catch (_: Exception) { 0 }
            val dev = try { d.bluetoothClass?.deviceClass ?: 0 } catch (_: Exception) { 0 }
            val type = when {
                major == 0x0700 -> "watch"                                  // WEARABLE
                dev == 0x0414 || dev == 0x0428 -> "speaker"                  // loudspeaker / hifi
                major == 0x0400 -> "audio"                                   // AUDIO_VIDEO
                else -> "other"
            }
            arr.put(JSONObject().put("name", name).put("type", type).put("level", lvl))
        }
        return arr to (any || adapter.getProfileConnectionState(BluetoothProfile.A2DP) == BluetoothProfile.STATE_CONNECTED)
    }

    // ---------------------------------------------------------------- music (any player)
    private fun hasNotifAccess(): Boolean {
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners") ?: return false
        return flat.contains(packageName)
    }

    private fun controller(): MediaController? {
        if (!hasNotifAccess()) return null
        return try {
            val msm = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
            val list = msm.getActiveSessions(ComponentName(this, MediaListener::class.java))
            list.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING } ?: list.firstOrNull()
        } catch (_: Exception) { null }
    }

    private fun media(): JSONObject? {
        val c = controller() ?: return null
        val md = c.metadata ?: return null
        val title = md.getString(MediaMetadata.METADATA_KEY_TITLE) ?: return null
        val app = try { packageManager.getApplicationLabel(packageManager.getApplicationInfo(c.packageName, 0)).toString() } catch (_: Exception) { c.packageName }
        return JSONObject().put("title", title)
            .put("artist", md.getString(MediaMetadata.METADATA_KEY_ARTIST) ?: md.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST) ?: "")
            .put("playing", c.playbackState?.state == PlaybackState.STATE_PLAYING)
            .put("app", app)
    }

    private fun mediaKey(code: Int) {
        val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, code))
        am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, code))
    }

    private fun mediaAction(a: String) {
        val c = controller()
        when (a) {
            "prev" -> c?.transportControls?.skipToPrevious() ?: mediaKey(KeyEvent.KEYCODE_MEDIA_PREVIOUS)
            "next" -> c?.transportControls?.skipToNext() ?: mediaKey(KeyEvent.KEYCODE_MEDIA_NEXT)
            "toggle" -> {
                if (c == null) mediaKey(KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE)
                else if (c.playbackState?.state == PlaybackState.STATE_PLAYING) c.transportControls.pause() else c.transportControls.play()
            }
            "volume" -> (getSystemService(Context.AUDIO_SERVICE) as AudioManager)
                .adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_SAME, AudioManager.FLAG_SHOW_UI)
        }
        main.postDelayed({ if (ready) push() }, 400)
    }

    // ---------------------------------------------------------------- settings
    @SuppressLint("MissingPermission")
    private fun settings() {
        val ob = obd
        val obdLine = if (ob?.connected == true) "Cục OBD: đã nối (${ob.protocol})" else "Cục OBD: ${ob?.status ?: "chưa nối"}"
        val items = arrayOf(
            "Chọn cục OBD-II (Bluetooth)",
            "Cho phép đọc bài đang phát (quyền thông báo)",
            "Quyền vị trí / Bluetooth",
            "Mở Cài Đặt app trên điện thoại",
            "Giới thiệu: Tom's Car ${BuildConfig.VERSION_NAME}"
        )
        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("Cài Đặt Tom's Car\n$obdLine")
            .setItems(items) { _, w ->
                when (w) {
                    0 -> pickObd()
                    1 -> startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
                    2 -> askPermissions()
                    3 -> startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
                    4 -> web.evaluateJavascript("window.__tc && __tc.setState({intro:'about'})", null)
                }
            }
            .setNegativeButton("Đóng", null)
            .show()
    }

    @SuppressLint("MissingPermission")
    private fun pickObd() {
        if (!hasBtPermission()) { askPermissions(); return }
        val adapter = (getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter
        val devs: List<BluetoothDevice> = try { adapter?.bondedDevices?.toList() ?: emptyList() } catch (_: SecurityException) { emptyList() }
        if (devs.isEmpty()) { Launcher.toast(this, "Chưa ghép nối thiết bị Bluetooth nào. Vào Bluetooth của điện thoại để ghép cục OBD trước."); return }
        val names = devs.map { (try { it.name } catch (_: SecurityException) { null } ?: it.address) + "\n" + it.address }.toTypedArray()
        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("Chọn cục OBD-II")
            .setItems(names) { _, w ->
                prefs.edit().putString("obd", devs[w].address).apply()
                obd?.stop(); val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
                obd = Obd(bm?.adapter) { prefs.getString("obd", null) }.also { it.start() }
                Launcher.toast(this, "Đang nối cục OBD…")
            }
            .setNegativeButton("Đóng", null)
            .show()
    }

    // ---------------------------------------------------------------- JS bridge
    inner class Bridge {
        @JavascriptInterface
        fun call(action: String, arg: String) {
            main.post {
                when (action) {
                    "ready" -> {
                        ready = true
                        // Splash + About only on a fresh start, not when coming back to a running app
                        if (TomsCarApp.introShown) web.evaluateJavascript("window.__tc && __tc.setState({intro:null})", null)
                        TomsCarApp.introShown = true
                        push()
                    }
                    "settings" -> settings()
                    "media" -> mediaAction(arg)
                    "launch" -> Launcher.workspace(this@MainActivity, arg)
                    "nav" -> Launcher.navigate(this@MainActivity, arg)
                }
            }
        }
    }
}
