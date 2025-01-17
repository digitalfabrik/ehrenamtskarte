package app.ehrenamtskarte.backend.stores.utils

import app.ehrenamtskarte.backend.stores.importer.replaceNa

/** Returns null if string can't be trimmed f.e. empty string
 * Removes subsequent whitespaces
 * */
fun String?.clean(removeSubsequentWhitespaces: Boolean = true): String? {
    val trimmed = this?.replaceNa()?.trim()
    if (trimmed.isNullOrEmpty()) {
        return null
    }
    if (removeSubsequentWhitespaces) {
        return trimmed.replace(Regex("""\s{2,}"""), " ")
    }
    return trimmed
}
