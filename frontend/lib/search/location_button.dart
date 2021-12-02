import 'package:ehrenamtskarte/configuration/settings_model.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';

import '../location/determine_position.dart';
import '../widgets/small_button_spinner.dart';

class LocationButton extends StatefulWidget {
  final void Function(Position position) setCoordinates;

  const LocationButton({Key? key, required this.setCoordinates}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _LocationButtonState();
}

enum LocationRequestStatus { requesting, requestSuccessful, requestFailed }

class _LocationButtonState extends State<LocationButton> {
  LocationRequestStatus _locationStatus = LocationRequestStatus.requesting;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance?.addPostFrameCallback((timeStamp) {
      var settings = context.read<SettingsModel>();
      _determinePosition(false, settings);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_locationStatus == LocationRequestStatus.requestSuccessful) {
      return Container();
    }
    final settings = Provider.of<SettingsModel>(context);
    if (settings.locationFeatureEnabled) {
      return Container(
        alignment: Alignment.bottomCenter,
        padding: const EdgeInsets.all(10),
        child: FloatingActionButton.extended(
          heroTag: "fab_search_view",
          backgroundColor: Theme.of(context).backgroundColor,
          elevation: 1,
          onPressed:
              _locationStatus == LocationRequestStatus.requesting ? null : () => _determinePosition(true, settings),
          icon: AnimatedSwitcher(
            child: _locationStatus == LocationRequestStatus.requesting
                ? const SmallButtonSpinner()
                : Icon(
                    Icons.my_location,
                    size: 24,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
            duration: const Duration(milliseconds: 200),
          ),
          label: Text(
            "In meiner Nähe suchen",
            style: TextStyle(color: Theme.of(context).hintColor),
          ),
        ),
      );
    } else {
      return Container();
    }
  }

  Future<void> _determinePosition(bool userInteract, settings) async {
    setState(() => _locationStatus = LocationRequestStatus.requesting);
    var requiredPosition = userInteract
        ? await determinePosition(
            context,
            requestIfNotGranted: true,
            onDisableFeature: () async => await settings.setLocationFeatureEnabled(false),
            onEnableFeature: () async {
              await settings.setLocationFeatureEnabled(true);
            },
          )
        : await determinePosition(
            context,
            requestIfNotGranted: false,
            onDisableFeature: () async => await settings.setLocationFeatureEnabled(false),
            onEnableFeature: () async {
              await settings.setLocationFeatureEnabled(true);
            },
          ).timeout(const Duration(milliseconds: 2000), onTimeout: () => RequestedPosition.unknown());

    var position = requiredPosition.position;
    if (position != null) {
      widget.setCoordinates(position);
      setState(() => _locationStatus = LocationRequestStatus.requestSuccessful);
    } else {
      setState(() => _locationStatus = LocationRequestStatus.requestFailed);
    }
  }
}
