package app.ehrenamtskarte.backend.verification.webservice.schema

import app.ehrenamtskarte.backend.auth.database.AdministratorEntity
import app.ehrenamtskarte.backend.auth.service.Authorizer
import app.ehrenamtskarte.backend.common.webservice.GraphQLContext
import app.ehrenamtskarte.backend.exception.service.ForbiddenException
import app.ehrenamtskarte.backend.exception.service.ProjectNotFoundException
import app.ehrenamtskarte.backend.exception.service.UnauthorizedException
import app.ehrenamtskarte.backend.exception.webservice.exceptions.InvalidCardHashException
import app.ehrenamtskarte.backend.exception.webservice.exceptions.InvalidCodeTypeException
import app.ehrenamtskarte.backend.verification.database.CodeType
import app.ehrenamtskarte.backend.verification.database.repos.CardRepository
import app.ehrenamtskarte.backend.verification.service.CardActivator
import app.ehrenamtskarte.backend.verification.service.CardVerifier
import app.ehrenamtskarte.backend.verification.webservice.schema.types.ActivationState
import app.ehrenamtskarte.backend.verification.webservice.schema.types.CardActivationResultModel
import app.ehrenamtskarte.backend.verification.webservice.schema.types.CardGenerationModel
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import graphql.schema.DataFetchingEnvironment
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import java.util.Base64

@Suppress("unused")
class CardMutationService {
    @GraphQLDescription("Stores a batch of new digital entitlementcards")
    fun addCards(dfe: DataFetchingEnvironment, cards: List<CardGenerationModel>): Boolean {
        val jwtPayload = dfe.getContext<GraphQLContext>().enforceSignedIn()

        transaction {
            val user =
                AdministratorEntity.findById(jwtPayload.adminId)
                    ?: throw UnauthorizedException()

            for (card in cards) {
                val targetedRegionId = card.regionId
                if (!Authorizer.mayCreateCardInRegion(user, targetedRegionId)) {
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
                    card.codeType
                )
            }
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
        val card = transaction { CardRepository.findByHash(project, cardHash) }
        val activationSecretHash = card?.activationSecretHash

        if (card == null || activationSecretHash == null) {
            return CardActivationResultModel(ActivationState.failed)
        }

        if (!CardActivator.verifyActivationSecret(rawActivationSecret, activationSecretHash)) {
            logger.info("${context.remoteIp} failed to activate card with id:${card.id}")
            return CardActivationResultModel(ActivationState.failed)
        }

        if (CardVerifier.isExpired(card.expirationDay, projectConfig.timezone) || card.revoked) {
            return CardActivationResultModel(ActivationState.failed)
        }

        if (!overwrite && card.totpSecret != null) {
            logger.info("Card with id:${card.id} did not overwrite card from ${context.remoteIp}")
            return CardActivationResultModel(ActivationState.did_not_overwrite_existing)
        }

        val totpSecret = CardActivator.generateTotpSecret()
        val encodedTotpSecret = Base64.getEncoder().encodeToString(totpSecret)
        transaction { CardRepository.activate(card, totpSecret) }
        logger.info("Card with id:${card.id} was activated from ${context.remoteIp}")
        return CardActivationResultModel(ActivationState.success, encodedTotpSecret)
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
