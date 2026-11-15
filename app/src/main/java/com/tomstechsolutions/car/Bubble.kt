package com.tomstechsolutions.car

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import kotlin.math.abs

/** #73: a small half-transparent Tom's Car bubble that floats over other apps while Tom's Car is covered.
 *  Tap = back to Tom's Car, drag = move (snaps to the nearest side), long-press = hide until next time.
 *  Uses the activity's own display, so on DeX it shows on the DeX screen. */
object Bubble {
    private var view: View? = null
    private var wm: WindowManager? = null
    private var lp: WindowManager.LayoutParams? = null
    var enabled = true
    private var lastX = -1; private var lastY = -1

    fun canDraw(ctx: Context) = Settings.canDrawOverlays(ctx)

    /** Ask once (first Workspace launch): opens the "draw over other apps" page for Tom's Car. */
    fun askOnce(a: Activity) {
        if (canDraw(a)) return
        val sp = a.getSharedPreferences("tc", Context.MODE_PRIVATE)
        if (sp.getBoolean("bubbleAsked", false)) return
        sp.edit().putBoolean("bubbleAsked", true).apply()
        Launcher.toast(a, "Cho phép Tom's Car hiện nút nổi trên app khác — bấm nút đó là về Tom's Car")
        try { a.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + a.packageName)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) {}
    }

    @SuppressLint("ClickableViewAccessibility")
    fun show(a: Activity) {
        if (!enabled || view != null || !canDraw(a)) return
        try {
            val disp = if (Build.VERSION.SDK_INT >= 30) a.display else null
            val ctx: Context = if (Build.VERSION.SDK_INT >= 30 && disp != null) a.createWindowContext(disp, WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, null) else a.applicationContext
            val w = ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val dm = ctx.resources.displayMetrics
            val size = (58 * dm.density).toInt()
            val box = FrameLayout(ctx)
            box.background = GradientDrawable().apply { shape = GradientDrawable.OVAL; setColor(0xE603111C.toInt()); setStroke((2 * dm.density).toInt(), 0xFFFBB040.toInt()) }
            val img = ImageView(ctx); img.setImageResource(R.mipmap.ic_launcher); img.scaleType = ImageView.ScaleType.FIT_CENTER
            val pad = (6 * dm.density).toInt(); img.setPadding(pad, pad, pad, pad)
            box.addView(img, FrameLayout.LayoutParams(size, size))
            box.alpha = 0.5f
            box.contentDescription = "Về Tom's Car"
            val p = WindowManager.LayoutParams(size, size, WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, PixelFormat.TRANSLUCENT)
            p.gravity = Gravity.TOP or Gravity.START
            p.x = if (lastX >= 0) lastX else dm.widthPixels - size - (8 * dm.density).toInt()
            p.y = if (lastY >= 0) lastY else dm.heightPixels / 3
            val slop = ViewConfiguration.get(ctx).scaledTouchSlop
            var downX = 0f; var downY = 0f; var startX = 0; var startY = 0; var moved = false; var downAt = 0L; var longDone = false
            val longPress = Runnable { longDone = true; hide(); Launcher.toast(a, "Đã ẩn nút nổi — lần sau mở app khác sẽ hiện lại") }
            box.setOnTouchListener { v, e ->
                when (e.action) {
                    MotionEvent.ACTION_DOWN -> { downX = e.rawX; downY = e.rawY; startX = p.x; startY = p.y; moved = false; longDone = false; downAt = System.currentTimeMillis(); v.alpha = 0.85f; v.postDelayed(longPress, 650) }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = e.rawX - downX; val dy = e.rawY - downY
                        if (!moved && (abs(dx) > slop || abs(dy) > slop)) { moved = true; v.removeCallbacks(longPress) }
                        if (moved) { p.x = (startX + dx).toInt(); p.y = (startY + dy).toInt(); try { w.updateViewLayout(v, p) } catch (_: Exception) {} }
                    }
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                        v.removeCallbacks(longPress); v.alpha = 0.5f
                        if (longDone) return@setOnTouchListener true
                        if (moved) {   // snap to the nearest side
                            val W = ctx.resources.displayMetrics.widthPixels
                            p.x = if (p.x + size / 2 < W / 2) (6 * dm.density).toInt() else W - size - (6 * dm.density).toInt()
                            p.y = p.y.coerceIn(0, ctx.resources.displayMetrics.heightPixels - size)
                            lastX = p.x; lastY = p.y
                            try { w.updateViewLayout(v, p) } catch (_: Exception) {}
                        } else if (e.action == MotionEvent.ACTION_UP && System.currentTimeMillis() - downAt < 650) {
                            backToCar(a)
                        }
                    }
                }
                true
            }
            w.addView(box, p)
            view = box; wm = w; lp = p
        } catch (_: Exception) { view = null }
    }

    fun hide() {
        val v = view ?: return
        try { wm?.removeView(v) } catch (_: Exception) {}
        view = null; wm = null; lp = null
    }

    private fun backToCar(a: Activity) {
        hide()
        try { a.startActivity(Intent(a, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)) } catch (_: Exception) {}
    }
}
