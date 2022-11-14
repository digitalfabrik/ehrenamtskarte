package app.ehrenamtskarte.backend.application.database.repos

import app.ehrenamtskarte.backend.application.database.ApplicationEntity
import app.ehrenamtskarte.backend.application.database.Applications
import app.ehrenamtskarte.backend.application.webservice.schema.view.ApplicationView
import app.ehrenamtskarte.backend.application.webservice.schema.view.JsonField
import app.ehrenamtskarte.backend.common.webservice.GraphQLContext
import app.ehrenamtskarte.backend.projects.database.ProjectEntity
import app.ehrenamtskarte.backend.projects.database.Projects
import app.ehrenamtskarte.backend.regions.database.Regions
import com.fasterxml.jackson.databind.json.JsonMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import io.javalin.util.FileUtil
import jakarta.servlet.http.Part
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.nio.file.Paths

object ApplicationRepository {
    fun persistApplication(
        applicationJson: JsonField,
        regionId: Int,
        applicationData: File,
        files: List<Part>
    ) {
        val newApplication = transaction {
            ApplicationEntity.new {
                this.regionId = EntityID(regionId, Regions)
                this.jsonValue = toString(applicationJson)
            }
        }

        val project =
            transaction {
                (Projects innerJoin Regions).slice(Projects.columns).select { Regions.id eq regionId }
                    .single().let { ProjectEntity.wrapRow(it) }
            }

        val projectDirectory = File(applicationData, project.project)
        val applicationDirectory = File(projectDirectory, newApplication.id.toString())

        try {
            files.forEachIndexed { index, part ->
                FileUtil.streamToFile(
                    part.inputStream,
                    File(applicationDirectory, "$index").absolutePath
                )
                File(applicationDirectory, "$index.contentType").writeText(part.contentType)
            }
        } catch (e: Exception) {
            applicationDirectory.deleteRecursively()
            transaction {
                newApplication.delete()
            }
            throw e
        }
    }

    private fun toString(obj: JsonField): String {
        val mapper = JsonMapper()
        mapper.registerModule(KotlinModule.Builder().build())
        return mapper.writeValueAsString(obj)
    }

    fun getApplications(regionId: Int): List<ApplicationView> {
        return transaction {
            ApplicationEntity.find { Applications.regionId eq regionId }
                .map { ApplicationView(it.id.value, it.regionId.value, it.createdDate.toString(), it.jsonValue) }
        }
    }

    fun delete(applicationId: Int, graphQLContext: GraphQLContext): Boolean {
        return transaction {
            val application = ApplicationEntity.findById(applicationId)
            if (application != null) {
                val project = (Projects innerJoin Regions).select { Regions.id eq application.regionId }.single()
                    .let { ProjectEntity.wrapRow(it) }
                val applicationDirectory =
                    Paths.get(graphQLContext.applicationData.absolutePath, project.project, application.id.toString())
                application.delete()
                applicationDirectory.toFile().deleteRecursively()
            } else false
        }
    }
}
