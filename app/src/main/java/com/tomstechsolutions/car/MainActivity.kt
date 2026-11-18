package com.tomstechsolutions.car

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.bluetooth.BluetoothAdapter
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
import android.os.SystemClock
import android.provider.Settings
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.provider.CalendarContract
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL
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
    // 0.9.10 (#90): judge freshness by when the fix ARRIVED (phone's own clock), never by the GPS time in the fix —
    // the Note 8's GPS chip can report a wrong date, which made every GPS fix look "old".
    private var locAt = 0L
    private var gpsAt = 0L
    private var fixSeq = 0L
    private var calcBrg: Float? = null
    private var calcSpd: Double? = null
    private var prevFix: Location? = null
    private var prevFixAt = 0L
    private var place: JSONObject? = null
    private var ready = false
    private lateinit var phone: Phone
    private lateinit var radio: Radio
    private lateinit var voice: Voice
    private lateinit var vol: Vol
    private var fileCb: ValueCallback<Array<Uri>>? = null
    private var appt: JSONObject? = null
    private var apptAt = 0L

    // ---------------------------------------------------------------- lifecycle
    @SuppressLint("SetJavaScriptEnabled")
    /** #56 / #127: the start-up sound — once per real start (after Thoát Hẳn or the app being swiped away), not when
     *  coming back from Chạy Nền. Plays on vibrate/silent too unless "silent":false; ducks music instead of skipping;
     *  waits up to ~3 s for car Bluetooth audio that is still connecting.
     *  arg = {"name":"chime_soft","vol":60,"silent":true,"test":false}; test = the "Nghe Thử" button in Settings. */
    private var chimePlayer: android.media.MediaPlayer? = null
    private fun chime(arg: String) {
        try {
            val o = org.json.JSONObject(arg); val test = o.optBoolean("test")
            val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            if (!test) {
                if (TomsCarApp.chimed) return
                TomsCarApp.chimed = true
                if (am.ringerMode != AudioManager.RINGER_MODE_NORMAL && !o.optBoolean("silent", true)) return
            }
            val name = o.optString("name", "chime_soft").replace(Regex("[^a-z_]"), "")
            val v = (o.optInt("vol", 60).coerceIn(0, 100)) / 100f
            if (test) { playChime(am, name, v); return }
            // wait for a car Bluetooth link that is still connecting (max ~3 s), then play
            var tries = 0
            val tick = object : Runnable { override fun run() {
                val connecting = try { val ad = (getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter
                    ad != null && ad.isEnabled && ad.getProfileConnectionState(android.bluetooth.BluetoothProfile.A2DP) == android.bluetooth.BluetoothProfile.STATE_CONNECTING } catch (_: Exception) { false }
                if (connecting && tries++ < 10) main.postDelayed(this, 300) else main.postDelayed({ playChime(am, name, v) }, if (tries > 0) 700L else 150L)
            } }
            tick.run()
        } catch (_: Exception) { }
    }
    private fun playChime(am: AudioManager, name: String, v: Float) {
        try {
            chimePlayer?.let { try { it.release() } catch (_: Exception) {} }
            val attrs = android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_MEDIA).setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            val focus = if (Build.VERSION.SDK_INT >= 26) android.media.AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK).setAudioAttributes(attrs).build() else null
            if (focus != null) am.requestAudioFocus(focus)
            val afd = assets.openFd("web/sounds/$name.ogg")
            val mp = android.media.MediaPlayer(); chimePlayer = mp
            mp.setAudioAttributes(attrs)
            mp.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length); afd.close()
            mp.setVolume(v, v)
            mp.setOnCompletionListener { it.release(); if (chimePlayer === it) chimePlayer = null; if (focus != null) am.abandonAudioFocusRequest(focus) }
            mp.prepare(); mp.start()
        } catch (_: Exception) { }
    }

    private fun buildWeb(loader: WebViewAssetLoader) {
        web = WebView(this)
        web.setBackgroundColor(0xFF010407.toInt())
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.mediaPlaybackRequiresUserGesture = false
        web.overScrollMode = View.OVER_SCROLL_NEVER
        web.isVerticalScrollBarEnabled = false
        web.isHorizontalScrollBarEnabled = false
        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(v: WebView, cb: ValueCallback<Array<Uri>>, p: FileChooserParams): Boolean {
                fileCb?.onReceiveValue(null); fileCb = cb
                val pick = Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("image/*")
                val cam = if (p.isCaptureEnabled) Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE) else null
                val chooser = if (cam != null) Intent.createChooser(pick, "Chọn hình").putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(cam)) else pick
                return try { startActivityForResult(chooser, 41); true } catch (_: Exception) { fileCb = null; false }
            }
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest) =
                loader.shouldInterceptRequest(request.url)
            // 0.9.11 (#102): Android killed the page's process (memory) — build a new page instead of closing the app.
            override fun onRenderProcessGone(view: WebView, detail: android.webkit.RenderProcessGoneDetail?): Boolean {
                val why = if (Build.VERSION.SDK_INT >= 26 && detail != null) (if (detail.didCrash()) "renderer crashed" else "renderer killed for memory") else "renderer gone"
                logCrash("WebView: $why")
                ready = false
                try { (view.parent as? android.view.ViewGroup)?.removeView(view); view.destroy() } catch (_: Exception) {}
                main.post { buildWeb(loader); immersive() }
                return true
            }
        }
        web.addJavascriptInterface(Bridge(), "TCNative")
        setContentView(web)
        web.loadUrl("https://appassets.androidplatform.net/assets/web/index.html")
    }

    /** 0.9.11 (#102): write why the app died to crash.txt, restart it in 1.5 s; the page offers "Gửi Báo Lỗi" next time. */
    private fun logCrash(text: String) {
        try { java.io.File(filesDir, "crash.txt").appendText(java.text.SimpleDateFormat("dd/MM HH:mm:ss", java.util.Locale.US).format(java.util.Date()) + " · " + Build.MODEL + " Android " + Build.VERSION.RELEASE + "\n" + text.take(6000) + "\n\n") } catch (_: Exception) {}
    }
    private fun installCrashGuard() {
        val prev = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { t, e ->
            try {
                logCrash("Thread " + t.name + ": " + android.util.Log.getStackTraceString(e))
                val f = java.io.File(filesDir, "crash.txt")
                val again = System.currentTimeMillis() - prefs.getLong("crashAt", 0) < 60_000
                prefs.edit().putLong("crashAt", System.currentTimeMillis()).commit()
                if (!again) {
                    val pi = android.app.PendingIntent.getActivity(this, 77, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK), android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_ONE_SHOT)
                    (getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager).set(android.app.AlarmManager.RTC, System.currentTimeMillis() + 1500, pi)
                }
                f.length()
            } catch (_: Throwable) {}
            if (prev != null) prev.uncaughtException(t, e) else { android.os.Process.killProcess(android.os.Process.myPid()); kotlin.system.exitProcess(10) }
        }
    }
    private fun sendCrashIfAny() {
        val f = java.io.File(filesDir, "crash.txt"); if (!f.exists()) return
        val t = try { f.readText() } catch (_: Exception) { "" }; f.delete()
        if (t.isNotBlank()) js("tcCrash", JSONObject().put("text", t.takeLast(3000)).toString())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // #127: a fresh start (not a rotation / DeX switch / return from Chạy Nền) plays the start-up sound again
        if (savedInstanceState == null) TomsCarApp.chimed = false
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        installCrashGuard()
        buildWeb(loader)
        immersive()

        askPermissions()
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        obd = Obd(bm?.adapter) { prefs.getString("obd", null) }
        phone = Phone(this)
        radio = Radio(this)
        vol = Vol(this) { main.post { if (ready) push() } }.also { it.start() }
        voice = Voice(this) { o -> main.post { web.evaluateJavascript("window.tcVoice && tcVoice(" + JSONObject.quote(o.toString()) + ")", null) } }
        voice.init()
        jukebox = Jukebox(this) { j -> main.post { js("tcJukebox", j) } }
        jukebox.start()
    }

    @Deprecated("file chooser result")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 41) {
            val cb = fileCb; fileCb = null
            var res = WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            if (res == null && resultCode == RESULT_OK) {
                // camera returns a thumbnail bitmap only → hand it over as a small file
                val bmp = data?.extras?.get("data") as? Bitmap
                if (bmp != null) {
                    val f = java.io.File(cacheDir, "cam_" + System.currentTimeMillis() + ".jpg")
                    f.outputStream().use { bmp.compress(Bitmap.CompressFormat.JPEG, 90, it) }
                    res = arrayOf(Uri.fromFile(f))
                }
            }
            cb?.onReceiveValue(res)
        }
    }

    override fun onResume() {
        super.onResume()
        Bubble.hide()   // #73: Tom's Car is in front again
        immersive()
        startLocation()
        if (hasBtPermission()) obd?.start()
        main.removeCallbacks(tick); main.post(tick)
        if (::phone.isInitialized) phone.start()
        if (::voice.isInitialized) voice.recheck()
    }

    override fun onStop() {
        super.onStop()
        if (!isFinishing && !isChangingConfigurations) Bubble.show(this)   // #73: covered by other apps → floating bubble
    }

    override fun onDestroy() {
        try { vol.stop() } catch (_: Exception) {}
        Bubble.hide()
        main.removeCallbacks(tick)
        obd?.stop()
        if (::phone.isInitialized) phone.stop()
        if (::radio.isInitialized) radio.stop()
        if (::voice.isInitialized) voice.release()
        if (::jukebox.isInitialized) jukebox.stop()
        try { (getSystemService(Context.LOCATION_SERVICE) as LocationManager).removeUpdates(locListener) } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) { super.onWindowFocusChanged(hasFocus); if (hasFocus) immersive() }

    @Deprecated("Back goes to the phone home instead of closing Tom's Car")
    override fun onBackPressed() { moveTaskToBack(true) }

    private fun immersive() {
        if (!::web.isInitialized) return
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
        val want = mutableListOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.RECORD_AUDIO, Manifest.permission.READ_PHONE_STATE)
        if (Build.VERSION.SDK_INT >= 31) want += Manifest.permission.BLUETOOTH_CONNECT
        val missing = want.filter { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) requestPermissions(missing.toTypedArray(), 7)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        startLocation()
        if (hasBtPermission()) obd?.start()
        if (::phone.isInitialized) phone.start()
        if (::voice.isInitialized && has(Manifest.permission.RECORD_AUDIO)) voice.init()
    }

    private fun has(p: String) = checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED

    private fun perms(): JSONObject = JSONObject()
        .put("loc", hasLocation()).put("bt", hasBtPermission()).put("notif", hasNotifAccess())
        .put("calllog", has(Manifest.permission.READ_CALL_LOG) && has(Manifest.permission.READ_CONTACTS))
        .put("phone", has(Manifest.permission.READ_PHONE_STATE) && has(Manifest.permission.ANSWER_PHONE_CALLS) && has(Manifest.permission.SEND_SMS))
        .put("mic", has(Manifest.permission.RECORD_AUDIO)).put("cal", has(Manifest.permission.READ_CALENDAR))
        .put("overlay", Settings.canDrawOverlays(this))

    private fun askPerm(which: String) {
        val list = when (which) {
            "loc" -> arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            "bt" -> if (Build.VERSION.SDK_INT >= 31) arrayOf(Manifest.permission.BLUETOOTH_CONNECT) else arrayOf()
            "calllog" -> arrayOf(Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_CONTACTS, Manifest.permission.READ_SMS)
            "phone" -> arrayOf(Manifest.permission.READ_PHONE_STATE, Manifest.permission.ANSWER_PHONE_CALLS, Manifest.permission.CALL_PHONE, Manifest.permission.SEND_SMS, Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_CONTACTS)
            "mic" -> arrayOf(Manifest.permission.RECORD_AUDIO)
            "cal" -> arrayOf(Manifest.permission.READ_CALENDAR)
            "notif" -> { startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")); return }
            "overlay" -> { startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))); return }
            else -> arrayOf()
        }
        val missing = list.filter { !has(it) }
        if (missing.isEmpty()) { Launcher.toast(this, "Đã cấp rồi"); return }
        requestPermissions(missing.toTypedArray(), 8)
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
        val now = SystemClock.elapsedRealtime()
        val isGps = l.provider == LocationManager.GPS_PROVIDER
        // prefer GPS fixes; accept network fixes only when no GPS fix arrived in the last 10 s
        if (!isGps && now - gpsAt < 10000) return
        if (isGps) gpsAt = now
        // heading + speed worked out from the movement when the fix itself has none
        val pf = prevFix
        if (pf != null) {
            val d = pf.distanceTo(l); val dt = (now - prevFixAt) / 1000.0
            if (dt in 0.3..30.0) {
                calcSpd = d / dt * 3.6
                if (d > 4) calcBrg = pf.bearingTo(l).let { if (it < 0) it + 360f else it }
                else if (d < 1.5 && calcSpd!! < 3) calcSpd = 0.0
            }
        }
        if (pf == null || pf.distanceTo(l) > 2 || now - prevFixAt > 5000) { prevFix = Location(l); prevFixAt = now }
        location = l; locAt = now; fixSeq++
        val g = lastGeo
        if (g == null || g.distanceTo(l) > 250 || now - geoAt > 60000) { lastGeo = l; geoAt = now; geocode(l) }
    }
    private var geoAt = 0L

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
        if (::vol.isInitialized) { o.put("vol", vol.percent); o.put("volAt", vol.changedAt) }
        o.put("device", Build.MANUFACTURER.replaceFirstChar { it.uppercase() } + " " + Build.MODEL + " · Android " + Build.VERSION.RELEASE)
        val age = SystemClock.elapsedRealtime() - locAt
        val fresh = l != null && age < 15000
        val ob = obd
        val obdSpeed = ob?.speed
        val gpsSpeed = if (!fresh) null else if (l!!.hasSpeed() && l.speed > 0.2f) l.speed * 3.6 else (calcSpd ?: if (l.hasSpeed()) l.speed * 3.6 else null)
        o.put("gpsSpeed", gpsSpeed ?: org.json.JSONObject.NULL)
        o.put("obdSpeed", obdSpeed ?: org.json.JSONObject.NULL)
        when {
            obdSpeed != null -> o.put("speed", obdSpeed)
            gpsSpeed != null -> o.put("speed", gpsSpeed)
            fresh -> o.put("speed", 0)
            else -> o.put("speed", org.json.JSONObject.NULL)
        }
        o.put("gps", fresh && l?.provider == LocationManager.GPS_PROVIDER)
        o.put("fresh", fresh); o.put("age", age / 1000)
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
        // 0.9.12 (#108): say why there are no engine numbers yet (the OBD plug only has power while the car is on)
        else if (ob != null) o.put("obdSt", if (ob.status == "Chưa thấy cục OBD") "none" else "wait")
        media()?.let { o.put("media", it) }
        val brg = if (l != null && fresh && l.hasBearing() && (l.speed > 1.5f || calcBrg == null)) l.bearing else if (fresh) calcBrg else null
        if (brg != null) o.put("bearing", brg.toDouble())
        if (l != null && fresh) { o.put("acc", l.accuracy.toDouble()); o.put("fix", fixSeq) }
        o.put("perms", perms())
        phone.json()?.let { o.put("call", it) }
        o.put("missed", phone.missed)
        o.put("radio", radio.json())
        nextAppt()?.let { o.put("appt", it) }
        voice.pause(phone.state != null)
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
            .put("app", app).put("pkg", c.packageName)
            .put("dur", md.getLong(MediaMetadata.METADATA_KEY_DURATION)).put("pos", c.playbackState?.position ?: 0)
            .put("queue", JSONArray().apply { c.queue?.take(30)?.forEach { q -> put(JSONObject().put("id", q.queueId).put("title", q.description.title?.toString() ?: "").put("sub", q.description.subtitle?.toString() ?: "")) } })
    }

    private fun mediaKey(code: Int) {
        val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, code))
        am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, code))
    }

    private fun mediaAction(a: String) {
        val c = controller()
        val playing = c?.playbackState?.state == PlaybackState.STATE_PLAYING
        val useJb = musicApp == "jukebox" && jukebox.installed()
        when {
            a == "prev" -> c?.transportControls?.skipToPrevious() ?: if (useJb) jukebox.prev() else mediaKey(KeyEvent.KEYCODE_MEDIA_PREVIOUS)
            a == "next" -> c?.transportControls?.skipToNext() ?: if (useJb) jukebox.next() else mediaKey(KeyEvent.KEYCODE_MEDIA_NEXT)
            a == "pause" -> c?.transportControls?.pause() ?: if (useJb) jukebox.pause() else mediaKey(KeyEvent.KEYCODE_MEDIA_PAUSE)
            a == "play" || a == "autoplay" -> if (c != null && a == "play") c.transportControls.play() else startMusic()
            a == "toggle" -> if (c == null) startMusic() else if (playing) c.transportControls.pause() else c.transportControls.play()
            a.startsWith("app:") -> musicApp = a.removePrefix("app:").ifBlank { "jukebox" }
            a.startsWith("queue:") -> c?.transportControls?.skipToQueueItem(a.removePrefix("queue:").toLongOrNull() ?: 0)
            a.startsWith("jb:") -> { val o = JSONObject(a.removePrefix("jb:")); jukebox.play(o.optString("kind"), o.optString("name")) }
            a == "jbquery" -> jukebox.query()
            a == "volup" -> (getSystemService(Context.AUDIO_SERVICE) as AudioManager).adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, 0)
            a.startsWith("vol:") -> vol.set(a.removePrefix("vol:").toIntOrNull() ?: vol.percent)
            a == "volstep+" -> vol.step(10)
            a == "volstep-" -> vol.step(-10)
            a == "mute" -> vol.toggleMute()
            a == "voldown" -> (getSystemService(Context.AUDIO_SERVICE) as AudioManager).adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, 0)
        }
        main.postDelayed({ if (ready) push() }, 600)
        main.postDelayed({ if (ready) push() }, 2000)
    }

    /** Nothing is playing yet: start the default music app without leaving Tom's Car. */
    private fun startMusic() {
        if (::radio.isInitialized) radio.stop()
        if (musicApp == "jukebox" && jukebox.installed()) {
            jukebox.resume()
            // if Jukebox still has not started after a few seconds, open it briefly and come back
            main.postDelayed({
                if (controller()?.playbackState?.state != PlaybackState.STATE_PLAYING)
                    jukebox.openAndPlay { startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)) }
            }, 3500)
            return
        }
        val pkg = if (musicApp == "jukebox") null else musicApp
        if (pkg != null) {
            // ask that app to play with a media key aimed at it; open it if it does not react
            val down = Intent(Intent.ACTION_MEDIA_BUTTON).setPackage(pkg).putExtra(Intent.EXTRA_KEY_EVENT, KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PLAY))
            val up = Intent(Intent.ACTION_MEDIA_BUTTON).setPackage(pkg).putExtra(Intent.EXTRA_KEY_EVENT, KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PLAY))
            try { sendBroadcast(down); sendBroadcast(up) } catch (_: Exception) { }
            main.postDelayed({
                if (controller()?.playbackState?.state != PlaybackState.STATE_PLAYING) {
                    packageManager.getLaunchIntentForPackage(pkg)?.let { startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                    main.postDelayed({ mediaKey(KeyEvent.KEYCODE_MEDIA_PLAY); startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)) }, 1800)
                }
            }, 2500)
        } else mediaKey(KeyEvent.KEYCODE_MEDIA_PLAY)
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
                    4 -> web.evaluateJavascript("window.__ui && __ui.setState({boot:'about'})", null)
                }
            }
            .setNegativeButton("Đóng", null)
            .show()
    }

    private val obdKeys = listOf("obd", "elm", "veepeak", "vgate", "icar", "vlink", "v-link", "obdlink", "obdii", "obdcheck")
    @SuppressLint("MissingPermission")
    private fun btName(d: BluetoothDevice): String = (try { d.name } catch (_: SecurityException) { null }) ?: d.address
    private fun isObdName(n: String) = n.lowercase().let { x -> obdKeys.any { x.contains(it) } }

    private fun useObd(d: BluetoothDevice) {
        prefs.edit().putString("obd", d.address).apply()
        obd?.stop(); val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        obd = Obd(bm?.adapter) { prefs.getString("obd", null) }.also { it.start() }
        Launcher.toast(this, "Đang nối " + btName(d) + "…")
    }

    /** #88: paired devices with OBD ones first, plus "scan nearby" that finds and pairs in-app (PIN 1234). */
    @SuppressLint("MissingPermission")
    private fun pickObd() {
        if (!hasBtPermission()) { askPermissions(); return }
        val adapter = (getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter
        if (adapter == null || !adapter.isEnabled) { Launcher.toast(this, "Bluetooth đang tắt — bật Bluetooth rồi thử lại"); return }
        val devs: List<BluetoothDevice> = (try { adapter.bondedDevices?.toList() ?: emptyList() } catch (_: SecurityException) { emptyList() })
            .sortedByDescending { if (isObdName(btName(it))) 1 else 0 }
        val names = (devs.map { (if (isObdName(btName(it))) "🚗 " else "") + btName(it) + "\n" + it.address } + listOf("🔍 Tìm thiết bị gần đây…")).toTypedArray()
        AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("Chọn cục OBD-II")
            .setItems(names) { _, w -> if (w < devs.size) useObd(devs[w]) else scanObd() }
            .setNegativeButton("Đóng", null)
            .show()
    }

    private var scanRx: BroadcastReceiver? = null
    @SuppressLint("MissingPermission")
    private fun scanObd() {
        if (Build.VERSION.SDK_INT >= 31 && checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) { requestPermissions(arrayOf(Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT), 8); return }
        if (Build.VERSION.SDK_INT < 31 && !hasLocation()) { askPermissions(); return }
        val adapter = (getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter ?: return
        val found = mutableListOf<BluetoothDevice>()
        val items = mutableListOf<String>()
        val ad = android.widget.ArrayAdapter(this, android.R.layout.simple_list_item_1, items)
        var dlg: AlertDialog? = null
        val stop = { try { scanRx?.let { unregisterReceiver(it) } } catch (_: Exception) {}; scanRx = null; try { adapter.cancelDiscovery() } catch (_: SecurityException) {} }
        val rx = object : BroadcastReceiver() {
            override fun onReceive(c: Context, i: Intent) {
                when (i.action) {
                    BluetoothDevice.ACTION_FOUND -> {
                        val d: BluetoothDevice = (if (Build.VERSION.SDK_INT >= 33) i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java) else @Suppress("DEPRECATION") i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)) ?: return
                        if (found.any { it.address == d.address }) return
                        val n = btName(d); val obdLike = isObdName(n)
                        val pos = if (obdLike) 0 else found.size
                        found.add(pos, d); items.add(pos, (if (obdLike) "🚗 " else "") + n + "\n" + d.address); ad.notifyDataSetChanged()
                    }
                    BluetoothDevice.ACTION_PAIRING_REQUEST -> {   // OBD dongles use 1234 (some 0000)
                        val d: BluetoothDevice? = if (Build.VERSION.SDK_INT >= 33) i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java) else @Suppress("DEPRECATION") i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                        try { d?.setPin("1234".toByteArray()) } catch (_: Exception) {}
                    }
                    BluetoothDevice.ACTION_BOND_STATE_CHANGED -> {
                        val d: BluetoothDevice? = if (Build.VERSION.SDK_INT >= 33) i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java) else @Suppress("DEPRECATION") i.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                        val st = i.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, -1)
                        if (d != null && st == BluetoothDevice.BOND_BONDED) { stop(); useObd(d) }
                        if (d != null && st == BluetoothDevice.BOND_NONE && i.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, -1) == BluetoothDevice.BOND_BONDING) Launcher.toast(this@MainActivity, "Ghép nối không được — thử mã 1234 hoặc 0000")
                    }
                    BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> dlg?.setTitle(if (found.isEmpty()) "Không thấy thiết bị nào — cắm cục OBD, mở máy xe rồi thử lại" else "Chạm để ghép nối")
                }
            }
        }
        scanRx = rx
        val f = IntentFilter().apply { addAction(BluetoothDevice.ACTION_FOUND); addAction(BluetoothDevice.ACTION_PAIRING_REQUEST); addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED); addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED) }
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(rx, f, Context.RECEIVER_EXPORTED) else registerReceiver(rx, f)
        try { adapter.startDiscovery() } catch (_: SecurityException) { Launcher.toast(this, "Chưa có quyền tìm Bluetooth"); stop(); return }
        dlg = AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("Đang tìm thiết bị… (cục OBD lên đầu)")
            .setAdapter(ad) { _, w ->
                val d = found.getOrNull(w) ?: return@setAdapter
                try { adapter.cancelDiscovery() } catch (_: SecurityException) {}
                if (d.bondState == BluetoothDevice.BOND_BONDED) { stop(); useObd(d) }
                else { Launcher.toast(this, "Đang ghép nối " + btName(d) + " (mã 1234)…"); try { d.createBond() } catch (_: SecurityException) {} }
            }
            .setNegativeButton("Đóng") { _, _ -> stop() }
            .setOnCancelListener { stop() }
            .show()
    }

    private lateinit var jukebox: Jukebox
    /** Default music app chosen in Settings → Music ("jukebox" or a package name). */
    private var musicApp = "jukebox"

    private fun js(fn: String, json: String) = web.evaluateJavascript("window.$fn && $fn(" + JSONObject.quote(json) + ")", null)

    private fun mediaPause() { controller()?.let { if (it.playbackState?.state == PlaybackState.STATE_PLAYING) it.transportControls.pause() } }

    /** Messages for the Liên Lạc tab: SMS inbox + messages caught from notifications (newest first). */
    private fun messages(): JSONArray {
        val keep = prefs.getInt("msgKeep", 30)
        val rows = ArrayList<Pair<Long, JSONArray>>(phone.smsInbox())
        val n = MediaListener.load(this, keep)
        for (i in 0 until n.length()) {
            val r = n.getJSONArray(i); val t = r.optLong(4)
            val c = phone.contact("")
            rows += t to JSONArray().put(r.optString(0)).put(c.second.takeIf { false } ?: "Bạn Bè").put(r.optString(2)).put(r.optString(3))
                .put(java.text.SimpleDateFormat(if (System.currentTimeMillis() - t < 86400000L) "HH:mm" else "dd/MM", Locale.US).format(java.util.Date(t))).put(r.optInt(5)).put(r.optString(6))
        }
        MediaListener.markRead(this)
        return JSONArray().apply { rows.sortedByDescending { it.first }.take(50).forEach { put(it.second) } }
    }

    /** Installed apps with small icons (for the Workspace picker). */
    private fun appsJson(): JSONArray {
        val pm = packageManager
        val i = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val often = setOf("com.waze", "com.google.android.apps.maps", "com.spotify.music", "com.google.android.youtube", "com.google.android.apps.youtube.music", "com.samsung.android.dialer", "com.google.android.dialer")
        val out = JSONArray()
        pm.queryIntentActivities(i, 0).distinctBy { it.activityInfo.packageName }.sortedBy { it.loadLabel(pm).toString().lowercase() }.forEach { ri ->
            val pkg = ri.activityInfo.packageName
            if (pkg == packageName) return@forEach
            val cat = when (if (Build.VERSION.SDK_INT >= 26) ri.activityInfo.applicationInfo.category else -1) {
                android.content.pm.ApplicationInfo.CATEGORY_MAPS -> "map"
                android.content.pm.ApplicationInfo.CATEGORY_AUDIO -> "music"
                android.content.pm.ApplicationInfo.CATEGORY_VIDEO -> "video"
                android.content.pm.ApplicationInfo.CATEGORY_SOCIAL -> "call"
                else -> when { pkg.contains("tomstechsolutions") -> "tt"; pkg.contains("dialer") || pkg.contains("messag") || pkg.contains("whatsapp") || pkg.contains("orca") -> "call"; pkg.contains("waze") || pkg.contains("maps") -> "map"; pkg.contains("music") || pkg.contains("spotify") || pkg.contains("radio") || pkg.contains("podcast") -> "music"; pkg.contains("youtube") || pkg.contains("netflix") || pkg.contains("plex") -> "video"; else -> "other" }
            }
            val icon = try {
                val d = ri.loadIcon(pm); val b = Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888); val c = Canvas(b); d.setBounds(0, 0, 64, 64); d.draw(c)
                val bo = ByteArrayOutputStream(); b.compress(Bitmap.CompressFormat.PNG, 100, bo); "data:image/png;base64," + Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP)
            } catch (_: Exception) { "" }
            out.put(JSONObject().put("pkg", pkg).put("name", ri.loadLabel(pm).toString()).put("cat", cat).put("icon", icon).put("often", often.contains(pkg)))
        }
        return out
    }

    private fun openApp(which: String) {
        val list = if (which == "podcast") listOf("au.com.shiftyjelly.pocketcasts", "com.spotify.music", "com.google.android.apps.podcasts") else listOf(which)
        for (p in list) { packageManager.getLaunchIntentForPackage(p)?.let { startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); return } }
        Launcher.toast(this, "Chưa cài app này")
    }

    /** Text or Google Maps link → place. */
    private fun geocodeText(q: String): JSONObject {
        val out = JSONObject()
        try {
            var text = q.trim()
            if (text.startsWith("http")) {
                // follow the short link and read the coordinates from the final address
                var u = text
                for (k in 0 until 5) {
                    val c = URL(u).openConnection() as HttpURLConnection
                    c.instanceFollowRedirects = false; c.connectTimeout = 8000; c.readTimeout = 8000
                    val loc = c.getHeaderField("Location"); c.disconnect()
                    if (loc.isNullOrBlank()) break; u = loc
                }
                val dec = Uri.decode(u)
                Regex("@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)").find(dec)?.let { m ->
                    out.put("lat", m.groupValues[1].toDouble()).put("lon", m.groupValues[2].toDouble())
                    Regex("/place/([^/@]+)").find(dec)?.let { out.put("name", it.groupValues[1].replace('+', ' ')) }
                    return out
                }
                Regex("[?&]q=([^&]+)").find(dec)?.let { text = it.groupValues[1].replace('+', ' ') } ?: Regex("/place/([^/@]+)").find(dec)?.let { text = it.groupValues[1].replace('+', ' ') }
            }
            if (Geocoder.isPresent()) {
                @Suppress("DEPRECATION")
                val a = Geocoder(this, Locale("en", "AU")).getFromLocationName(text + ", Australia", 1)?.firstOrNull()
                if (a != null) out.put("lat", a.latitude).put("lon", a.longitude).put("name", a.featureName ?: text).put("addr", listOfNotNull(a.thoroughfare, a.locality, a.adminArea).joinToString(", "))
            }
        } catch (_: Exception) {}
        return out
    }

    /** 0.9.14 (#130): appointments for the calendar month view — {"from":ms,"to":ms} → [{title,start,end,allDay,loc}] */
    @SuppressLint("MissingPermission")
    private fun monthAppts(arg: String): org.json.JSONArray {
        val out = org.json.JSONArray()
        if (!has(Manifest.permission.READ_CALENDAR)) return out
        try {
            val o = JSONObject(arg)
            val b = CalendarContract.Instances.CONTENT_URI.buildUpon()
            android.content.ContentUris.appendId(b, o.optLong("from")); android.content.ContentUris.appendId(b, o.optLong("to"))
            contentResolver.query(b.build(), arrayOf(CalendarContract.Instances.TITLE, CalendarContract.Instances.BEGIN, CalendarContract.Instances.END, CalendarContract.Instances.ALL_DAY, CalendarContract.Instances.EVENT_LOCATION),
                null, null, CalendarContract.Instances.BEGIN + " ASC")?.use { c ->
                while (c.moveToNext() && out.length() < 400) out.put(JSONObject().put("title", c.getString(0) ?: "Lịch hẹn").put("start", c.getLong(1)).put("end", c.getLong(2)).put("allDay", c.getInt(3) == 1).put("loc", c.getString(4) ?: ""))
            }
        } catch (_: Exception) {}
        return out
    }

    /** Next appointment today (Google Calendar) for the chip next to the clock. */
    @SuppressLint("MissingPermission")
    private fun nextAppt(): JSONObject? {
        if (!has(Manifest.permission.READ_CALENDAR)) return null
        val now = System.currentTimeMillis()
        if (now - apptAt < 60000) return appt
        apptAt = now; appt = null
        try {
            val b = CalendarContract.Instances.CONTENT_URI.buildUpon()
            android.content.ContentUris.appendId(b, now - 15 * 60000L); android.content.ContentUris.appendId(b, now + 12 * 3600000L)
            contentResolver.query(b.build(), arrayOf(CalendarContract.Instances.TITLE, CalendarContract.Instances.BEGIN, CalendarContract.Instances.EVENT_LOCATION, CalendarContract.Instances.ALL_DAY),
                null, null, CalendarContract.Instances.BEGIN + " ASC")?.use { c ->
                while (c.moveToNext()) { if (c.getInt(3) == 1) continue
                    appt = JSONObject().put("title", c.getString(0) ?: "Lịch hẹn").put("start", c.getLong(1)).put("loc", c.getString(2) ?: ""); break }
            }
        } catch (_: Exception) {}
        return appt
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
                        if (TomsCarApp.introShown) web.evaluateJavascript("window.tcSkipIntro && tcSkipIntro()", null)
                        TomsCarApp.introShown = true
                        push()
                        sendCrashIfAny()
                    }
                    "settings" -> settings()
                    "chime" -> chime(arg)
                    "cal" -> bg.execute { val j = monthAppts(arg); main.post { js("tcCal", JSONObject().put("key", try { JSONObject(arg).optString("key") } catch (_: Exception) { "" }).put("ev", j).toString()) } }
                    "media" -> mediaAction(arg)
                    "launch" -> { Launcher.workspace(this@MainActivity, arg); Bubble.askOnce(this@MainActivity) }
                    "bubble" -> { Bubble.enabled = arg != "off"; if (!Bubble.enabled) Bubble.hide() }
                    // 0.9.13: share a trip recording as a file (Gmail, Drive…) and read the clipboard for the HERE key
                    "sharefile" -> try { val o = JSONObject(arg); val dir = java.io.File(cacheDir, "share").apply { mkdirs() }
                        dir.listFiles()?.forEach { if (System.currentTimeMillis() - it.lastModified() > 86400000L) it.delete() }
                        val f = java.io.File(dir, o.optString("name", "chuyen-di.json").replace(Regex("[^A-Za-z0-9._-]"), "_")); f.writeText(o.optString("text"))
                        val uri = androidx.core.content.FileProvider.getUriForFile(this@MainActivity, "$packageName.files", f)
                        val i = Intent(Intent.ACTION_SEND).setType("application/json").putExtra(Intent.EXTRA_STREAM, uri).putExtra(Intent.EXTRA_SUBJECT, o.optString("subject")).putExtra(Intent.EXTRA_EMAIL, arrayOf("tomstechmelbourne@gmail.com")).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        startActivity(Intent.createChooser(i, "Gửi chuyến đi").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {}
                    "clip" -> { val t = try { (getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager).primaryClip?.getItemAt(0)?.coerceToText(this@MainActivity)?.toString() ?: "" } catch (_: Exception) { "" }
                        js("tcClip", JSONObject().put("text", t.trim().take(200)).toString()) }
                    "mail" -> try { val o = JSONObject(arg); startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:")).putExtra(Intent.EXTRA_EMAIL, arrayOf("tomstechmelbourne@gmail.com")).putExtra(Intent.EXTRA_SUBJECT, o.optString("subject")).putExtra(Intent.EXTRA_TEXT, o.optString("body")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {}
                    "share" -> try { startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:")).putExtra("sms_body", arg).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) { try { startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, arg), "Gửi giờ tới").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {} }
                    "park" -> try { val o = JSONObject(arg); ParkAlarm.set(this@MainActivity, o.optLong("at"), o.optString("text"))
                        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 9) } catch (_: Exception) {}
                    "nav" -> Launcher.navigate(this@MainActivity, arg)
                    "split" -> Launcher.split(this@MainActivity, arg)
                    "perm" -> askPerm(arg)
                    "exit" -> if (arg == "hard") { radio.stop(); voice.release(); obd?.stop(); finishAndRemoveTask(); main.postDelayed({ android.os.Process.killProcess(android.os.Process.myPid()) }, 400) } else moveTaskToBack(true)
                    "call" -> phone.action(arg)
                    "calllog" -> bg.execute { val j = phone.callLog(); main.post { js("tcCallLog", j.toString()) } }
                    "msgs" -> bg.execute { val j = messages(); main.post { js("tcMsgs", j.toString()) } }
                    "reply" -> { val o = JSONObject(arg); val key = o.optString("key"); val t = o.optString("text")
                        if (key.startsWith("sms:")) phone.sms(key.removePrefix("sms:"), t) else if (!MediaListener.reply(this@MainActivity, key, t)) Launcher.toast(this@MainActivity, "App này không cho trả lời từ Tom's Car") }
                    "apps" -> bg.execute { val j = appsJson(); main.post { js("tcApps", j.toString()) } }
                    "radio" -> when (arg) { "stop" -> radio.stop(); "prev", "next" -> {}; "" -> radio.toggle(); else -> { val o = JSONObject(arg); radio.play(o.optString("url"), o.optString("name")); mediaPause() } }
                    "voice" -> when {
                        arg == "start" -> voice.listen(); arg == "stop" -> voice.cancel()
                        arg == "installvi" -> voice.installVi(); arg == "report" -> voice.report()
                        arg == "test" -> voice.say("Dạ, em là trợ lý Tom's Car. Anh cần gì cứ nói nha.")
                        arg.startsWith("cfg:") -> try { voice.config(JSONObject(arg.removePrefix("cfg:"))) } catch (_: Exception) {}
                        else -> {}
                    }
                    "say" -> voice.say(arg)
                    "geocode" -> Thread { val r = try { geocodeText(arg) } catch (_: Throwable) { JSONObject() }; main.post { js("tcGeo", r.toString()) } }.start()   // own thread, never waits behind other jobs (#98)
                    "openApp" -> openApp(arg)
                    "openMedia" -> { val p = controller()?.packageName; if (p != null) packageManager.getLaunchIntentForPackage(p)?.let { startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } else Launcher.toast(this@MainActivity, "Mở app nhạc rồi bấm phát") }
                }
            }
        }
    }
}
