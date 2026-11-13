package com.tomstechsolutions.car

import android.app.Application

/** Lives as long as the process: "not fully closed" = the process is still alive. */
class TomsCarApp : Application() {
    companion object {
        /** True once the splash + About screens have been shown in this process. */
        @Volatile var introShown = false
    }
}
