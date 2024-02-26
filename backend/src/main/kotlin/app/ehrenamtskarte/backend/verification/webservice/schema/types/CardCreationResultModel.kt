package app.ehrenamtskarte.backend.verification.webservice.schema.types

data class DynamicActivationCodeResult(
    val cardInfoHashBase64: String,
    val codeBase64: String
)

data class StaticVerificationCodeResult(
    val cardInfoHashBase64: String,
    val codeBase64: String
)

data class CardCreationResultModel(
    val dynamicActivationCode: DynamicActivationCodeResult,
    val staticVerificationCode: StaticVerificationCodeResult?
)
