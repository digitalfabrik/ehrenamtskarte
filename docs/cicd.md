# Continuous Integration and Delivery

## Content

- [Workflows](#workflows)
- [Failed Delivery](#failed-delivery)
- [Deliver a new release by triggering the CI](#triggering-a-delivery)
- [Services](#services)
- [Fastlane](#fastlane)
- [Determining the next version](#determining-the-next-version)
- [Environment variables](#environment-variables-and-dependencies)
## Workflows

Several workflows exist for different purposes:

| Workflow                                   | Schedule/Trigger | Checks              | native delivery | backend_administration delivery | Version bump       |
|--------------------------------------------|------------------|---------------------|-----------------|---------------------------------|--------------------|
| commit                                     | commits of PRs   | :heavy_check_mark:  | :x:             | :x:                             | :x:                |
| commit_main                                | commits on main  | :heavy_check_mark:  | :x:             | :x:                             | :x:                |
| delivery_beta_all                          | manual           | :heavy_check_mark:  | beta            | beta                            | :heavy_check_mark: |
| promote_all                                | manual           | :x:                 | promotion       | promotion                       | :x:                |
| delivery_beta_backend_administration       | manual           | :heavy_check_mark:  | :x:             | beta                            | :heavy_check_mark: |
| promote_backend_administration             | manual           | :x:                 | :x:             | promotion                       | :x:                |
| delivery_beta_native                       | manual           | :heavy_check_mark:  | beta            | :x:                             | :heavy_check_mark: |
| promote_native                             | manual           | :x:                 | production      | :x:                             | :x:                |
| delivery_native_production                 | manual           | :heavy_check_mark:  | production      | :x:                             | :heavy_check_mark: |
| delivery_production_backend_administration | manual           | :heavy_check_mark:  | :x:             | production                      | :heavy_check_mark: |
| frontend                                   | manual (testing) | :x:                 | :x:             | :x:                             | :x:                |

Steps executed if _Checks_ is checked :heavy_check_mark::

### General
- Check CircleCi config

### Administration
- Lint Administration
- GraphQL scheme
- Prettier formatting
- TypeScript checks
- Unit testing with jest

### Backend
- KLint
- Integration & Unit tests
- GraphQL scheme
- Backend health

### Frontend
- Dart formatting
- Build runner
- Check Analyzer and linting
- Unit tests

For `commit_main` additionally all packages will be build and and backend health check will be done

Steps executed if _Version bump_ is checked :heavy_check_mark::

## Failed Delivery

In case a delivery fails, please do not restart the workflow, but trigger a fresh release, to avoid another failure and version inconsistencies.

In that case you can add a bugfix on the release branch or base a hotfix branch on the release branch and commit your fix there.
Then you can [trigger a delivery](#triggering-a-delivery). It is possible to either just execute `delivery_beta_native` or
`delivery_beta_backend_administration` or just run the whole `delivery_beta_all` workflow again.

## Triggering a Delivery
- Prerequisite: You need a valid circle ci access for digitalfabrik/entitlementcard 

- Create a release branch with next version [Determining the Next Version](#determining-the-next-version)
- Create a pull request for this branch with base branch main
- Select the branch in CircleCI and go click "Trigger Pipeline", add parameters for the particular workflow. You can find them in `@common.yml`
- Example:  Boolean | "run_delivery_beta_all" | true

Alternative command-line:
- Prerequisite: Get a CircleCI [Personal API Token](https://circleci.com/docs/2.0/managing-api-tokens/).
- use command line: 

```
curl -X POST https://circleci.com/api/v2/project/github/digitalfabrik/entitlementcard/pipeline \
  --header "Circle-Token: <yourToken>" \
  --header "content-type: application/json" \
  --data '{"branch":"<your branch>", "parameters":{"run_delivery_beta_all":true, "run_commit": true}}'
```

If you are facing issues with the new release version, you can find help in the [Troubleshooting](./troubleshooting.md) section.

## Services

### deliverino (GitHub)

`deliverino` is a GitHub App and can be accessed and installed [here](https://github.com/apps/deliverino). This bot bumps the version of the app when a new release is delivered.
A private key in PEM format grants access to the bot. If the `deliverino` is installed for a specific repository then it has access to create commits there.

**`deliverino` has the role of an Administrator. This is important when setting up [Protected branches](https://help.github.com/en/github/administering-a-repository/about-branch-restrictions) in GitHub. You have to disable "Include Administrators", else `deliverino` is not allowed to directly commit to the protected branch.**

### Google Play Store

You can visit the management website for the Play Store [here](https://play.google.com/apps/publish/). The Google Play Console is the product by Google for managing the App Store presence.

#### Adding Testers to the Beta Track

The Play Store has the concept of tracks to manage released versions of the app. The beta track is for public tests. Tests can be added via their Google E-Mail or by signing up at [play.google.com/apps/testing/tuerantuer.app.integreat](https://play.google.com/apps/testing/tuerantuer.app.integreat).

#### Metadata

Currently, we maintain metadata for the apps manually in Google Play Console.

### App Store Connect

You can visit the management website for the Play Store [here](https://appstoreconnect.apple.com/). App Store Connect is the product by Apple for managing the App Store presence.

For delivery an [account without 2FA](https://github.com/fastlane/fastlane/blob/b121a96e3e2e0bb83392c130cb3a088c773dbbaf/spaceship/docs/Authentication.md#avoid-2fa-via-additional-account) is required.

#### Adding Testers to TestFlight

The [beta_native](#workflows) makes the builds directly available to TestFlights "App Store Connect Users". Those should not be confused with "External Tests" which require an approval by apple. Therefore, we currently only use "App Store Connect Users" as testers.

In order to add someone as "App Store Connect User" you have to add the Apple Account to App Store Connect and to TestFlight. This is a two-step process.

#### Metadata

Currently, we only set `release_notes`, everything else is maintained manually.

#### Authenticating

Authentication happens by setting the `APP_STORE_CONNECT_API_KEY_CONTENT` environment variable as documented [below](#ios-variables). For more information visit the documentation [here](https://docs.fastlane.tools/app-store-connect-api/).

### BrowserStack

We are using BrowserStack to test ios and android apps on different mobile devices.
Currently, we upload builds manually.
Checkout passbold for credentials to log in.

## Fastlane

Fastlane is a task-runner for triggering build relevant tasks. It offers integration with XCode and the Android SDK for building and delivering the app.

### Fastlane Setup

You can find the official documentation [here](https://docs.fastlane.tools/)

### Lanes

Lanes for Android live in [../frontend/android/fastlane](../frontend/android/fastlane) and for iOS in [../frontend/ios/fastlane](../frontend/ios/fastlane).

An overview about FL lanes is available in several documents:

- [Android](../frontend/android/fastlane/README.md) - Responsible for setting up the signing keys and building the Android app.
- [iOS](../frontend/ios/fastlane/README.md) - Responsible for setting up the certificates and building the iOS app.

## Apple Certificates and Android Keystore

Fastlane is used to setup certificates and keystores. The detailed steps of the CI/CD pipeline are the same as those when manually building the app.
Therefore, you can follow the documentation for Manual Builds to set up [certificates](./manual-release#certificates-and-signing).

## Determining the Next Version

The next version of the app must be determined programmatically.
- Install app-toolbelt: `npm install --unsafe-perm -g https://github.com/digitalfabrik/app-toolbelt/archive/refs/heads/main.tar.gz`
- Go to the root folder
- run: `app-toolbelt v0 version calc | jq .versionName`

## Environment Variables and Dependencies

| Variable                        | Description                                                                       | Where do I get it from?                    | Example                                                                                    | Reference                                                                                |
|---------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------|--------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| DELIVERINO_PRIVATE_KEY          | Base64 encoded PEM private key                                                    | Password Manager                           | [Deliverino Settings](https://github.com/organizations/Integreat/settings/apps/deliverino) | [Deliverino](https://github.com/apps/deliverino)                                         |
| MM_WEBHOOK                      | URL which can be used to send notifications to our mattermost. Keep this private! | Mattermost server settings                 | https://chat.tuerantuer.org/hooks/...                                                      | [Mattermost Documentation](https://docs.mattermost.com/developer/webhooks-incoming.html) |
| CREDENTIALS_GIT_REPOSITORY_URL  | Git remote URL to the credentials repository which contains the Java Keystore     | Ask the team about this secret repository  | git@github.com:digitalfabrik/app-credentials.git                                           | -                                                                                        |

### Android Variables

| Variable                        | Description                                                                                                | Where do I get it from?                                                  | Example                                           | Reference                                                                                              |
|---------------------------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------| ------------------------------------------------------------------------------------------------------ |
| GOOGLE_SERVICE_ACCOUNT_JSON     | JSON for authentication in the Google Play Console as Release Manager. This should expire after two years. | Password Manager                                                         | {...}                                             | [Service Account Docu](https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=de) |
| CREDENTIALS_DIRECTORY_PATH      | Path where the credentials Git repository cloned to automatically by FL                                    | The developer can choose this freely                                     | /home/circleci/credentials                        | -                                                                                                      |
| CREDENTIALS_KEYSTORE_PATH       | Path to the OpenSSL AES256-CBC encrypted Java Keystore file                                                | -                                                                        | /home/circleci/credentials/<secret>.enc           | Look for the `openssl enc` command in the Android Fastlane file for more information                   |
| KEYSTORE_PATH                   | Path to the decrypted Java Keystore file                                                                   | -                                                                        | /home/circleci/keystore.jks                       | -                                                                                                      |
| CREDENTIALS_KEYSTORE_PASSWORD   | Password for decrypting the keystore using OpenSSL                                                         |                                                                          | password                                          | -                                                                                                      |
| KEYSTORE_KEY_ALIAS_BAYERN       | Alias of the key within the Java Keystore                                                                  | You should look in the JKS file using `keytool -list -v -keystore <jks>` |                                                   |                                                                                                        |
| KEYSTORE_KEY_ALIAS_NUERNBERG    | Alias of the key within the Java Keystore                                                                  | You should look in the JKS file using `keytool -list -v -keystore <jks>` |                                                   |                                                                                                        |
| KEYSTORE_KEY_ALIAS_KOBLENZ      | Alias of the key within the Java Keystore                                                                  | You should look in the JKS file using `keytool -list -v -keystore <jks>` |                                                   |                                                                                                        |
| KEYSTORE_KEY_PASSWORD_BAYERN    | Password of the key within the Java Keystore                                                               | Password Manager                                                         |                                                   |                                                                                                        |
| KEYSTORE_KEY_PASSWORD_NUERNBERG | Password of the key within the Java Keystore                                                               | Password Manager                                                         |                                                   |                                                                                                        |
| KEYSTORE_KEY_PASSWORD_KOBLENZ   | Password of the key within the Java Keystore                                                               | Password Manager                                                         |                                                   |                                                                                                        |

### iOS Variables

| Variable                          | Description                                                                                                                | Where do I get it from? | Example                                                                    | Reference                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| APP_STORE_CONNECT_API_KEY_ID      | Key ID for App Store Connect API                                                                                           | Password Manager        | D83848D23                                                                  | [app_store_connect_api_key](https://docs.fastlane.tools/actions/app_store_connect_api_key/) |
| APP_STORE_CONNECT_API_ISSUER_ID   | Issuer ID for App Store Connect API                                                                                        | Password Manager        | 227b0bbf-ada8-458c-9d62-3d8022b7d07f                                       | [app_store_connect_api_key](https://docs.fastlane.tools/actions/app_store_connect_api_key/) |
| APP_STORE_CONNECT_API_KEY_CONTENT | Key content for App Store Connect API                                                                                      | Password Manager        | -----BEGIN EC PRIVATE KEY-----\nfewfawefawfe\n-----END EC PRIVATE KEY----- | [app_store_connect_api_key](https://docs.fastlane.tools/actions/app_store_connect_api_key/) |
| MATCH_PASSWORD                    | Password for accessing the certificates for the iOS app using [Fastlane Match](https://docs.fastlane.tools/actions/match/) | Password Manager        | 123456                                                                     | [Using a Git Repo](https://docs.fastlane.tools/actions/match/#git-repo-encryption-password) |
