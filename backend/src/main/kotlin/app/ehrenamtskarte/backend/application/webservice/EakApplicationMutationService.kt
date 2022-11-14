package app.ehrenamtskarte.backend.application.webservice

import app.ehrenamtskarte.backend.application.database.ApplicationEntity
import app.ehrenamtskarte.backend.application.database.repos.ApplicationRepository
import app.ehrenamtskarte.backend.application.webservice.schema.create.BlueCardApplication
import app.ehrenamtskarte.backend.application.webservice.schema.create.GoldenCardApplication
import app.ehrenamtskarte.backend.auth.database.AdministratorEntity
import app.ehrenamtskarte.backend.auth.service.Authorizer.mayDeleteApplicationsInRegion
import app.ehrenamtskarte.backend.common.webservice.GraphQLContext
import app.ehrenamtskarte.backend.common.webservice.UnauthorizedException
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import graphql.schema.DataFetchingEnvironment
import org.jetbrains.exposed.sql.transactions.transaction

@Suppress("unused")
class EakApplicationMutationService {

    @GraphQLDescription("Stores a new blue digital EAK")
    fun addBlueEakApplication(
        regionId: Int,
        application: BlueCardApplication,
        dfe: DataFetchingEnvironment
    ): Boolean {
        val context = dfe.getContext<GraphQLContext>()
        // Validate that all files are png, jpeg or pdf files and at most 5MB.
        val allowedContentTypes = setOf("application/pdf", "image/png", "image/jpeg")
        val maxFileSizeBytes = 5 * 1000 * 1000
        if (!context.files.all { it.contentType in allowedContentTypes && it.size <= maxFileSizeBytes }) {
            throw IllegalArgumentException("An uploaded file does not adhere to the file upload requirements.")
        }

        ApplicationRepository.persistApplication(
            application.toJsonField(),
            regionId,
            context.applicationData,
            context.files
        )
        return true
    }

    @GraphQLDescription("Stores a new golden digital EAK")
    fun addGoldenEakApplication(
        regionId: Int,
        application: GoldenCardApplication,
        dfe: DataFetchingEnvironment
    ): Boolean {
        val context = dfe.getContext<GraphQLContext>()
        // Validate that all files are png, jpeg or pdf files and at most 5MB large.
        val allowedContentTypes = setOf("application/pdf", "image/png", "image/jpeg")
        val maxFileSizeBytes = 5 * 1000 * 1000
        if (!context.files.all { it.contentType in allowedContentTypes && it.size <= maxFileSizeBytes }) {
            throw IllegalArgumentException("An uploaded file does not adhere to the file upload requirements.")
        }

        ApplicationRepository.persistApplication(
            application.toJsonField(),
            regionId,
            context.applicationData,
            context.files
        )
        return true
    }

    @GraphQLDescription("Deletes the application with specified id")
    fun deleteApplication(
        applicationId: Int,
        dfe: DataFetchingEnvironment
    ): Boolean {
        val context = dfe.getContext<GraphQLContext>()
        val jwtPayload = context.enforceSignedIn()

        return transaction {
            val application = ApplicationEntity.findById(applicationId) ?: throw UnauthorizedException()
            // We throw an UnauthorizedException here, as we do not know whether there was an application with id
            // `applicationId` and whether this application was contained in the user's project & region.

            val user = AdministratorEntity.findById(jwtPayload.userId)
            ?: throw IllegalArgumentException("Admin does not exist")if (!mayDeleteApplicationsInRegion(user, application.regionId.value)) {
                throw UnauthorizedException()
            }

            ApplicationRepository.delete(applicationId, context)
        }
    }
}
