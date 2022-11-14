package app.ehrenamtskarte.backend.application.webservice.schema.create

import app.ehrenamtskarte.backend.application.webservice.schema.create.primitives.EmailInput
import app.ehrenamtskarte.backend.application.webservice.schema.create.primitives.ShortTextInput
import app.ehrenamtskarte.backend.application.webservice.schema.view.JsonField
import app.ehrenamtskarte.backend.application.webservice.schema.view.Type
import app.ehrenamtskarte.backend.application.webservice.utils.JsonFieldSerializable

data class OrganizationContact(
    val name: ShortTextInput,
    val telephone: ShortTextInput,
    val email: EmailInput,
    val hasGivenPermission: Boolean
) : JsonFieldSerializable {
    override fun toJsonField(): JsonField {
        return JsonField(
            "organizationContact",
            mapOf("de" to "Kontaktperson der Organisation"),
            Type.Array,
            listOf(
                name.toJsonField("name", mapOf("de" to "Name")),
                telephone.toJsonField("telephone", mapOf("de" to "Telefonnummer")),
                email.toJsonField("email", mapOf("de" to "Email-Adresse")),
                JsonField(
                    "hasGivenPermission",
                    mapOf("de" to "Kontaktperson hat zur Weitergabe der Daten möglicher Kontaktaufnahme eingewilligt"),
                    Type.Boolean,
                    hasGivenPermission
                )
            )
        )
    }
}
