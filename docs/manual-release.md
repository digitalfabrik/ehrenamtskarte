# Manual releases

> The deployment is done by the [Digitalfabrik](https://github.com/digitalfabrik/) and restricted by permissions.
> Reach out to [@maxammann](https://github.com/maxammann/) or [@ztefanie](https://github.com/ztefanie/) or [@f1sh1918](https://github.com/f1sh1918/) for more information and insights.
> This article is about manual releases.
> Further information to our release workflows can be found [CI/CD](./cicd.md)
## Certificates and Signing

### Android

Clone the [app-credentials](https://github.com/digitalfabrik/app-credentials) repo.

In `frontend/android` create a file `local.properties` (if it does not already exist).

Add the following entries for signing depending on build config:

```bash
signing.keyAlias=de.nrw.it.giz.ehrensache.bayern.android-googleplay
signing.keyPassword=<passbolt - Ehrenamtskarte Bayern Keystore Key Password>
signing.storeFile=<path-to-local-repo>/app-credentials/android/ehrenamtskarte-bayern.jks
signing.storePassword=<passbolt - Ehrenamtskarte Bayern Keystore Password>
```

```bash
signing.keyAlias=upload
signing.keyPassword=<passbolt - Nuernberg Sozialpass Keystore Password>
signing.storeFile=<path-to-local-repo>/app-credentials/android/nuernberg-sozialpass.jks
signing.storePassword=<passbolt - Nuernberg Sozialpass Keystore Password>
```

### iOS

In `frontend/iOS`  run `bundle exec fastlane match appstore` .

- Use user [app-team@integreat-app.de](mailto:app-team@integreat-app.de) and password from `<passbolt - Digitalfabrik Fastlane Match>`
- Set correct app_identifier (a list of identifier is also allowed): `app.sozialpass.nuernberg,de.nrw.it.ehrensachebayern`

## Create beta release

- Create a release branch on current main: `release-<version> f.e. "release-2024.11.1`  (check out how to determine next version [here](./cicd.md#determining-the-next-version))
- Create PR to main branch
- Trigger `delivery_beta_all` workflow or `delivery_beta_natve` or `delivery_beta_backend_administration` if you just want to create a release artifact for a particular platform.

Hint: Since we want to keep all our platforms on the same version, try to avoid single platform releases.

### Frontend

For Nürnberg replace:

- bayern → nuernberg
- Bayern → Nuernberg

1. In a shell navigate to the `frontend` directory
2. Select the correct build version

```bash
fvm flutter pub run build_runner build --define df_build_config=name=bayern
```

3. Create bundles

```bash
# Android
fvm flutter build appbundle --flavor bayern --release --dart-define=environment=production

# iOS
# Make sure the correct certificate is selected for the release job in xcode
fvm flutter build ipa --flavor bayern --release --dart-define=environment=production
# Ensure the correct bundle identifier is used in XCode
# This will show an error "exportArchive: "Runner.app" requires a provisioning profile."
# but an xcarchive will still be created which then can be distributed via xcode
```

4. Release

#### Android:
- In the Google Play Console create a new release for Open Testing. 
- For this upload the app bundle from `build/app/outputs/bundle/bayernRelease/app-bayern-release.aab` and save. 
- Go to "Release-Overview" and send the changes to google. Once the release is approved by Google Play promote to production.

#### iOS:
- `open ./build/ios/archive/Runner.xcarchive`
- go to "distribute app" and "custom" (XCode 15)
- use manual signing and choose match appstore certificate
- Navigate the dialog and finally distribute the app. This will create a release on Testflight. It may take a while until the new build will be listed.
- Once apple has approved the Testflight release, the app can be “promoted”. 
- For that change the build and version number in app store connect and let the app be checked a second time. Finally the app can be released.

## Snapshots

The snapshots are created by executing a bunch of e2e tests locally. Check out `frontend/ios/ScreenshotTest` .

- ensure local backend is running.
- check for the required simulators in XCode (see `frontend/ios/fastlane/Snapfile`)
- set the build config for the particular project.
- switch to: `frontend/ios`
- run: `bundle exec fastlane ios <snapshot_lane>` where `snapshot_lane` is either `snap_bayern` or `snap_nuernberg`
