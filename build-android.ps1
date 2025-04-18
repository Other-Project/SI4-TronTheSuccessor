#!/bin/bash

cd services/files

echo "Installing dependencies"
# Make sure you have Node.js and npm installed (https://nodejs.org/en/download/)
npm install

echo "Installing Android SDK"
# Make sure you have the Android SDK installed (https://developer.android.com/studio?hl=en#command-line-tools-only) and set up in your environment (ANDROID_HOME)
$SDK=$env:ANDROID_HOME

& "$SDK/cmdline-tools/latest/bin/sdkmanager" --install "platform-tools" "platforms;android-35" "build-tools;35.0.1"
& "$SDK/cmdline-tools/latest/bin/sdkmanager" --licenses

echo "Generating Android build files"
npx cap sync

echo "Building Android app"
cd android
./gradlew assembleDebug

echo "Launching Android emulator"
& "$SDK/cmdline-tools/latest/bin/sdkmanager" --install "system-images;android-35;google_apis;x86_64" "platform-tools" "emulator"
& "$SDK/cmdline-tools/latest/bin/avdmanager" create avd -n test -k "system-images;android-35;google_apis;x86_64"
& "$SDK/emulator/emulator" -avd test -port 5555 &
sleep 30
& "$SDK/platform-tools/adb" start-server
./gradlew installDebug
cd ../../../
