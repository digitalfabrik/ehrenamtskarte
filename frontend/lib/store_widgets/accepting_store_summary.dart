import 'dart:math';

import 'package:ehrenamtskarte/category_assets.dart';
import 'package:ehrenamtskarte/graphql/graphql_api.dart';
import 'package:ehrenamtskarte/map/preview/models.dart';
import 'package:ehrenamtskarte/routing.dart';
import 'package:ehrenamtskarte/store_widgets/detail/detail_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';

import 'package:ehrenamtskarte/l10n/translations.g.dart';

import '../map/map_page.dart';

class AcceptingStoreSummary extends StatelessWidget {
  final AcceptingStoreSummaryModel store;
  final CoordinatesInput? coordinates;
  final double wideDepictionThreshold;
  final void Function(PhysicalStoreFeatureData)? showOnMap;
  final bool showLocation;

  const AcceptingStoreSummary({
    super.key,
    required this.store,
    this.coordinates,
    required this.showOnMap,
    this.showLocation = true,
    this.wideDepictionThreshold = 400,
  });

  /// Returns the distance between `coordinates` and the physical store,
  /// or `null` if `coordinates` or `item.physicalStore` is `null`
  double? get _distance {
    final storedCoordinates = store.coordinates;
    final currentCoordinates = coordinates;
    if (currentCoordinates == null || storedCoordinates == null) return null;
    return calcDistance(currentCoordinates.lat, currentCoordinates.lng, storedCoordinates.lat, storedCoordinates.lng);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final categories = categoryAssets(context);
    final itemCategoryAsset = store.categoryId < categories.length ? categories[store.categoryId] : null;
    final categoryName = itemCategoryAsset?.name ?? t.store.unknownCategory;
    final categoryColor = itemCategoryAsset?.color;

    final useWideDepiction = MediaQuery.of(context).size.width > 400;
    final currentDistance = _distance;
    return SafeArea(
      bottom: false,
      top: false,
      child: InkWell(
        onTap: () {
          _openDetailView(context);
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Row(
            children: [
              if (useWideDepiction)
                CategoryIconIndicator(
                  svgIconPath: itemCategoryAsset?.icon,
                  categoryName: categoryName,
                )
              else
                CategoryColorIndicator(categoryColor: categoryColor),
              StoreTextOverview(
                store: store,
                showTownName: currentDistance == null && showLocation,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  children: [
                    if (currentDistance != null) DistanceText(distance: currentDistance),
                    SizedBox(
                      height: double.infinity,
                      child: Icon(Icons.keyboard_arrow_right, size: 30.0, color: Theme.of(context).disabledColor),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  void _openDetailView(BuildContext context) {
    Navigator.of(context, rootNavigator: true).push(
      AppRoute(
        builder: (context) => DetailPage(store.id, showOnMap: showOnMap),
      ),
    );
  }
}

class CategoryIconIndicator extends StatelessWidget {
  final String? svgIconPath;
  final String categoryName;
  final EdgeInsets padding;

  const CategoryIconIndicator({
    super.key,
    required this.svgIconPath,
    required this.categoryName,
    this.padding = const EdgeInsets.symmetric(horizontal: 16),
  });

  @override
  Widget build(BuildContext context) {
    final currentSvgIconPath = svgIconPath;
    return Padding(
      padding: padding,
      child: currentSvgIconPath != null
          ? SvgPicture.asset(currentSvgIconPath, width: 30, semanticsLabel: categoryName)
          : const Icon(
              Icons.info,
              size: 30,
            ),
    );
  }
}

class CategoryColorIndicator extends StatelessWidget {
  final Color? categoryColor;

  const CategoryColorIndicator({super.key, this.categoryColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: VerticalDivider(
        color: categoryColor ?? Theme.of(context).colorScheme.primary,
        thickness: 3,
      ),
    );
  }
}

class StoreTextOverview extends StatelessWidget {
  final AcceptingStoreSummaryModel store;
  final bool showTownName;

  const StoreTextOverview({super.key, required this.store, this.showTownName = false});

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final location = store.location;
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            store.name ?? t.store.acceptingStore,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 4),
          Text(
            store.description ?? t.store.noDescriptionAvailable,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          if (showTownName && location != null) Text(location, maxLines: 1, overflow: TextOverflow.ellipsis)
        ],
      ),
    );
  }
}

class DistanceText extends StatelessWidget {
  final double distance;

  const DistanceText({super.key, required this.distance});

  static String _formatDistance(double d) {
    if (d < 1) {
      return '${(d * 100).round() * 10} m';
    } else if (d < 10) {
      return '${NumberFormat('##.0', 'de').format(d)} km';
    } else {
      return '${NumberFormat('###,###', 'de').format(d)} km';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(_formatDistance(distance), maxLines: 1, style: Theme.of(context).textTheme.bodyMedium),
    );
  }
}

// from https://www.movable-type.co.uk/scripts/latlong.html
double calcDistance(double lat1, double lng1, double lat2, double lng2) {
  const R = 6371; // kilometers
  final phi1 = lat1 * pi / 180; // φ, λ in radians
  final phi2 = lat2 * pi / 180;
  final deltaPhi = (lat2 - lat1) * pi / 180;
  final deltaLambda = (lng2 - lng1) * pi / 180;

  final a = sin(deltaPhi / 2) * sin(deltaPhi / 2) + cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2);
  final c = 2 * atan2(sqrt(a), sqrt(1 - a));

  return R * c; // in metres
}
