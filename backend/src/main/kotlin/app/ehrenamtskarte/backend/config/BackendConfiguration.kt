package app.ehrenamtskarte.backend.config

import app.ehrenamtskarte.backend.stores.importer.ImportConfig
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import com.fasterxml.jackson.module.kotlin.KotlinModule
import java.io.File
import java.io.InputStream
import java.nio.file.Paths

val possibleBackendConfigurationFiles =
    listOf<File>(
        Paths.get(System.getProperty("user.dir"), "config.yml").toFile(),
        Paths.get(System.getProperty("user.home"), ".config", "entitlementcard", "config.yml").toFile(),
        Paths.get("/etc/entitlementcard/config.yml").toFile()
    )

data class PostgresConfig(val url: String, val user: String, val password: String)
data class GeocodingConfig(val enabled: Boolean, val host: String)
data class ProjectConfig(val id: String, val importUrl: String, val pipelineName: String)
data class ServerConfig(val dataDirectory: String, val host: String, val port: String)

data class BackendConfiguration(
    val production: Boolean,
    val server: ServerConfig,
    val postgres: PostgresConfig,
    val geocoding: GeocodingConfig,
    val projects: List<ProjectConfig>
) {

    fun toImportConfig(projectId: String): ImportConfig {
        return ImportConfig(this.copy(), projectId)
    }

    companion object {
        private val mapper = ObjectMapper(YAMLFactory()).registerModule(KotlinModule())

        fun load(configFile: File?): BackendConfiguration {
            val fallbackResource = ClassLoader.getSystemResource("config/config.yml")
                ?: throw Error("Fallback backend configuration resource 'config/config.yml' missing!'")

            val file = configFile ?: possibleBackendConfigurationFiles.find { it.exists() }
            if (file != null) return from(file)

            return from(fallbackResource.openStream())
        }

        private fun from(file: File): BackendConfiguration =
            file.bufferedReader().use { mapper.readValue(it, BackendConfiguration::class.java) }

        private fun from(inputStream: InputStream): BackendConfiguration =
            mapper.readValue(inputStream, BackendConfiguration::class.java)
    }
}
