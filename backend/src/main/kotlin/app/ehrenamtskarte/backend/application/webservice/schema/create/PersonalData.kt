package app.ehrenamtskarte.backend.application.webservice.schema.create

import app.ehrenamtskarte.backend.application.webservice.schema.create.primitives.DateInput
import app.ehrenamtskarte.backend.application.webservice.schema.create.primitives.EmailInput
import app.ehrenamtskarte.backend.application.webservice.schema.create.primitives.ShortTextInput
import app.ehrenamtskarte.backend.application.webservice.schema.view.JsonField
import app.ehrenamtskarte.backend.application.webservice.schema.view.Type
import app.ehrenamtskarte.backend.application.webservice.utils.JsonFieldSerializable
import com.expediagroup.graphql.generator.exceptions.GraphQLKotlinException
import java.time.LocalDate
import java.time.ZoneId

data class PersonalData(
    val forenames: ShortTextInput,
    val surname: ShortTextInput,
    val address: Address,
    val dateOfBirth: DateInput,
    val telephone: ShortTextInput?,
    val emailAddress: EmailInput,
) : JsonFieldSerializable {

    init {
        val maximumBirthDate = LocalDate.now(ZoneId.of("Europe/Berlin")).minusYears(16)
        if (maximumBirthDate.isBefore(dateOfBirth.getDate())) {
            throw GraphQLKotlinException("Date of birth must be at least 16 years ago.")
        }
    }

    override fun toJsonField(): JsonField {
        return JsonField(
            "personalData",
            mapOf("de" to "Persönliche Daten"),
            Type.Array,
            listOfNotNull(
                forenames.toJsonField("forenames", mapOf("de" to "Vorname(n)")),
                surname.toJsonField("surname", mapOf("de" to "Nachname")),
                address.toJsonField(),
                dateOfBirth.toJsonField("dateOfBirth", mapOf("de" to "Geburtsdatum")),
                telephone?.toJsonField("telephone", mapOf("de" to "Telefonnummer")),
                emailAddress.toJsonField("emailAddress", mapOf("de" to "Email-Adresse")),
            ),
        )
    }
}
