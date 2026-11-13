package com.tomstechsolutions.car

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.util.Log
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

/**
 * Reads live values from an ELM327-compatible Bluetooth OBD-II adapter (e.g. Veepeak OBDCheck BLE,
 * which also offers classic Bluetooth on Android). Runs on its own thread and reconnects by itself.
 * Tries the standard OBD-II protocol search first (ATSP0); if the car answers nothing,
 * it walks the older protocols a 2006 Toyota diesel may use (ISO 9141-2, KWP2000 slow/fast).
 */
class Obd(private val adapter: BluetoothAdapter?, private val pickAddress: () -> String?) {

    @Volatile var connected = false
        private set
    @Volatile var speed: Double? = null
        private set
    @Volatile var rpm: Double? = null
        private set
    @Volatile var coolant: Double? = null
        private set
    @Volatile var volt: Double? = null
        private set
    @Volatile var protocol: String = ""
        private set
    @Volatile var status: String = ""
        private set

    private var thread: Thread? = null
    @Volatile private var running = false
    private var socket: BluetoothSocket? = null

    private val spp: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    fun start() {
        if (running) return
        running = true
        thread = Thread({ loop() }, "TomsCar-OBD").apply { isDaemon = true; start() }
    }

    fun stop() {
        running = false
        try { socket?.close() } catch (_: Exception) {}
        thread?.interrupt()
    }

    @SuppressLint("MissingPermission")
    private fun findDevice(): BluetoothDevice? {
        val a = adapter ?: return null
        if (!a.isEnabled) return null
        val bonded: Set<BluetoothDevice> = try { a.bondedDevices ?: emptySet() } catch (_: SecurityException) { emptySet() }
        val want = pickAddress()
        if (!want.isNullOrEmpty()) bonded.firstOrNull { it.address == want }?.let { return it }
        return bonded.firstOrNull {
            val nm: String? = try { it.name } catch (_: SecurityException) { null }
            val n = (nm ?: "").lowercase()
            listOf("obd", "elm", "veepeak", "vgate", "icar", "vlink", "v-link", "obdlink", "obdii").any { k -> n.contains(k) }
        }
    }

    @SuppressLint("MissingPermission")
    private fun loop() {
        var wait = 3000L
        while (running) {
            val dev = findDevice()
            if (dev == null) { clear("Chưa thấy cục OBD"); sleep(8000); continue }
            try {
                status = "Đang nối…"
                try { adapter?.cancelDiscovery() } catch (_: SecurityException) {}
                val s = dev.createRfcommSocketToServiceRecord(spp)
                socket = s
                s.connect()
                val inp = s.inputStream; val out = s.outputStream
                init(inp, out)
                connected = true; wait = 3000L; status = "Đã nối"
                while (running && s.isConnected) {
                    speed = pid(inp, out, "010D", 1)?.let { it[0].toDouble() }
                    rpm = pid(inp, out, "010C", 2)?.let { (it[0] * 256 + it[1]) / 4.0 }
                    coolant = pid(inp, out, "0105", 1)?.let { it[0] - 40.0 }
                    volt = cmd(inp, out, "ATRV").replace("V", "").trim().toDoubleOrNull()
                    sleep(700)
                }
            } catch (e: Exception) {
                Log.w("TomsCar", "OBD: ${e.message}")
            }
            try { socket?.close() } catch (_: Exception) {}
            clear("Mất kết nối OBD")
            sleep(wait); wait = (wait * 2).coerceAtMost(30000L)
        }
    }

    private fun clear(msg: String) { connected = false; speed = null; rpm = null; coolant = null; volt = null; status = msg }

    private fun init(inp: InputStream, out: OutputStream) {
        cmd(inp, out, "ATZ", 2500)
        for (c in listOf("ATE0", "ATL0", "ATS0", "ATH0", "ATAT1")) cmd(inp, out, c)
        // 0 = automatic, then the older protocols used by mid-2000s Toyotas
        for (p in listOf("0", "3", "4", "5", "6")) {
            cmd(inp, out, "ATSP$p")
            val r = cmd(inp, out, "0100", 6000)
            if (r.contains("4100")) { protocol = cmd(inp, out, "ATDP"); return }
        }
        protocol = "?"
    }

    /** Sends a mode-01 PID and returns the data bytes, or null when the car does not answer it. */
    private fun pid(inp: InputStream, out: OutputStream, c: String, n: Int): IntArray? {
        val r = cmd(inp, out, c).replace(" ", "")
        val head = "41" + c.substring(2)
        val i = r.indexOf(head)
        if (i < 0 || r.length < i + head.length + n * 2) return null
        return IntArray(n) { k -> r.substring(i + head.length + k * 2, i + head.length + k * 2 + 2).toInt(16) }
    }

    private fun cmd(inp: InputStream, out: OutputStream, c: String, timeoutMs: Long = 1500): String {
        out.write((c + "\r").toByteArray()); out.flush()
        val sb = StringBuilder(); val end = System.currentTimeMillis() + timeoutMs
        while (System.currentTimeMillis() < end) {
            if (inp.available() > 0) {
                val ch = inp.read().toChar()
                if (ch == '>') break
                sb.append(ch)
            } else sleep(10)
        }
        return sb.toString().replace("\r", " ").replace("\n", " ").replace("SEARCHING...", "").trim()
    }

    private fun sleep(ms: Long) { try { Thread.sleep(ms) } catch (_: InterruptedException) {} }
}
