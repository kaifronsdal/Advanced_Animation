package com.example.callwall

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.view.WindowManager
import android.widget.Button
import android.view.View
import android.content.Context
import android.view.Gravity
import android.graphics.PixelFormat
import android.widget.Toast
import android.view.MotionEvent
import android.view.ViewGroup.LayoutParams;
import kotlin.math.abs
import android.os.Build



class Popup : Service(), View.OnClickListener, View.OnTouchListener {
    private var topLeftView: View? = null

    private var overlayedButton: Button? = null
    private var offsetX: Float = 0.toFloat()
    private var offsetY: Float = 0.toFloat()
    private var originalXPos: Int = 0
    private var originalYPos: Int = 0
    private var moving: Boolean = false
    private var wm: WindowManager? = null

    override fun onBind(p0: Intent): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()

        wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        overlayedButton = Button(this)
        overlayedButton?.text = "Overlay button"
        overlayedButton?.setOnTouchListener(this)
        overlayedButton?.alpha = 0.0f
        overlayedButton?.setBackgroundColor(0x55fe4444)
        overlayedButton?.setOnClickListener(this)

        val LAYOUT_FLAG: Int
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            LAYOUT_FLAG,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.LEFT or Gravity.TOP
        params.x = 0
        params.y = 0
        wm?.addView(overlayedButton, params)

        topLeftView = View(this)
        val topLeftParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            LAYOUT_FLAG,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )
        topLeftParams.gravity = Gravity.LEFT or Gravity.TOP
        topLeftParams.x = 0
        topLeftParams.y = 0
        topLeftParams.width = 0
        topLeftParams.height = 0
        wm?.addView(topLeftView, topLeftParams)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayedButton != null) {
            wm?.removeView(overlayedButton)
            wm?.removeView(topLeftView)
            overlayedButton = null
            topLeftView = null
        }
    }

    override fun onTouch(v: View, event: MotionEvent): Boolean {

        if (event.action == MotionEvent.ACTION_DOWN) {
            val x = event.rawX
            val y = event.rawY

            moving = false

            val location = IntArray(2)
            overlayedButton?.getLocationOnScreen(location)

            originalXPos = location[0]
            originalYPos = location[1]

            offsetX = originalXPos - x
            offsetY = originalYPos - y

        } else if (event.action == MotionEvent.ACTION_MOVE) {
            val topLeftLocationOnScreen = IntArray(2)
            topLeftView?.getLocationOnScreen(topLeftLocationOnScreen)

            println("topLeftY=" + topLeftLocationOnScreen[1])
            println("originalY=$originalYPos")

            val x = event.rawX
            val y = event.rawY

            val params = overlayedButton?.layoutParams as LayoutParams

            val newX = (offsetX + x).toInt()
            val newY = (offsetY + y).toInt()

            if (abs(newX - originalXPos) < 1 && abs(newY - originalYPos) < 1 && !moving) {
                return false
            }

            params.width = newX - topLeftLocationOnScreen[0]
            params.height = newY - topLeftLocationOnScreen[1]

            wm?.updateViewLayout(overlayedButton, params)
            moving = true
        } else if (event.action == MotionEvent.ACTION_UP) {
            if (moving) {
                return true
            }
        }

        return false
    }

    override fun onClick(v: View) {
        Toast.makeText(this, "Overlay button click event", Toast.LENGTH_SHORT).show()
    }
}