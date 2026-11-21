package com.tomstechsolutions.car

import android.content.ComponentName
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Xml
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import org.json.JSONArray
import org.json.JSONObject
import org.xmlpull.v1.XmlPullParser
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

/**
 * 0.9.15 (#138): the music player inside Tom's Car — songs in the phone, Australian + Vietnamese radio,
 * podcasts (download one / the newest ten, deleted after 3 days), radio recording, lyrics.
 * Everything is driven from the web UI with tcn('mus', {cmd: …}); lists come back through js("tcMus", …).
 * Kept separate from the Tom's Jukebox app (no shared data).
 */
object Music {
    private lateinit var app: Context
    private var emit: (String, String) -> Unit = { _, _ -> }
    private val main = Handler(Looper.getMainLooper())
    private val bg = Executors.newFixedThreadPool(3)
    private var ctrl: MediaController? = null
    private var connecting = false
    private val waiting = ArrayList<() -> Unit>()

    private const val UA = "TomsCar/0.9.15 (Android; Tom's Technology Solutions)"
    private fun enc(s: String) = URLEncoder.encode(s, "UTF-8")
    private fun get(url: String, timeout: Int = 10000): String {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = timeout; c.readTimeout = timeout; c.instanceFollowRedirects = true
        c.setRequestProperty("User-Agent", UA)
        try { if (c.responseCode >= 400) throw java.io.IOException("HTTP ${c.responseCode}"); return c.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() } } finally { c.disconnect() }
    }
    private val prefs by lazy { app.getSharedPreferences("tc_music", Context.MODE_PRIVATE) }

    // what is playing (for the bar, the recorder and voice answers)
    var kind = ""            // track / radio / podcast
    private var curStation: JSONObject? = null
    private var curPodUrl = ""
    private var lastErr = ""

    fun init(c: Context, onJs: (String, String) -> Unit) {
        app = c.applicationContext; emit = onJs
        bg.execute { cleanDownloads() }
    }

    private fun connect(then: () -> Unit) {
        ctrl?.let { then(); return }
        waiting += then
        if (connecting) return
        connecting = true
        val f = MediaController.Builder(app, SessionToken(app, ComponentName(app, MusicService::class.java))).buildAsync()
        f.addListener({
            connecting = false
            ctrl = try { f.get() } catch (_: Exception) { null }
            val w = ArrayList(waiting); waiting.clear()
            if (ctrl != null) w.forEach { try { it() } catch (_: Exception) {} }
        }, { main.post(it) })
    }

    fun release() { try { ctrl?.release() } catch (_: Exception) {}; ctrl = null }

    private fun reply(req: String, o: JSONObject) { main.post { emit("tcMus", o.put("req", req).toString()) } }
    private fun msg(t: String) { main.post { emit("tcMusMsg", JSONObject().put("t", t).toString()) } }

    // ---------------- state for the bar ----------------
    fun active(): Boolean = (ctrl?.mediaItemCount ?: 0) > 0
    fun state(): JSONObject? {
        val c = ctrl ?: return null
        if (c.mediaItemCount == 0) return null
        val md = c.mediaMetadata
        return JSONObject().put("title", md.title?.toString() ?: "").put("artist", md.artist?.toString() ?: (md.albumTitle?.toString() ?: ""))
            .put("playing", c.isPlaying || (c.playWhenReady && c.playbackState == Player.STATE_BUFFERING)).put("buffering", c.playbackState == Player.STATE_BUFFERING)
            .put("app", "Tom's Car").put("pkg", app.packageName).put("builtin", true).put("kind", kind)
            .put("dur", if (c.duration > 0) c.duration else 0).put("pos", c.currentPosition)
            .put("shuffle", c.shuffleModeEnabled).put("repeat", c.repeatMode).put("idx", c.currentMediaItemIndex).put("count", c.mediaItemCount)
            .put("rec", rec.on).put("recSec", rec.seconds()).put("err", lastErr)
            .put("station", curStation?.optString("n") ?: "").put("podUrl", curPodUrl).put("col", colorFor(c.currentMediaItem?.mediaId ?: ""))
    }

    // ---------------- 0.9.15 (#144): wave colour from the album cover ----------------
    private val cols = HashMap<String, String>()
    private val colBusy = HashSet<String>()
    private fun colorFor(id: String): String {
        if (id.isBlank()) return ""
        cols[id]?.let { return it }
        if (kind != "track" || !colBusy.add(id)) return ""
        bg.execute {
            var col = ""
            try {
                val r = android.media.MediaMetadataRetriever(); r.setDataSource(app, Uri.parse(id))
                val pic = r.embeddedPicture; r.release()
                if (pic != null) { val op = android.graphics.BitmapFactory.Options().apply { inSampleSize = 8 }
                    android.graphics.BitmapFactory.decodeByteArray(pic, 0, pic.size, op)?.let { col = artColor(it); it.recycle() } }
            } catch (_: Exception) {}
            main.post { cols[id] = col }
        }
        return ""
    }
    /** A lively colour from a picture: average of the more colourful pixels, brightened a little. */
    fun artColor(b: android.graphics.Bitmap): String {
        val sb = android.graphics.Bitmap.createScaledBitmap(b, 24, 24, true)
        var r = 0.0; var g = 0.0; var bl = 0.0; var w = 0.0
        val hsv = FloatArray(3)
        for (y in 0 until 24) for (x in 0 until 24) { val p = sb.getPixel(x, y); android.graphics.Color.colorToHSV(p, hsv)
            val wt = (hsv[1] * hsv[2]).toDouble().let { it * it } + 0.002
            r += android.graphics.Color.red(p) * wt; g += android.graphics.Color.green(p) * wt; bl += android.graphics.Color.blue(p) * wt; w += wt }
        if (sb != b) sb.recycle()
        android.graphics.Color.RGBToHSV((r / w).toInt(), (g / w).toInt(), (bl / w).toInt(), hsv)
        hsv[1] = maxOf(hsv[1], 0.45f); hsv[2] = maxOf(hsv[2], 0.8f)
        return String.format("#%06X", 0xFFFFFF and android.graphics.Color.HSVToColor(hsv))
    }

    // ---------------- commands ----------------
    fun cmd(arg: String) {
        val o = try { JSONObject(arg) } catch (_: Exception) { JSONObject().put("cmd", arg) }
        val req = o.optString("req")
        when (o.optString("cmd")) {
            "toggle" -> connect { val c = ctrl!!; if (c.mediaItemCount == 0) resumeLast() else if (c.isPlaying) c.pause() else c.play() }
            "play" -> connect { val c = ctrl!!; if (c.mediaItemCount == 0) resumeLast() else c.play() }
            "pause" -> ctrl?.pause()
            "next" -> connect { val c = ctrl!!; if (kind == "radio") stepStation(1) else if (c.hasNextMediaItem()) c.seekToNextMediaItem() }
            "prev" -> connect { val c = ctrl!!; if (kind == "radio") stepStation(-1) else if (c.currentPosition > 4000 || !c.hasPreviousMediaItem()) c.seekTo(0) else c.seekToPreviousMediaItem() }
            "seek" -> ctrl?.seekTo(o.optLong("ms"))
            "skip" -> ctrl?.let { it.seekTo(maxOf(0L, it.currentPosition + o.optLong("ms"))) }
            "shuffle" -> ctrl?.let { it.shuffleModeEnabled = !it.shuffleModeEnabled }
            "repeat" -> ctrl?.let { it.repeatMode = when (it.repeatMode) { Player.REPEAT_MODE_OFF -> Player.REPEAT_MODE_ALL; Player.REPEAT_MODE_ALL -> Player.REPEAT_MODE_ONE; else -> Player.REPEAT_MODE_OFF } }
            "stop" -> { rec.stop(); ctrl?.stop(); ctrl?.clearMediaItems(); kind = "" }
            "resume" -> connect { resumeLast() }
            "jump" -> ctrl?.let { val i = o.optInt("i"); if (i in 0 until it.mediaItemCount) { it.seekTo(i, 0); it.play() } }
            "queue" -> ctrl?.let { c -> val a = JSONArray(); for (i in 0 until minOf(c.mediaItemCount, 300)) { val m = c.getMediaItemAt(i).mediaMetadata; a.put(JSONObject().put("t", m.title?.toString() ?: "").put("s", m.artist?.toString() ?: "").put("i", i).put("on", i == c.currentMediaItemIndex)) }; reply(req, JSONObject().put("items", a)) }
            "lib" -> bg.execute { reply(req, JSONObject().put("items", libList(o.optString("view", "songs"), o.optString("key"), o.optString("q")))) }
            "playLib" -> bg.execute { val items = libTracks(o.optString("view", "songs"), o.optString("key"), o.optString("q")); main.post { playTracks(items, o.optLong("id", -1), o.optBoolean("shuffle")) } }
            "fav" -> { val id = o.optString("id"); val s = prefs.getStringSet("favs", emptySet())!!.toMutableSet(); if (!s.remove(id)) s.add(id); prefs.edit().putStringSet("favs", s).apply() }
            "radioList" -> bg.execute { reply(req, JSONObject().put("items", radioList(o.optString("tab", "near"), o.optString("state"), o.optString("q")))) }
            "radioPlay" -> playStation(o.optString("name"), o.optString("url"))
            "radioFav" -> { val n = o.optString("name"); val s = prefs.getStringSet("rfavs", emptySet())!!.toMutableSet(); if (!s.remove(n)) s.add(n); prefs.edit().putStringSet("rfavs", s).apply() }
            "radioState" -> switchState(o.optString("state"))
            "rec" -> if (rec.on) rec.stop() else curStation?.let { rec.start(it.optString("n"), it.optString("u"), it.optString("co")) } ?: msg("Chỉ thâu được khi đang nghe radio")
            "podGroups" -> reply(req, JSONObject().put("items", JSONArray().apply { put(JSONObject().put("k", "follow").put("t", "⭐ Theo Dõi")); val g = data().optJSONArray("pods") ?: JSONArray(); for (i in 0 until g.length()) put(JSONObject().put("k", g.getJSONObject(i).optString("k")).put("t", g.getJSONObject(i).optString("vi"))) }))
            "podList" -> bg.execute { reply(req, JSONObject().put("items", podList(o.optString("group"), o.optString("q")))) }
            "podFollow" -> { val a = followed(); val f = o.optString("feed"); var found = -1; for (i in 0 until a.length()) if (a.getJSONObject(i).optString("feed") == f) found = i
                if (found >= 0) a.remove(found) else a.put(JSONObject().put("t", o.optString("t")).put("s", o.optString("s")).put("feed", f).put("img", o.optString("img")).put("id", o.optString("id")))
                prefs.edit().putString("follow", a.toString()).apply(); msg(if (found >= 0) "Đã bỏ theo dõi" else "Đã theo dõi ${o.optString("t")}") }
            "podEps" -> bg.execute { reply(req, JSONObject().put("items", podEps(o.optString("feed"), o.optString("id")))) }
            "podPlay" -> playEpisode(o.optString("url"), o.optString("t"), o.optString("pod"))
            "dl" -> bg.execute { download(o.optString("url"), o.optString("t"), o.optString("pod"), true) }
            "dlAll" -> bg.execute { val eps = podEps(o.optString("feed"), o.optString("id")); var n = 0
                for (i in 0 until minOf(10, eps.length())) { val e = eps.getJSONObject(i); if (download(e.optString("url"), e.optString("t"), o.optString("pod"), false)) n++ }
                msg("Đã tải xong $n tập mới nhất của ${o.optString("pod")} (tự xoá sau 3 ngày)") }
            "recs" -> bg.execute { reply(req, JSONObject().put("items", recordings())) }
            "playFile" -> { val f = File(o.optString("path")); if (f.exists()) { kind = if (o.optString("type") == "pod") "podcast" else "track"; curStation = null; curPodUrl = ""
                setAndPlay(listOf(item(Uri.fromFile(f).toString(), o.optString("t", f.nameWithoutExtension), o.optString("s"))), 0) } }
            "delFile" -> { File(o.optString("path")).delete(); File(o.optString("path") + ".json").delete(); bg.execute { reply(req, JSONObject().put("items", recordings())) } }
            "lyrics" -> { val md = ctrl?.mediaMetadata; val t = md?.title?.toString() ?: ""; val ar = md?.artist?.toString() ?: ""; bg.execute { reply(req, lyrics(t, ar)) } }
            "voice" -> bg.execute { voicePlay(o.optString("kind"), o.optString("q"), req) }
        }
    }

    private fun item(uri: String, title: String, sub: String, album: String = ""): MediaItem =
        MediaItem.Builder().setUri(uri).setMediaId(uri)
            .setMediaMetadata(MediaMetadata.Builder().setTitle(title).setArtist(sub).setAlbumTitle(album).build()).build()

    private fun setAndPlay(items: List<MediaItem>, start: Int, posMs: Long = 0) = connect {
        val c = ctrl!!
        lastErr = ""
        c.setMediaItems(items, start.coerceIn(0, maxOf(0, items.size - 1)), posMs)
        c.prepare(); c.play()
    }

    // ---------------- songs in the phone ----------------
    data class T(val id: Long, val title: String, val artist: String, val album: String, val albumId: Long, val dur: Long, val folder: String, val added: Long)
    @Volatile private var lib: List<T>? = null
    private var libAt = 0L
    private fun library(): List<T> {
        lib?.let { if (System.currentTimeMillis() - libAt < 10 * 60_000L) return it }
        val out = ArrayList<T>()
        try {
            val proj = arrayOf(MediaStore.Audio.Media._ID, MediaStore.Audio.Media.TITLE, MediaStore.Audio.Media.ARTIST, MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.ALBUM_ID, MediaStore.Audio.Media.DURATION, MediaStore.Audio.Media.DATA, MediaStore.Audio.Media.DATE_ADDED)
            app.contentResolver.query(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, proj, MediaStore.Audio.Media.IS_MUSIC + "!=0 AND " + MediaStore.Audio.Media.DURATION + ">20000", null, null)?.use { c ->
                while (c.moveToNext()) {
                    val path = c.getString(6) ?: ""
                    val folder = File(path).parentFile?.name ?: ""
                    out += T(c.getLong(0), c.getString(1) ?: File(path).nameWithoutExtension, (c.getString(2) ?: "").let { if (it == "<unknown>") "" else it },
                        c.getString(3) ?: "", c.getLong(4), c.getLong(5), folder, c.getLong(7))
                }
            }
        } catch (_: SecurityException) { msg("Cần cho phép đọc nhạc trong máy — Cài Đặt › Quyền") } catch (_: Exception) {}
        val sorted = out.sortedBy { it.title.lowercase() }
        lib = sorted; libAt = System.currentTimeMillis(); return sorted
    }
    private fun fold(s: String) = java.text.Normalizer.normalize(s.lowercase(), java.text.Normalizer.Form.NFD).replace(Regex("\\p{M}+"), "").replace('đ', 'd')
    private fun libTracks(view: String, key: String, q: String): List<T> {
        val all = library(); val fq = fold(q)
        var l = when (view) {
            "album" -> all.filter { it.album == key }.sortedBy { it.title.lowercase() }
            "artist" -> all.filter { it.artist == key }
            "folder" -> all.filter { it.folder == key }
            "favs" -> { val f = prefs.getStringSet("favs", emptySet())!!; all.filter { it.id.toString() in f } }
            "recent" -> all.sortedByDescending { it.added }.take(100)
            else -> all
        }
        if (fq.isNotBlank()) l = l.filter { fold(it.title + " " + it.artist + " " + it.album).contains(fq) }
        return l
    }
    private fun fmt(ms: Long): String { val s = ms / 1000; return "%d:%02d".format(s / 60, s % 60) }
    private fun libList(view: String, key: String, q: String): JSONArray {
        val a = JSONArray(); val all = library(); val fq = fold(q)
        val favs = prefs.getStringSet("favs", emptySet())!!
        fun group(sel: (T) -> String, kindName: String) {
            all.groupBy(sel).filterKeys { it.isNotBlank() && (fq.isBlank() || fold(it).contains(fq)) }.toSortedMap(compareBy { it.lowercase() })
                .forEach { (k, v) -> if (a.length() < 500) a.put(JSONObject().put("kind", kindName).put("key", k).put("t", k).put("s", "${v.size} bài" + if (kindName == "album") " · " + (v.first().artist) else "")) }
        }
        when (view) {
            "albums" -> group({ it.album }, "album")
            "artists" -> group({ it.artist }, "artist")
            "folders" -> group({ it.folder }, "folder")
            else -> libTracks(view, key, q).take(600).forEach { t -> a.put(JSONObject().put("kind", "track").put("id", t.id).put("t", t.title).put("s", listOf(t.artist, t.album).filter { it.isNotBlank() }.joinToString(" · ")).put("d", fmt(t.dur)).put("fav", t.id.toString() in favs)) }
        }
        return a
    }
    private fun playTracks(list: List<T>, startId: Long, shuffle: Boolean) {
        if (list.isEmpty()) { msg("Không có bài nào"); return }
        kind = "track"; curStation = null; curPodUrl = ""; rec.stop()
        val items = list.take(1000).map { item(ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, it.id).toString(), it.title, it.artist, it.album) }
        val start = if (startId >= 0) list.indexOfFirst { it.id == startId }.coerceAtLeast(0) else if (shuffle) (list.indices).random() else 0
        connect { ctrl!!.shuffleModeEnabled = shuffle }
        setAndPlay(items, start)
    }

    // ---------------- radio ----------------
    private var dataJ: JSONObject? = null
    private fun data(): JSONObject = dataJ ?: try { JSONObject(app.assets.open("music/data.json").bufferedReader().use { it.readText() }).also { dataJ = it } } catch (_: Exception) { JSONObject() }
    private fun stations(): JSONArray = data().optJSONArray("stations") ?: JSONArray()
    private val GENRE = mapOf("news" to "Tin Tức", "talk" to "Nói Chuyện", "pop" to "Nhạc Trẻ", "hits" to "Nhạc Hits", "classic" to "Nhạc Xưa", "sport" to "Thể Thao",
        "community" to "Cộng Đồng", "jazz" to "Jazz", "country" to "Đồng Quê", "kids" to "Thiếu Nhi", "viet" to "Tiếng Việt")
    private val GROUP = mapOf("NAT" to "Toàn Úc", "AUVN" to "Tiếng Việt tại Úc", "OS" to "Người Việt hải ngoại", "VOV" to "VOV", "HN" to "Hà Nội", "PROV" to "Các tỉnh")
    private fun radioList(tab: String, state: String, q: String): JSONArray {
        val a = JSONArray(); val st = stations(); val fav = prefs.getStringSet("rfavs", emptySet())!!; val fq = fold(q)
        for (i in 0 until st.length()) {
            val s = st.getJSONObject(i); val g = s.optString("g"); val c = s.optString("c")
            val ok = when (tab) {
                "near" -> g == state || g == "NAT" || g == "AUVN"
                "fav" -> s.optString("n") in fav
                "au" -> c == "AU"
                "vn" -> c == "VN" || c == "OS" || g == "AUVN"
                else -> fq.isNotBlank() && fold(s.optString("n")).contains(fq)
            }
            if (!ok) continue
            a.put(JSONObject().put("n", s.optString("n")).put("t", s.optString("n")).put("s", (GENRE[s.optString("ge")] ?: s.optString("ge")) + " · " + (GROUP[g] ?: g)).put("fav", s.optString("n") in fav).put("g", g))
        }
        if (tab == "near") { val l = (0 until a.length()).map { a.getJSONObject(it) }.sortedBy { if (it.optString("g") == state) 0 else 1 }; return JSONArray().apply { l.forEach { put(it) } } }
        return a
    }
    private fun findStation(name: String): JSONObject? { val st = stations(); for (i in 0 until st.length()) if (st.getJSONObject(i).optString("n") == name) return st.getJSONObject(i); return null }
    private val rbHosts = listOf("de1.api.radio-browser.info", "nl1.api.radio-browser.info", "at1.api.radio-browser.info", "de2.api.radio-browser.info")
    private fun resolve(s: JSONObject): Boolean {
        if (s.optString("u").isNotBlank()) return true
        val cc = when (s.optString("c")) { "AU" -> "&countrycode=AU"; "VN" -> "&countrycode=VN"; else -> "" }
        for (h in rbHosts) try {
            val arr = JSONArray(get("https://$h/json/stations/search?name=${enc(s.optString("q"))}$cc&hidebroken=true&order=clickcount&reverse=true&limit=15", 9000))
            var best: JSONObject? = null
            for (i in 0 until arr.length()) { val o = arr.getJSONObject(i); if (o.optInt("lastcheckok", 1) == 0) continue; if (best == null || o.optInt("bitrate") > best.optInt("bitrate") && o.optInt("bitrate") <= 320) best = o }
            if (best != null) { s.put("u", best.optString("url_resolved").ifBlank { best.optString("url") }); s.put("co", best.optString("codec")); return true }
            return false
        } catch (_: Exception) { }
        return false
    }
    private fun playStation(name: String, url: String) {
        bg.execute {
            val s = findStation(name) ?: JSONObject().put("n", name).put("u", url).put("q", name)
            if (!resolve(s)) { lastErr = "Đài $name đang tạm ngưng"; msg("Đài $name đang tạm ngưng — thử đài khác"); return@execute }
            main.post {
                rec.stop(); kind = "radio"; curStation = s; curPodUrl = ""
                prefs.edit().putString("lastStation", s.optString("n")).apply()
                setAndPlay(listOf(item(s.optString("u"), s.optString("n"), "Radio · " + (GENRE[s.optString("ge")] ?: ""))), 0)
            }
        }
    }
    private fun stepStation(d: Int) {
        val cur = curStation?.optString("n") ?: return
        val fav = prefs.getStringSet("rfavs", emptySet())!!.toList().sorted()
        val list = if (fav.size >= 2 && cur in fav) fav else { val st = stations(); val g = curStation?.optString("g"); (0 until st.length()).map { st.getJSONObject(it) }.filter { it.optString("g") == g }.map { it.optString("n") } }
        if (list.size < 2) return
        val i = list.indexOf(cur); playStation(list[((if (i < 0) 0 else i) + d + list.size) % list.size], "")
    }
    /** Road Trip into another state: a local station of the old state changes to the same kind of station there. */
    private fun switchState(state: String) {
        val s = curStation ?: return
        if (kind != "radio" || ctrl?.isPlaying != true) return
        val g = s.optString("g"); if (g == state || g.length != 3 && g != "SA" && g != "WA" && g != "NT") return
        if (g == "NAT" || g == "AUVN" || s.optString("c") != "AU") return
        val st = stations(); val all = (0 until st.length()).map { st.getJSONObject(it) }.filter { it.optString("g") == state }
        val pick = all.firstOrNull { it.optString("ge") == s.optString("ge") } ?: all.firstOrNull { it.optString("ge") == "talk" } ?: return
        msg("Đã qua bang $state — đổi qua đài ${pick.optString("n")}")
        playStation(pick.optString("n"), "")
    }

    // ---------------- recording the radio ----------------
    class Rec {
        @Volatile var on = false
        private var since = 0L
        fun seconds() = if (on) (System.currentTimeMillis() - since) / 1000 else 0
        fun stop() { on = false }
        fun start(name: String, url: String, codec: String) {
            if (on || url.isBlank()) return
            on = true; since = System.currentTimeMillis()
            Thread {
                val ext = when { codec.contains("AAC", true) -> "aac"; codec.contains("OGG", true) -> "ogg"; codec.contains("OPUS", true) -> "opus"; else -> "mp3" }
                val stamp = SimpleDateFormat("yyyy-MM-dd HH.mm", Locale.US).format(Date())
                val dir = recDir().apply { mkdirs() }
                val f = File(dir, "${name.replace(Regex("[\\\\/:*?\"<>|]"), "_")} $stamp.$ext")
                try {
                    f.outputStream().use { o ->
                        var tries = 0
                        while (on && tries < 20) {
                            try {
                                val c = URL(url).openConnection() as HttpURLConnection
                                c.connectTimeout = 10000; c.readTimeout = 15000; c.setRequestProperty("User-Agent", UA)
                                c.inputStream.use { inp -> val buf = ByteArray(16384); while (on) { val n = inp.read(buf); if (n < 0) break; o.write(buf, 0, n); tries = 0 } }
                                c.disconnect()
                            } catch (_: Exception) {}
                            if (on) { tries++; Thread.sleep(2000) }
                        }
                    }
                    File(f.path + ".json").writeText(JSONObject().put("t", name + " · " + stamp).put("type", "rec").toString())
                    msg("Đã lưu bản thâu: ${f.name}")
                } catch (e: Exception) { msg("Thâu bị lỗi: ${e.message ?: ""}") }
                on = false
            }.start()
        }
    }
    val rec = Rec()
    private fun recDir() = File(app.getExternalFilesDir(Environment.DIRECTORY_MUSIC) ?: app.filesDir, "Thâu Radio")
    private fun podDir() = File(app.getExternalFilesDir(Environment.DIRECTORY_PODCASTS) ?: app.filesDir, "Podcast")

    // ---------------- podcasts ----------------
    private fun followed(): JSONArray = try { JSONArray(prefs.getString("follow", "[]")) } catch (_: Exception) { JSONArray() }
    private fun podList(group: String, q: String): JSONArray {
        if (group == "follow") return followed()
        if (group == "search") {
            val a = JSONArray(); if (q.isBlank()) return a
            try { val r = JSONObject(get("https://itunes.apple.com/search?media=podcast&limit=40&term=${enc(q)}")).optJSONArray("results") ?: JSONArray()
                for (i in 0 until r.length()) { val o = r.getJSONObject(i); if (o.optString("feedUrl").isBlank()) continue; a.put(JSONObject().put("t", o.optString("collectionName")).put("s", o.optString("artistName")).put("feed", o.optString("feedUrl")).put("img", o.optString("artworkUrl600")).put("id", o.optString("collectionId"))) }
            } catch (_: Exception) { msg("Không tìm được — kiểm tra mạng") }
            return a
        }
        val cache = prefs.getString("pg_$group", null); val at = prefs.getLong("pgAt_$group", 0)
        if (cache != null && System.currentTimeMillis() - at < 24 * 3600_000L) return JSONArray(cache)
        val g = data().optJSONArray("pods")?.let { arr -> (0 until arr.length()).map { arr.getJSONObject(it) }.firstOrNull { it.optString("k") == group } } ?: return JSONArray()
        val ids = g.optJSONArray("ids") ?: JSONArray(); val idl = (0 until ids.length()).map { ids.getString(it) }
        val got = LinkedHashMap<String, JSONObject>()
        for (cc in listOf("", "&country=vn", "&country=au")) {
            val need = idl.filter { it !in got }; if (need.isEmpty()) break
            try { val r = JSONObject(get("https://itunes.apple.com/lookup?id=${need.joinToString(",")}$cc", 15000)).optJSONArray("results") ?: continue
                for (i in 0 until r.length()) { val o = r.getJSONObject(i); val id = o.optString("collectionId"); if (o.optString("feedUrl").isBlank() || id !in need) continue
                    got[id] = JSONObject().put("t", o.optString("collectionName")).put("s", o.optString("artistName")).put("feed", o.optString("feedUrl")).put("img", o.optString("artworkUrl600")).put("id", id) }
            } catch (_: Exception) {}
        }
        val a = JSONArray(); idl.forEach { got[it]?.let { o -> a.put(o) } }
        if (a.length() > 0) prefs.edit().putString("pg_$group", a.toString()).putLong("pgAt_$group", System.currentTimeMillis()).apply()
        return a
    }
    private val dateFmts = listOf("EEE, dd MMM yyyy HH:mm:ss Z", "EEE, d MMM yyyy HH:mm:ss Z", "EEE, dd MMM yyyy HH:mm:ss zzz", "EEE, dd MMM yyyy HH:mm Z", "dd MMM yyyy HH:mm:ss Z", "EEE, dd MMM yyyy", "yyyy-MM-dd'T'HH:mm:ssXXX", "yyyy-MM-dd")
    private fun parseDate(s: String): Long { val t = s.replace(Regex("\\s+"), " ").trim(); for (f in dateFmts) try { return SimpleDateFormat(f, Locale.ENGLISH).parse(t)?.time ?: continue } catch (_: Exception) {}; return 0L }
    private fun parseDur(s: String): Long { val p = s.trim().split(":").mapNotNull { it.toLongOrNull() }; return when (p.size) { 3 -> p[0] * 3600 + p[1] * 60 + p[2]; 2 -> p[0] * 60 + p[1]; 1 -> p[0]; else -> 0 } }
    private fun podEps(feed0: String, id: String): JSONArray {
        var feed = feed0
        if (feed.isBlank() && id.isNotBlank()) try { feed = JSONObject(get("https://itunes.apple.com/lookup?id=$id")).optJSONArray("results")?.optJSONObject(0)?.optString("feedUrl") ?: "" } catch (_: Exception) {}
        val a = JSONArray(); if (feed.isBlank()) return a
        try {
            val p = Xml.newPullParser(); p.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false); p.setInput(get(feed, 15000).reader())
            val out = ArrayList<Pair<Long, JSONObject>>()
            var inItem = false; var title = ""; var url = ""; var stamp = 0L; var dur = 0L
            var ev = p.eventType
            while (ev != XmlPullParser.END_DOCUMENT && out.size < 400) {
                if (ev == XmlPullParser.START_TAG) when (p.name) {
                    "item" -> { inItem = true; title = ""; url = ""; stamp = 0; dur = 0 }
                    "title" -> if (inItem) title = p.nextText().trim()
                    "enclosure" -> if (inItem) url = p.getAttributeValue(null, "url") ?: ""
                    "pubDate" -> if (inItem) stamp = parseDate(p.nextText())
                    "itunes:duration" -> if (inItem) dur = parseDur(p.nextText())
                } else if (ev == XmlPullParser.END_TAG && p.name == "item") { inItem = false; if (url.isNotBlank()) out += stamp to JSONObject().put("t", title).put("url", url).put("at", stamp).put("dur", dur) }
                ev = p.next()
            }
            out.sortedByDescending { it.first }.take(60).forEach { (st, o) ->
                o.put("date", if (st > 0) SimpleDateFormat("dd/MM/yyyy", Locale.US).format(Date(st)) else "")
                o.put("dl", dlFile(o.optString("url")).exists()); o.put("dur", if (o.optLong("dur") > 0) "${o.optLong("dur") / 60} phút" else ""); a.put(o) }
        } catch (_: Exception) { msg("Không đọc được danh sách tập — kiểm tra mạng") }
        return a
    }
    private fun dlFile(url: String): File = File(podDir(), Integer.toHexString(url.hashCode()) + "_" + url.substringAfterLast('/').substringBefore('?').takeLast(40).replace(Regex("[^A-Za-z0-9._-]"), "_").ifBlank { "tap.mp3" })
    private fun download(url: String, title: String, pod: String, say: Boolean): Boolean {
        val f = dlFile(url); if (f.exists()) { if (say) msg("Tập này đã tải rồi"); return true }
        podDir().mkdirs()
        if (say) msg("Đang tải: $title")
        return try {
            val tmp = File(f.path + ".part")
            var u = url; var c: HttpURLConnection
            var hops = 0
            while (true) { c = URL(u).openConnection() as HttpURLConnection; c.instanceFollowRedirects = false; c.connectTimeout = 15000; c.readTimeout = 30000; c.setRequestProperty("User-Agent", UA)
                val code = c.responseCode; if (code in 300..399 && hops++ < 8) { u = URL(URL(u), c.getHeaderField("Location")).toString(); c.disconnect(); continue }; break }
            c.inputStream.use { inp -> tmp.outputStream().use { inp.copyTo(it, 64 * 1024) } }
            c.disconnect(); tmp.renameTo(f)
            File(f.path + ".json").writeText(JSONObject().put("t", title).put("s", pod).put("url", url).put("type", "pod").put("at", System.currentTimeMillis()).toString())
            if (say) msg("Đã tải xong: $title (tự xoá sau 3 ngày)")
            true
        } catch (e: Exception) { if (say) msg("Tải không được: ${e.message ?: ""}"); false }
    }
    /** Downloaded episodes are kept 3 days (#138). */
    private fun cleanDownloads() {
        val cut = System.currentTimeMillis() - 3 * 24 * 3600_000L
        podDir().listFiles()?.forEach { if (it.lastModified() < cut) it.delete() }
    }
    private fun playEpisode(url: String, title: String, pod: String) {
        val f = dlFile(url)
        kind = "podcast"; curStation = null; curPodUrl = url; rec.stop()
        val pos = prefs.getLong("pp_" + url.hashCode(), 0L)
        setAndPlay(listOf(item(if (f.exists()) Uri.fromFile(f).toString() else url, title, pod)), 0, pos)
    }
    private fun recordings(): JSONArray {
        val a = JSONArray()
        val files = (recDir().listFiles() ?: emptyArray()).toList() + (podDir().listFiles() ?: emptyArray()).toList()
        files.filter { it.isFile && !it.name.endsWith(".json") && !it.name.endsWith(".part") }.sortedByDescending { it.lastModified() }.forEach { f ->
            val meta = try { JSONObject(File(f.path + ".json").readText()) } catch (_: Exception) { JSONObject() }
            val left = 3 - (System.currentTimeMillis() - f.lastModified()) / (24 * 3600_000L)
            a.put(JSONObject().put("path", f.path).put("t", meta.optString("t", f.nameWithoutExtension)).put("type", meta.optString("type", "rec"))
                .put("s", if (meta.optString("type") == "pod") (meta.optString("s") + " · còn " + maxOf(0, left) + " ngày") else ("Thâu radio · " + (f.length() / 1048576) + " MB")))
        }
        return a
    }

    // ---------------- lyrics (LRCLIB) ----------------
    private fun lyrics(title: String, artist: String): JSONObject {
        val out = JSONObject().put("title", title)
        if (title.isBlank() || kind != "track") return out.put("lines", JSONArray()).put("note", "Lời bài hát chỉ có khi nghe nhạc trong máy")
        val dir = File(app.filesDir, "lyrics").apply { mkdirs() }
        val f = File(dir, (artist + "-" + title).replace(Regex("[^\\w\\-]+"), "_").take(120) + ".lrc")
        var text = if (f.exists()) f.readText() else ""
        if (text.isBlank()) {
            try { val o = JSONObject(get("https://lrclib.net/api/get?artist_name=${enc(artist)}&track_name=${enc(title)}")); text = o.optString("syncedLyrics").ifBlank { o.optString("plainLyrics") } } catch (_: Exception) {}
            if (text.isBlank()) try { val a = JSONArray(get("https://lrclib.net/api/search?q=${enc("$artist $title")}")); if (a.length() > 0) { val o = a.getJSONObject(0); text = o.optString("syncedLyrics").ifBlank { o.optString("plainLyrics") } } } catch (_: Exception) {}
            if (text.isNotBlank()) f.writeText(text)
        }
        val re = Regex("\\[(\\d+):(\\d+)(?:[.:](\\d+))?]"); val lines = JSONArray()
        text.lines().forEach { line -> val ms = re.findAll(line).toList(); val w = line.replace(re, "").trim()
            if (ms.isEmpty()) { if (line.isNotBlank() && !line.startsWith("[")) lines.put(JSONObject().put("ms", -1).put("t", line.trim())) }
            else ms.forEach { m -> val fr = m.groupValues[3]; lines.put(JSONObject().put("ms", m.groupValues[1].toLong() * 60000 + m.groupValues[2].toLong() * 1000 + (if (fr.isEmpty()) 0 else (fr + "00").take(3).toLong())).put("t", w)) } }
        return out.put("lines", lines).put("note", if (lines.length() == 0) "Chưa tìm được lời bài này" else "")
    }

    // ---------------- voice ("Hey Tom, mở bài …", "mở đài …", "nghe podcast mới nhất") ----------------
    private fun voicePlay(k: String, q: String, req: String) {
        val fq = fold(q)
        when (k) {
            "radio" -> { val st = stations(); var best: JSONObject? = null
                for (i in 0 until st.length()) { val s = st.getJSONObject(i); if (fold(s.optString("n")).contains(fq) || fold(s.optString("q")).contains(fq)) { best = s; break } }
                if (best != null) { playStation(best.optString("n"), ""); reply(req, JSONObject().put("say", "Dạ, mở đài " + best.optString("n"))) } else reply(req, JSONObject().put("say", "Dạ, không thấy đài $q")) }
            "podcast" -> { val f = followed(); val ch = if (fq.isBlank()) (if (f.length() > 0) f.getJSONObject(0) else null) else (0 until f.length()).map { f.getJSONObject(it) }.firstOrNull { fold(it.optString("t")).contains(fq) }
                val c = ch ?: podList("vnnews", "").optJSONObject(0)
                if (c == null) { reply(req, JSONObject().put("say", "Dạ, chưa có kênh podcast nào")); return }
                val eps = podEps(c.optString("feed"), c.optString("id")); val e = eps.optJSONObject(0)
                if (e == null) { reply(req, JSONObject().put("say", "Dạ, chưa lấy được tập mới")); return }
                main.post { playEpisode(e.optString("url"), e.optString("t"), c.optString("t")) }; reply(req, JSONObject().put("say", "Dạ, mở tập mới nhất của " + c.optString("t"))) }
            else -> { val l = library(); val hit = if (fq.isBlank()) l else l.filter { fold(it.title + " " + it.artist + " " + it.album).contains(fq) }
                if (hit.isEmpty()) { reply(req, JSONObject().put("say", "Dạ, không thấy bài $q trong máy")); return }
                main.post { playTracks(hit, -1, fq.isBlank()) }; reply(req, JSONObject().put("say", if (fq.isBlank()) "Dạ, phát nhạc nè" else "Dạ, mở " + hit.first().title)) }
        }
    }

    // ---------------- remember what was playing (Tự phát tiếp khi lên xe) ----------------
    fun saveLast() {
        val c = ctrl ?: return
        if (c.mediaItemCount == 0) return
        try {
            if (kind == "podcast" && curPodUrl.isNotBlank()) prefs.edit().putLong("pp_" + curPodUrl.hashCode(), c.currentPosition).apply()
            val a = JSONArray()
            if (kind == "track") for (i in 0 until minOf(c.mediaItemCount, 1000)) { val m = c.getMediaItemAt(i); a.put(JSONObject().put("u", m.mediaId).put("t", m.mediaMetadata.title?.toString() ?: "").put("s", m.mediaMetadata.artist?.toString() ?: "")) }
            prefs.edit().putString("last", JSONObject().put("kind", kind).put("items", a).put("idx", c.currentMediaItemIndex).put("pos", c.currentPosition)
                .put("station", curStation?.optString("n") ?: "").put("pod", curPodUrl).put("podT", c.mediaMetadata.title?.toString() ?: "").put("podS", c.mediaMetadata.artist?.toString() ?: "").toString()).apply()
        } catch (_: Exception) {}
    }
    private fun resumeLast() {
        val o = try { JSONObject(prefs.getString("last", "{}")) } catch (_: Exception) { JSONObject() }
        when (o.optString("kind")) {
            "radio" -> playStation(o.optString("station"), "")
            "podcast" -> playEpisode(o.optString("pod"), o.optString("podT"), o.optString("podS"))
            "track" -> { val a = o.optJSONArray("items") ?: JSONArray(); if (a.length() == 0) { bg.execute { val l = library(); main.post { playTracks(l, -1, true) } }; return }
                kind = "track"; curStation = null; curPodUrl = ""
                setAndPlay((0 until a.length()).map { val i = a.getJSONObject(it); item(i.optString("u"), i.optString("t"), i.optString("s")) }, o.optInt("idx"), o.optLong("pos")) }
            else -> bg.execute { val l = library(); main.post { if (l.isNotEmpty()) playTracks(l, -1, true) else msg("Chưa có bài nhạc nào trong máy") } }
        }
    }
}
