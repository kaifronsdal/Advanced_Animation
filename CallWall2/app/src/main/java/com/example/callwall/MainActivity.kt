package com.example.callwall

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.Button
import android.view.Gravity
import android.view.LayoutInflater
import android.content.Context
import android.view.ViewGroup.LayoutParams;
import android.content.Intent
import androidx.core.content.ContextCompat.getSystemService
import android.icu.lang.UCharacter.GraphemeClusterBreak.T
import androidx.core.app.ActivityCompat.startActivityForResult
import android.provider.Settings
import android.widget.Toast
import android.provider.Settings.canDrawOverlays
import android.os.Build
import android.annotation.TargetApi
import android.Manifest.permission.ACCESS_FINE_LOCATION
import androidx.core.app.ActivityCompat
import androidx.core.app.ActivityCompat.startActivityForResult
import androidx.core.app.ComponentActivity
import androidx.core.app.ComponentActivity.ExtraData
import android.graphics.PixelFormat
import android.view.WindowManager
import android.content.DialogInterface
import android.app.AlertDialog
import android.view.MotionEvent
import android.view.View.OnTouchListener
import android.view.View


class MainActivity : AppCompatActivity() {
    //    var showPopupBtn: Button? = null
//    var closePopupBtn: Button? = null
//    var popupWindow: PopupWindow? = null
//    var linearLayout1: LinearLayout? = null
//
//
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_main)
//
//        showPopupBtn = findViewById(R.id.showPopupBtn);
//        linearLayout1 = findViewById(R.id.linearLayout1);
//
//        showPopupBtn?.setOnClickListener {
//            //instantiate the popup.xml layout file
//            val layoutInflater: LayoutInflater = this@MainActivity.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
//            val customView = layoutInflater.inflate(R.layout.popup, null)
//
//            closePopupBtn = customView.findViewById(R.id.closePopupBtn)
//
//            //instantiate popup window
//            popupWindow =
//                PopupWindow(customView, LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
//
//            //display the popup window
//            popupWindow?.showAtLocation(linearLayout1, Gravity.CENTER, 0, 0)
//
//            //close the popup window on button click
//            closePopupBtn?.setOnClickListener {
//                popupWindow?.dismiss()
//            }
//        }
//    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkPermissionOverlay()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>, grantResults: IntArray
    ) {
        Toast.makeText(
            this@MainActivity,
            "finished",
            Toast.LENGTH_LONG
        ).show()
        run()
    }

    fun run() {
        Toast.makeText(
            this@MainActivity,
            "run",
            Toast.LENGTH_LONG
        ).show()
        //----------
        // 1. Instantiate an <code><a href="/reference/android/app/AlertDialog.Builder.html">AlertDialog.Builder</a></code> with its constructor
//        val builder: AlertDialog.Builder? = this?.let {
//            AlertDialog.Builder(it)
//        }
//
//// 2. Chain together various setter methods to set the dialog characteristics
//        builder?.setMessage("test")?.setTitle("Test")
//
//// 3. Get the <code><a href="/reference/android/app/AlertDialog.html">AlertDialog</a></code> from <code><a href="/reference/android/app/AlertDialog.Builder.html#create()">create()</a></code>
//        val dialog: AlertDialog? = builder?.create()
//        dialog?.show()
        //-----------

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                    or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                    or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        )
        params.x = 50
        params.y = 100

        val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val myView = inflater.inflate(R.layout.popup, null)
        myView.setOnTouchListener(object : OnTouchListener {
            override fun onTouch(v: View, event: MotionEvent): Boolean {
                Toast.makeText(
                    this@MainActivity,
                    "touch",
                    Toast.LENGTH_LONG
                ).show()
                //Log.d(FragmentActivity.TAG, "touch me")
                return true
            }
        })

        // Add layout to window manager
        wm!!.addView(myView, params)

//        val params = WindowManager.LayoutParams(
//            WindowManager.LayoutParams.WRAP_CONTENT,
//            WindowManager.LayoutParams.WRAP_CONTENT,
//            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
//            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
//            PixelFormat.TRANSLUCENT
//        )
//
//
//        val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
//        wm?.addView(, params)

//        val svc = Intent(this, Popup::class.java)
//        startService(svc)
////        finish()
    }

    @TargetApi(Build.VERSION_CODES.M)
    fun checkPermissionOverlay() {
        if (!Settings.canDrawOverlays(this)) {
            Toast.makeText(
                this@MainActivity,
                "Can Use Overylay?",
                Toast.LENGTH_LONG
            ).show()
            val intentSettings = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
            val OVERLAY_PERMISSION_REQ_CODE: Int = 200
            startActivityForResult(intentSettings, OVERLAY_PERMISSION_REQ_CODE)
        } else {
            run()
        }
//        ActivityCompat.requestPermissions(
//            this,
//            arrayOf(Settings.ACTION_MANAGE_OVERLAY_PERMISSION),
//            200
//        )
//        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M) {
//            return
//        }
//
//        val myIntent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
//        startActivityForResult(myIntent, 200)
    }

}
