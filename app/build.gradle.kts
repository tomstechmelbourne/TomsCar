plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// CI passes the highest platform it can install (-Ptc.sdk=37), falls back to 36.
val tcSdk = (project.findProperty("tc.sdk") as String?)?.toIntOrNull() ?: 36

android {
    namespace = "com.tomstechsolutions.car"
    compileSdk = tcSdk

    defaultConfig {
        applicationId = "com.tomstechsolutions.car"
        minSdk = 26
        targetSdk = tcSdk
        versionCode = 910
        versionName = "0.9.1-beta"
    }

    signingConfigs {
        create("release") {
            storeFile = file("tomscar.keystore")
            storePassword = "TomsCar2026"
            keyAlias = "tomscar"
            keyPassword = "TomsCar2026"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
        debug { signingConfig = signingConfigs.getByName("release") }
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
}
