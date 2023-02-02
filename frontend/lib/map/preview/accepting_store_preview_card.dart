import 'package:ehrenamtskarte/map/floating_action_map_bar.dart';
import 'package:ehrenamtskarte/map/preview/models.dart';
import 'package:ehrenamtskarte/store_widgets/accepting_store_summary.dart';
import 'package:ehrenamtskarte/widgets/error_message.dart';
import 'package:flutter/material.dart';

class AcceptingStorePreviewError extends StatelessWidget {
  final void Function()? refetch;

  const AcceptingStorePreviewError({super.key, this.refetch});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: refetch,
      child: Container(
        height: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: const ErrorMessage("Fehler beim Laden der Infos."),
      ),
    );
  }
}

class AcceptingStorePreviewCard extends StatelessWidget {
  final bool isLoading;
  final void Function()? refetch;
  final AcceptingStoreSummaryModel? acceptingStore;

  const AcceptingStorePreviewCard({super.key, required this.isLoading, this.acceptingStore, this.refetch});

  @override
  Widget build(BuildContext context) {
    final currentAcceptingStore = acceptingStore;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: fabPadding.toDouble()),
      child: Card(
        clipBehavior: Clip.hardEdge,
        margin: EdgeInsets.zero,
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: isLoading
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: const LinearProgressIndicator(),
                )
              : currentAcceptingStore == null
                  ? AcceptingStorePreviewError(refetch: refetch)
                  : AcceptingStoreSummary(
                      store: currentAcceptingStore,
                      showLocation: false,
                      key: ValueKey(currentAcceptingStore.id),
                      showMapButtonOnDetails: false,
                    ),
        ),
      ),
    );
  }
}
