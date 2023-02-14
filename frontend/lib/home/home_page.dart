import 'package:ehrenamtskarte/about/about_page.dart';
import 'package:ehrenamtskarte/build_config/build_config.dart' show buildConfig;
import 'package:ehrenamtskarte/graphql/configured_graphql_provider.dart';
import 'package:ehrenamtskarte/home/app_flow.dart';
import 'package:ehrenamtskarte/home/app_flows_stack.dart';
import 'package:ehrenamtskarte/identification/identification_page.dart';
import 'package:ehrenamtskarte/map/floating_action_map_bar.dart';
import 'package:ehrenamtskarte/map/map_page.dart';
import 'package:ehrenamtskarte/search/search_page.dart';
import 'package:flutter/material.dart';

const mapTabIndex = 0;

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentTabIndex = 0;
  late List<AppFlow> appFlows;

  MapPageController? mapPageController;
  int? selectedAcceptingStoreId;

  @override
  void initState() {
    super.initState();
    final List<AppFlow> additionalTabs = buildConfig.featureFlags.verification
        ? [
            AppFlow(
              const IdentificationPage(title: "Ausweisen"),
              Icons.remove_red_eye_outlined,
              "Ausweisen",
              GlobalKey<NavigatorState>(debugLabel: "Auth tab key"),
            )
          ]
        : [];
    appFlows = [
      AppFlow(
        MapPage(
          onMapCreated: (controller) => setState(() => mapPageController = controller),
          selectAcceptingStore: (id) => setState(() => selectedAcceptingStoreId = id),
        ),
        Icons.map_outlined,
        "Karte",
        GlobalKey<NavigatorState>(debugLabel: "Map tab key"),
      ),
      AppFlow(
        const SearchPage(),
        Icons.search_outlined,
        "Suche",
        GlobalKey<NavigatorState>(debugLabel: "Search tab key"),
      ),
      ...additionalTabs,
      AppFlow(const AboutPage(), Icons.info_outline, "Über", GlobalKey<NavigatorState>(debugLabel: "About tab key")),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return ConfiguredGraphQlProvider(
      child: HomePageData(
        navigateToMapTab: _navigateToMapTab,
        child: Scaffold(
          body: AppFlowsStack(appFlows: appFlows, currentIndex: _currentTabIndex),
          floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
          floatingActionButton: _currentTabIndex == mapTabIndex
              ? FloatingActionMapBar(
                  bringCameraToUser: (position) async {
                    await mapPageController?.bringCameraToUser(position);
                  },
                  selectedAcceptingStoreId: selectedAcceptingStoreId,
                )
              // Returning a Container() instead of null avoids animations
              : Container(),
          bottomNavigationBar: _buildBottomNavigationBar(context),
        ),
      ),
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    final theme = Theme.of(context);
    return BottomNavigationBar(
      currentIndex: _currentTabIndex,
      backgroundColor: theme.colorScheme.surfaceVariant,
      items: appFlows
          .map((appFlow) => BottomNavigationBarItem(icon: Icon(appFlow.iconData), label: appFlow.title))
          .toList(),
      onTap: _onTabTapped,
      type: BottomNavigationBarType.fixed,
    );
  }

  void _onTabTapped(int index) {
    setState(() {
      if (_currentTabIndex != index) {
        _currentTabIndex = index;
      } else {
        // if clicking on tab again, reset the tab
        appFlows[_currentTabIndex].navigatorKey.currentState?.popUntil((route) => route.isFirst);
      }
    });
  }

  Future<void> _navigateToMapTab(PhysicalStoreFeatureData idWithCoordinates) async {
    setState(() {
      _currentTabIndex = mapTabIndex;
    });

    await mapPageController?.showAcceptingStore(idWithCoordinates);
  }
}

class HomePageData extends InheritedWidget {
  final Future<void> Function(PhysicalStoreFeatureData) navigateToMapTab;

  const HomePageData({super.key, required this.navigateToMapTab, required super.child});

  static HomePageData? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<HomePageData>();
  }

  @override
  bool updateShouldNotify(HomePageData oldWidget) {
    return oldWidget.navigateToMapTab != navigateToMapTab;
  }
}
