echo "Installing dependencies"
brew install cocoapods
cd services/files
npm install
cd ../..
pod install --project-directory=services/files/ios/App
brew install xcbeautify


echo "Generating iOS project files"
cd services/files
npx cap sync ios
cd ../..

BUILD_DIR=build

echo "Building xcarchive"
set -o pipefail && xcodebuild -workspace services/files/ios/App/App.xcworkspace -scheme App -configuration Release -sdk iphoneos -parallelizeTargets -archivePath $BUILD_DIR/archive.xcarchive clean archive CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGN_ENTITLEMENTS="" CODE_SIGNING_ALLOWED="NO" AD_HOC_CODE_SIGNING_ALLOWED="YES" | xcbeautify;

echo "Building tipa file"
mkdir $BUILD_DIR/Payload
cp -R "$BUILD_DIR/archive.xcarchive/Products/Applications/App.app" $BUILD_DIR
cd $BUILD_DIR
mv App.app Payload # move the .app to the new folder
zip -ry App.zip Payload # compress the Payload folder to a .zip folder called App
mv App.zip App.ipa # final conversion from .zip to .ipa by simple renaming
cp App.ipa App.tipa # TrollStore extension
rm -r Payload archive.xcarchive # cleanup
cd ..
