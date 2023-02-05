import 'package:ehrenamtskarte/identification/info_dialog.dart';
import 'package:flutter/material.dart';

class ConnectionFailedDialog extends StatelessWidget {
  final String reason;

  const ConnectionFailedDialog({super.key, required this.reason});

  @override
  Widget build(BuildContext context) {
    return InfoDialog(
      title: "Keine Verbindung möglich",
      icon: Icons.signal_cellular_connected_no_internet_4_bar,
      iconColor: Theme.of(context).colorScheme.onBackground,
      child: Text(reason),
    );
  }

  static Future<void> show(BuildContext context, String reason) =>
      showDialog(context: context, builder: (_) => ConnectionFailedDialog(reason: reason));
}
