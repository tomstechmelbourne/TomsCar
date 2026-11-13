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
    private var place: JSONObject? = null
    private var ready = false
    private lateinit var phone: Phone
    private lateinit var radio: Radio
    private lateinit var voice: Voice
    private var fileCb: ValueCallback<Array<Uri>>? = null
    private var appt: JSONObject? = null
    private var apptAt = 0L

    // ---------------------------------------------------------------- lifecycle
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

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
        }
        web.addJavascriptInterface(Bridge(), "TCNative")
        setContentView(web)
        immersive()
        web.loadUrl("https://appassets.androidplatform.net/assets/web/index.html")

        askPermissions()
        val bm = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        obd = Obd(bm?.adapter) { prefs.getString("obd", null) }
        phone = Phone(this)
        radio = Radio(this)
        voice = Voice(this) { o -> main.post { web.evaluateJavascript("window.tcVoice && tcVoice(" + JSONObject.quote(o.toString()) + ")", null) } }
        voice.init()
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
        immersive()
        startLocation()
        if (hasBtPermission()) obd?.start()
        main.removeCallbacks(tick); main.post(tick)
        if (::phone.isInitialized) phone.start()
    }

    override fun onDestroy() {
        main.removeCallbacks(tick)
        obd?.stop()
        if (::phone.isInitialized) phone.stop()
        if (::radio.isInitialized) radio.stop()
        if (::voice.isInitialized) voice.release()
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
        if (l != null && fresh && l.hasBearing()) o.put("bearing", l.bearing)
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
        when (a) {
            "prev" -> c?.transportControls?.skipToPrevious() ?: mediaKey(KeyEvent.KEYCODE_MEDIA_PREVIOUS)
            "next" -> c?.transportControls?.skipToNext() ?: mediaKey(KeyEvent.KEYCODE_MEDIA_NEXT)
            "toggle" -> {
                if (c == null) mediaKey(KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE)
                else if (c.playbackState?.state == PlaybackState.STATE_PLAYING) c.transportControls.pause() else c.transportControls.play()
            }
            else -> if (a.startsWith("queue:")) c?.transportControls?.skipToQueueItem(a.removePrefix("queue:").toLongOrNull() ?: 0)
        }
        when (a) {
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
                    4 -> web.evaluateJavascript("window.__ui && __ui.setState({boot:'about'})", null)
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
                    }
                    "settings" -> settings()
                    "media" -> mediaAction(arg)
                    "launch" -> Launcher.workspace(this@MainActivity, arg)
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
                    "voice" -> when (arg) { "start" -> voice.listen(); "stop" -> voice.cancel() }
                    "say" -> voice.say(arg)
                    "geocode" -> bg.execute { val r = geocodeText(arg); main.post { js("tcGeo", r.toString()) } }
                    "openApp" -> openApp(arg)
                    "openMedia" -> { val p = controller()?.packageName; if (p != null) packageManager.getLaunchIntentForPackage(p)?.let { startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } else Launcher.toast(this@MainActivity, "Mở app nhạc rồi bấm phát") }
                }
            }
        }
    }
}
