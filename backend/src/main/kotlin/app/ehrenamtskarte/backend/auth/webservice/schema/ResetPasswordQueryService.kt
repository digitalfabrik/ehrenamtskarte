package app.ehrenamtskarte.backend.auth.webservice.schema

import app.ehrenamtskarte.backend.auth.database.AdministratorEntity
import app.ehrenamtskarte.backend.auth.database.Administrators
import app.ehrenamtskarte.backend.common.webservice.InvalidLinkException
import app.ehrenamtskarte.backend.projects.database.ProjectEntity
import app.ehrenamtskarte.backend.projects.database.Projects
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import graphql.GraphqlErrorException
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

class PasswordResetKeyExpiredException() : GraphqlErrorException(
    newErrorException().extensions(
        mapOf(
            Pair("code", "PASSWORD_RESET_KEY_EXPIRED"),
        ),
    ),
)

@Suppress("unused")
class ResetPasswordQueryService {
    @GraphQLDescription("Verify password reset link")
    fun checkPasswordResetLink(project: String, resetKey: String): Boolean {
        return transaction {
            val projectId = ProjectEntity.find { Projects.project eq project }.single().id.value
            val admin = AdministratorEntity
                .find { Administrators.passwordResetKey eq resetKey and (Administrators.projectId eq projectId) }.singleOrNull()
            if (admin == null) {
                throw InvalidLinkException()
            } else if (admin.passwordResetKeyExpiry!!.isBefore(LocalDateTime.now())) {
                throw PasswordResetKeyExpiredException()
            }
            true
        }
    }
}