import 'package:ehrenamtskarte/search/seach_result_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

import '../graphql/graphql_api.dart';

class ResultsLoader extends StatefulWidget {
  final CoordinatesInput coordinates;
  final String searchText;
  final List<int> categoryIds;

  const ResultsLoader(
      {Key key, this.coordinates, this.searchText, this.categoryIds})
      : super(key: key);

  @override
  State<StatefulWidget> createState() => ResultsLoaderState();
}

class ResultsLoaderState extends State<ResultsLoader> {
  static const _pageSize = 20;
  GraphQLClient _client;

  final PagingController<int, AcceptingStoresSearch$Query$AcceptingStore>
      _pagingController = PagingController(firstPageKey: 0);

  @override
  void initState() {
    _pagingController.addPageRequestListener((pageKey) {
      _fetchPage(pageKey);
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final GraphQLClient client = GraphQLProvider.of(context).value;
    assert(client != null);
    if (client != _client) {
      _client = client;
    }
  }

  @override
  didUpdateWidget(ResultsLoader oldWidget) {
    _pagingController.refresh();
    super.didUpdateWidget(oldWidget);
  }

  Future<void> _fetchPage(int pageKey) async {
    try {
      var arguments = AcceptingStoresSearchArguments(
          params: SearchParamsInput(
              categoryIds:
                  widget.categoryIds.isEmpty ? null : widget.categoryIds,
              coordinates: widget.coordinates,
              searchText: widget.searchText,
              limit: _pageSize,
              offset: pageKey));
      var query = AcceptingStoresSearchQuery(variables: arguments);
      final result = await _client.query(QueryOptions(
          documentNode: query.document, variables: query.getVariablesMap()));
      if (result.hasException) throw GraphQLError.fromJSON(result);

      var newItems = query.parse(result.data).searchAcceptingStores;
      final isLastPage = newItems.length < _pageSize;
      if (isLastPage) {
        _pagingController.appendLastPage(newItems);
      } else {
        final nextPageKey = pageKey + newItems.length;
        _pagingController.appendPage(newItems, nextPageKey);
      }
    } catch (error) {
      _pagingController.error = error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return PagedSliverList<int,
        AcceptingStoresSearch$Query$AcceptingStore>.separated(
      pagingController: _pagingController,
      builderDelegate:
          PagedChildBuilderDelegate<AcceptingStoresSearch$Query$AcceptingStore>(
              itemBuilder: (context, item, index) => SearchResultItem(
                  key: ValueKey(item.id),
                  item: item,
                  coordinates: widget.coordinates),
              noItemsFoundIndicatorBuilder: _buildNoItemsFoundIndicator,
              firstPageErrorIndicatorBuilder: _buildErrorWithRetry,
              newPageErrorIndicatorBuilder: _buildErrorWithRetry,
              newPageProgressIndicatorBuilder: _buildProgressIndicator,
              firstPageProgressIndicatorBuilder: _buildProgressIndicator),
      separatorBuilder: (context, index) =>
          Divider(height: 0, color: Colors.grey),
    );
  }

  Widget _buildProgressIndicator(BuildContext context) => Center(
      child: Padding(
          padding: EdgeInsets.all(5), child: CircularProgressIndicator()));

  Widget _buildErrorWithRetry(BuildContext context) => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.warning, size: 60, color: Colors.orange),
        Text("Bitte Internetverbindung prüfen."),
        OutlineButton(
          onPressed: () => _pagingController.retryLastFailedRequest(),
          child: Text("Erneut versuchen"),
        )
      ]));

  Widget _buildNoItemsFoundIndicator(BuildContext context) => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.search_off,
            size: 60, color: Theme.of(context).disabledColor),
        Text("Auf diese Suche trifft keine Akzeptanzstelle zu."),
      ]));

  @override
  void dispose() {
    _pagingController.dispose();
    super.dispose();
  }
}
