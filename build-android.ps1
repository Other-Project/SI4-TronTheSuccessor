#!/bin/bash

$SDK=$env:ANDROID_HOME

cd services/files

echo "Generating Android build files"
npx cap sync

echo "Building Android app"
cd android
./gradlew assembleDebug

echo "Launching Android emulator"
& "$SDK/platform-tools/adb" start-server
& "$SDK/platform-tools/adb" shell am force-stop academy.pns.ps8.tronsuccessor
./gradlew installDebug
& "$SDK/platform-tools/adb" shell monkey -p academy.pns.ps8.tronsuccessor 1
cd ../../../
& "$SDK/platform-tools/adb" logcat Capacitor:V 8.tronsuccessor:V *:S
