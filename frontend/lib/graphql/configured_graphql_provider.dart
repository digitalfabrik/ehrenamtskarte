import 'package:flutter/widgets.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import '../configuration/configuration.dart';

class ConfiguredGraphQlProvider extends StatelessWidget {
  final Widget child;

  const ConfiguredGraphQlProvider({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final config = Configuration.of(context);
    
    if (config == null) {
      return const Center();
    }
    
    final client = ValueNotifier(
      GraphQLClient(
        cache: GraphQLCache(),
        link: Link.from([
          HttpLink(config.graphqlUrl)
        ]),
      ),
    );
    return GraphQLProvider(
        child: CacheProvider(
          child: child,
        ),
        client: client);
  }
}
