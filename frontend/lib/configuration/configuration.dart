import 'package:flutter/widgets.dart';

class Configuration extends InheritedWidget {
  final String mapStyleUrl;
  final String graphqlUrl;
  final bool showVerification;
  final bool showDevSettings;

  const Configuration({
    Key? key,
    required this.mapStyleUrl,
    required this.graphqlUrl,
    required this.showVerification,
    required this.showDevSettings,
    required Widget child,
  }) : super(key: key, child: child);

  @override
  bool updateShouldNotify(covariant Configuration oldWidget) =>
      mapStyleUrl != oldWidget.mapStyleUrl ||
      graphqlUrl != oldWidget.graphqlUrl ||
      showVerification != oldWidget.showVerification ||
      showDevSettings != oldWidget.showDevSettings;

  static Configuration of(BuildContext context) {
    var configuration = context.dependOnInheritedWidgetOfExactType<Configuration>();
    if (configuration == null) {
      throw Exception("Config was not found in component tree!");
    }
    return configuration;
  }
}
