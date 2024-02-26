package app.ehrenamtskarte.backend.verification.webservice.schema

import Card
import app.ehrenamtskarte.backend.auth.database.AdministratorEntity
import app.ehrenamtskarte.backend.auth.service.Authorizer
import app.ehrenamtskarte.backend.common.webservice.GraphQLContext
import app.ehrenamtskarte.backend.exception.service.ForbiddenException
import app.ehrenamtskarte.backend.exception.service.ProjectNotFoundException
import app.ehrenamtskarte.backend.exception.service.UnauthorizedException
import app.ehrenamtskarte.backend.exception.webservice.exceptions.InvalidCardHashException
import app.ehrenamtskarte.backend.exception.webservice.exceptions.InvalidCodeTypeException
import app.ehrenamtskarte.backend.exception.webservice.exceptions.InvalidQrCodeSize
import app.ehrenamtskarte.backend.matomo.Matomo
import app.ehrenamtskarte.backend.verification.PEPPER_LENGTH
import app.ehrenamtskarte.backend.verification.database.CodeType
import app.ehrenamtskarte.backend.verification.database.repos.CardRepository
import app.ehrenamtskarte.backend.verification.hash
import app.ehrenamtskarte.backend.verification.service.CardActivator
import app.ehrenamtskarte.backend.verification.service.CardVerifier
import app.ehrenamtskarte.backend.verification.webservice.QRCodeUtil
import app.ehrenamtskarte.backend.verification.webservice.schema.types.ActivationState
import app.ehrenamtskarte.backend.verification.webservice.schema.types.CardActivationResultModel
import app.ehrenamtskarte.backend.verification.webservice.schema.types.CardCreationResultModel
import app.ehrenamtskarte.backend.verification.webservice.schema.types.CardGenerationModel
import app.ehrenamtskarte.backend.verification.webservice.schema.types.DynamicActivationCodeResult
import app.ehrenamtskarte.backend.verification.webservice.schema.types.StaticVerificationCodeResult
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import com.google.protobuf.ByteString
import extensionStartDayOrNull
import graphql.schema.DataFetchingEnvironment
import io.ktor.util.decodeBase64Bytes
import io.ktor.util.encodeBase64
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import java.security.SecureRandom
import java.sql.Connection.TRANSACTION_REPEATABLE_READ
import java.util.Base64

@Suppress("unused")
class CardMutationService {
    private val activationSecretLength = 20

    private fun createDynamicActivationCode(cardInfo: Card.CardInfo, userId: Int): DynamicActivationCodeResult {
        val secureRandom = SecureRandom.getInstanceStrong()
        val pepper = ByteArray(PEPPER_LENGTH)
        secureRandom.nextBytes(pepper)

        val rawActivationSecret = ByteArray(activationSecretLength)
        secureRandom.nextBytes(rawActivationSecret)

        val activationSecretHash = CardActivator.hashActivationSecret(rawActivationSecret)
        val hashedCardInfo = cardInfo.hash(pepper)
        val dynamicActivationCode = Card.DynamicActivationCode.newBuilder()
            .setInfo(cardInfo)
            .setPepper(ByteString.copyFrom(pepper))
            .setActivationSecret(ByteString.copyFrom(rawActivationSecret))
            .build()

        if (!QRCodeUtil.isContentLengthValid(dynamicActivationCode)) {
            throw InvalidQrCodeSize(cardInfo.toByteArray().encodeBase64(), CodeType.DYNAMIC)
        }

        if (!cardInfo.extensions.hasExtensionRegion()) {
            throw InvalidCardHashException()
        }
        return transaction {
            CardRepository.insert(
                hashedCardInfo,
                activationSecretHash,
                cardInfo.expirationDay.toLong(),
                cardInfo.extensions.extensionRegion.regionId,
                userId,
                CodeType.DYNAMIC,
                cardInfo.extensions.extensionStartDayOrNull?.startDay?.toLong()
            )

            DynamicActivationCodeResult(
                cardInfoHashBase64 = hashedCardInfo.encodeBase64(),
                codeBase64 = dynamicActivationCode.toByteArray().encodeBase64()
            )
        }
    }

    private fun createStaticVerificationCode(cardInfo: Card.CardInfo, userId: Int): StaticVerificationCodeResult {
        val pepper = ByteArray(PEPPER_LENGTH)
        SecureRandom.getInstanceStrong().nextBytes(pepper)

        val hashedCardInfo = cardInfo.hash(pepper)
        val staticVerificationCode = Card.StaticVerificationCode.newBuilder()
            .setInfo(cardInfo)
            .setPepper(ByteString.copyFrom(pepper))
            .build()

        if (!QRCodeUtil.isContentLengthValid(staticVerificationCode)) {
            throw InvalidQrCodeSize(cardInfo.toByteArray().encodeBase64(), CodeType.STATIC)
        }
        return transaction {
            CardRepository.insert(
                hashedCardInfo,
                null,
                cardInfo.expirationDay.toLong(),
                cardInfo.extensions.extensionRegion.regionId,
                userId,
                CodeType.STATIC,
                cardInfo.extensions.extensionStartDay.startDay.toLong()
            )

            StaticVerificationCodeResult(
                cardInfoHashBase64 = hashedCardInfo.encodeBase64(),
                codeBase64 = staticVerificationCode.toByteArray().encodeBase64()
            )
        }
    }

    @GraphQLDescription("Creates a new digital entitlementcard and returns it")
    fun createCardsByCardInfos(
        dfe: DataFetchingEnvironment,
        project: String,
        encodedCardInfos: List<String>,
        generateStaticCodes: Boolean
    ): List<CardCreationResultModel> {
        val context = dfe.getContext<GraphQLContext>()
        val projectConfig =
            context.backendConfiguration.projects.find { it.id == project }
                ?: throw ProjectNotFoundException(project)
        val jwtPayload = context.enforceSignedIn()
        val user = transaction { AdministratorEntity.findById(jwtPayload.adminId) ?: throw UnauthorizedException() }
        val activationCodes = transaction {
            encodedCardInfos.map { encodedCardInfo ->
                val cardInfoBytes = encodedCardInfo.decodeBase64Bytes()
                val cardInfo = Card.CardInfo.parseFrom(cardInfoBytes)

                if (!Authorizer.mayCreateCardInRegion(user, cardInfo.extensions.extensionRegion.regionId)) {
                    throw ForbiddenException()
                }

                return@map CardCreationResultModel(
                    createDynamicActivationCode(cardInfo, user.id.value),
                    if (generateStaticCodes) createStaticVerificationCode(cardInfo, user.id.value) else null
                )
            }
        }

        val regionId = user.regionId?.value
        if (regionId != null) {
            Matomo.trackCreateCards(
                projectConfig,
                context.request,
                dfe.field.name,
                regionId,
                numberOfDynamicCards = encodedCardInfos.size,
                numberOfStaticCards = if (generateStaticCodes) encodedCardInfos.size else 0
            )
        }
        return activationCodes
    }

    @GraphQLDescription("Stores a batch of new digital entitlementcards")
    fun addCards(dfe: DataFetchingEnvironment, project: String, cards: List<CardGenerationModel>): Boolean {
        val context = dfe.getContext<GraphQLContext>()
        val backendConfig = context.backendConfiguration
        val projectConfig = backendConfig.projects.find { it.id == project }
            ?: throw ProjectNotFoundException(project)
        val jwtPayload = context.enforceSignedIn()
        val user = transaction { AdministratorEntity.findById(jwtPayload.adminId) ?: throw UnauthorizedException() }
        transaction {
            for (card in cards) {
                if (!Authorizer.mayCreateCardInRegion(user, card.regionId)) {
                    throw ForbiddenException()
                }
                if (!isCodeTypeValid(card)) {
                    throw InvalidCodeTypeException()
                }
                val decodedCardInfoHash = Base64.getDecoder().decode(card.cardInfoHashBase64)
                if (!isCardHashValid(decodedCardInfoHash)) {
                    throw InvalidCardHashException()
                }
                val activationSecret =
                    card.activationSecretBase64?.let {
                        val decodedRawActivationSecret = Base64.getDecoder().decode(it)
                        CardActivator.hashActivationSecret(decodedRawActivationSecret)
                    }

                CardRepository.insert(
                    decodedCardInfoHash,
                    activationSecret,
                    card.cardExpirationDay,
                    card.regionId,
                    user.id.value,
                    card.codeType,
                    card.cardStartDay
                )
            }
        }

        val regionId = user.regionId?.value
        if (regionId != null) {
            val numberOfDynamicCardsCreated = cards.count { it.codeType === CodeType.DYNAMIC }
            val numberOfStaticCardsCreated = cards.size - numberOfDynamicCardsCreated
            Matomo.trackCreateCards(
                projectConfig,
                context.request,
                dfe.field.name,
                regionId,
                numberOfDynamicCardsCreated,
                numberOfStaticCardsCreated
            )
        }

        return true
    }

    @GraphQLDescription("Activate a dynamic entitlement card")
    fun activateCard(
        project: String,
        cardInfoHashBase64: String,
        activationSecretBase64: String,
        overwrite: Boolean,
        dfe: DataFetchingEnvironment
    ): CardActivationResultModel {
        val logger = LoggerFactory.getLogger(CardMutationService::class.java)
        val context = dfe.getContext<GraphQLContext>()
        val projectConfig =
            context.backendConfiguration.projects.find { it.id == project }
                ?: throw ProjectNotFoundException(project)
        val cardHash = Base64.getDecoder().decode(cardInfoHashBase64)
        val rawActivationSecret = Base64.getDecoder().decode(activationSecretBase64)

        // Avoid race conditions when activating a card.
        val activationResult = transaction(TRANSACTION_REPEATABLE_READ) t@{
            repetitionAttempts = 0
            val card = CardRepository.findByHash(project, cardHash)
            val activationSecretHash = card?.activationSecretHash

            if (card == null || activationSecretHash == null) {
                logger.info("${context.remoteIp} failed to activate card, card not found with cardHash:$cardInfoHashBase64")
                return@t CardActivationResultModel(ActivationState.failed)
            }

            if (!CardActivator.verifyActivationSecret(rawActivationSecret, activationSecretHash)) {
                logger.info("${context.remoteIp} failed to activate card with id:${card.id} and overwrite: $overwrite")
                return@t CardActivationResultModel(ActivationState.failed)
            }

            if (CardVerifier.isExpired(card.expirationDay, projectConfig.timezone) || card.revoked) {
                logger.info("${context.remoteIp} failed to activate card with id:${card.id} and overwrite: $overwrite because card isExpired or revoked")
                return@t CardActivationResultModel(ActivationState.failed)
            }

            if (!overwrite && card.totpSecret != null) {
                logger.info("Card with id:${card.id} did not overwrite card from ${context.remoteIp}")
                return@t CardActivationResultModel(ActivationState.did_not_overwrite_existing)
            }

            val totpSecret = CardActivator.generateTotpSecret()
            val encodedTotpSecret = Base64.getEncoder().encodeToString(totpSecret)
            CardRepository.activate(card, totpSecret)
            logger.info("Card with id:${card.id} and overwrite: $overwrite was activated from ${context.remoteIp}")
            return@t CardActivationResultModel(ActivationState.success, encodedTotpSecret)
        }
        Matomo.trackActivation(
            projectConfig,
            context.request,
            dfe.field.name,
            cardHash,
            activationResult.activationState != ActivationState.failed
        )
        return activationResult
    }

    private fun isCodeTypeValid(card: CardGenerationModel): Boolean {
        return (card.codeType == CodeType.STATIC && card.activationSecretBase64 == null) ||
            (card.codeType == CodeType.DYNAMIC && card.activationSecretBase64 != null)
    }

    private fun isCardHashValid(cardHash: ByteArray): Boolean {
        // we expect a SHA-256 hash, thus the byte array should be of size 256/8=32
        return cardHash.size == 32
    }
}
