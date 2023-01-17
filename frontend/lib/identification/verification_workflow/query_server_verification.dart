import 'package:ehrenamtskarte/graphql/graphql_api.dart';
import 'package:ehrenamtskarte/identification/qr_code_utils.dart';
import 'package:ehrenamtskarte/proto/card.pb.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

Future<bool> queryServerVerification(
  GraphQLClient client,
  String projectId,
  DynamicVerifyCode verifyCode,
) async {
  final hash = const QrCodeUtils().hashCardInfo(verifyCode.info, verifyCode.pepper);
  return _queryServerVerification(client, projectId, hash, verifyCode.otp);
}

Future<bool> _queryServerVerification(GraphQLClient client, String projectId, String verificationHash, int totp) async {
  final byCardDetailsHash = CardVerificationByHashQuery(
    variables: CardVerificationByHashArguments(
      project: projectId,
      card: CardVerificationModelInput(cardInfoHashBase64: verificationHash, totp: totp),
    ),
  );
  final queryOptions = QueryOptions(
    fetchPolicy: FetchPolicy.noCache,
    document: byCardDetailsHash.document,
    variables: byCardDetailsHash.getVariablesMap(),
  );

  try {
    final queryResult = await client.query(queryOptions);
    final exception = queryResult.exception;
    if (exception != null && queryResult.hasException) {
      throw exception;
    }
    final data = queryResult.data;

    if (data == null) {
      return false;
    }

    final parsedResult = byCardDetailsHash.parse(data);
    return parsedResult.cardValid;
  } on Object catch (e) {
    throw ServerVerificationException(e);
  }
}

class ServerVerificationException implements Exception {
  final Object cause;

  const ServerVerificationException(this.cause);

  @override
  String toString() {
    return 'ServerVerificationException{cause: $cause}';
  }
}
