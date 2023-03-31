package app.ehrenamtskarte.backend.common.database

import app.ehrenamtskarte.backend.auth.database.repos.AdministratorsRepository
import app.ehrenamtskarte.backend.auth.webservice.schema.types.Role
import app.ehrenamtskarte.backend.config.BackendConfiguration
import app.ehrenamtskarte.backend.migration.assertDatabaseIsInSync
import app.ehrenamtskarte.backend.projects.database.insertOrUpdateProjects
import app.ehrenamtskarte.backend.regions.database.insertOrUpdateRegions
import app.ehrenamtskarte.backend.stores.database.createOrReplaceStoreFunctions
import app.ehrenamtskarte.backend.stores.database.insertOrUpdateCategories
import org.jetbrains.exposed.sql.Database.Companion.connect
import org.jetbrains.exposed.sql.DatabaseConfig
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.stream.Collectors

class Database {

    companion object {
        private fun executeScript(path: String) {
            val java = Database::class.java
            val resource = java.classLoader.getResource(path) ?: throw Exception("Failed to find script")
            val stream = resource.openStream()
            val sql = BufferedReader(InputStreamReader(stream))
                .lines().collect(Collectors.joining("\n"))
            stream.close()
            with(TransactionManager.current()) {
                exec(sql)
            }
        }

        fun createAccount(
            project: String,
            email: String,
            password: String,
            roleDbValue: String,
            projectId: Int? = null,
        ) {
            val role = Role.fromDbValue(roleDbValue)
            transaction {
                AdministratorsRepository.insert(project, email, password, role, projectId)
            }
        }

        fun setup(config: BackendConfiguration): org.jetbrains.exposed.sql.Database {
            val database = setupWithoutMigrationCheck(config)
            transaction {
                assertDatabaseIsInSync(database)
                insertOrUpdateProjects(config)
                insertOrUpdateRegions()
                insertOrUpdateCategories(Companion::executeScript)
                createOrReplaceStoreFunctions(Companion::executeScript)
            }
            return database
        }

        fun setupWithoutMigrationCheck(config: BackendConfiguration): org.jetbrains.exposed.sql.Database {
            val database = connect(
                config.postgres.url,
                driver = "org.postgresql.Driver",
                user = config.postgres.user,
                password = config.postgres.password,
                setupConnection = {
                    // Set session time zone to UTC, to make timestamps work properly in every configuration.
                    // Note(michael-markl): I believe this is postgres specific syntax.
                    it.prepareStatement("SET TIME ZONE 'UTC';").executeUpdate()
                },
                databaseConfig = if (config.production) {
                    null
                } else {
                    DatabaseConfig.invoke {
                        this.sqlLogger = StdOutSqlLogger
                    }
                },
            )
            return database
        }
    }
}
