package app.ehrenamtskarte.backend.application.webservice.schema.create.primitives

import app.ehrenamtskarte.backend.application.webservice.schema.view.JsonField
import app.ehrenamtskarte.backend.application.webservice.schema.view.Type
import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import com.expediagroup.graphql.generator.exceptions.GraphQLKotlinException

const val MAX_SHORT_TEXT_LENGTH = 300

@GraphQLDescription("A String wrapper that expects a non-empty string with at most $MAX_SHORT_TEXT_LENGTH characters")
data class ShortTextInput(val shortText: String) {
    init {
        if (shortText.isEmpty()) {
            throw GraphQLKotlinException("Value of ShortTextInput should not be empty.")
        } else if (shortText.length > MAX_SHORT_TEXT_LENGTH) {
            throw GraphQLKotlinException("Value of ShortTextInput should have at most $MAX_SHORT_TEXT_LENGTH characters.")
        }
    }

    fun toJsonField(fieldName: String, translations: Map<String, String>): JsonField {
        return JsonField(fieldName, translations, Type.String, shortText)
    }
}
