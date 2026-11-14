import java.util.Properties
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// CI passes the highest platform it can install (-Ptc.sdk=37), falls back to 36.
val tcSdk = (project.findProperty("tc.sdk") as String?)?.toIntOrNull() ?: 36

val signProps = Properties().apply { val f = file("signing.properties"); if (f.exists()) f.inputStream().use { load(it) } }

android {
    namespace = "com.tomstechsolutions.car"
    compileSdk = tcSdk

    defaultConfig {
        applicationId = "com.tomstechsolutions.car"
        minSdk = 26
        targetSdk = tcSdk
        versionCode = 960
        versionName = "0.9.6-beta"
        ndk { abiFilters += listOf("arm64-v8a", "armeabi-v7a", "x86_64") }
    }

    signingConfigs {
        create("release") {
            storeFile = file("tomscar.keystore")
            storePassword = signProps.getProperty("storePassword")
            keyAlias = signProps.getProperty("keyAlias")
            keyPassword = signProps.getProperty("keyPassword")
        }
    }
    // the signing key is unpacked by the workflow from app/signing.enc (secret SIGN_SECRET); without it local builds use the debug key
    val relSign = if (signProps.isEmpty) signingConfigs.getByName("debug") else signingConfigs.getByName("release")

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = relSign
        }
        debug { signingConfig = relSign }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
    buildFeatures { buildConfig = true }
    lint { abortOnError = false; checkReleaseBuilds = false }
}

dependencies {
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("com.alphacephei:vosk-android:0.3.47@aar")
    implementation("net.java.dev.jna:jna:5.13.0@aar")
}
