import 'package:ehrenamtskarte/category_assets.dart';
import 'package:ehrenamtskarte/graphql/graphql_api.dart';
import 'package:ehrenamtskarte/graphql/graphql_api.graphql.dart';
import 'package:ehrenamtskarte/util/color_utils.dart';
import 'package:ehrenamtskarte/widgets/app_bars.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

const double bottomSize = 100;

class DetailAppBarHeaderImage extends StatelessWidget {
  final int? categoryId;

  const DetailAppBarHeaderImage({super.key, this.categoryId});

  @override
  Widget build(BuildContext context) {
    final currentCategoryId = categoryId;

    if (currentCategoryId != null && currentCategoryId <= categoryAssets.length) {
      final currentDetailIcon = categoryAssets[currentCategoryId].detailIcon;
      if (currentDetailIcon != null) {
        return SvgPicture.asset(
          currentDetailIcon,
          width: double.infinity,
          semanticsLabel: 'Header',
          alignment: Alignment.bottomRight,
        );
      }
    }
    return Container();
  }
}

class DetailAppBarBottom extends StatelessWidget {
  final Color textColorGrey;
  final Color textColor;
  final String? title;
  final int? categoryId;
  final String? categoryName;
  final Color? accentColor;

  const DetailAppBarBottom({
    super.key,
    this.title,
    this.categoryId,
    this.categoryName,
    this.accentColor,
    required this.textColorGrey,
    required this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      alignment: Alignment.bottomLeft,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            categoryName ?? "",
            style: Theme.of(context).textTheme.bodyText2?.apply(color: textColorGrey),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            title ?? "",
            style: Theme.of(context).textTheme.headline6?.apply(color: textColor),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          )
        ],
      ),
    );
  }
}

class DetailAppBar extends StatelessWidget {
  final AcceptingStoreById$Query$PhysicalStore matchingStore;

  const DetailAppBar(this.matchingStore, {super.key});

  @override
  Widget build(BuildContext context) {
    final categoryId = matchingStore.store.category.id;

    final accentColor = getDarkenedColorForCategory(categoryId);
    final categoryName = matchingStore.store.category.name;
    final title = matchingStore.store.name ?? "Akzeptanzstelle";

    final backgroundColor = accentColor ?? Theme.of(context).colorScheme.primary;
    final textColor = getReadableOnColor(backgroundColor);
    final textColorGrey = getReadableOnColorSecondary(backgroundColor);

    return AppBarWithBottom(
      flexibleSpace: DetailAppBarHeaderImage(categoryId: categoryId),
      color: accentColor,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(bottomSize),
        // The SizedBox makes sure that the text does not move above the
        // AppBar, but is truncated at the bottom of the "bottom" component.
        child: SizedBox(
          height: bottomSize,
          child: DetailAppBarBottom(
            title: title,
            categoryId: categoryId,
            categoryName: categoryName,
            accentColor: accentColor,
            textColorGrey: textColorGrey,
            textColor: textColor,
          ),
        ),
      ),
    );
  }
}
