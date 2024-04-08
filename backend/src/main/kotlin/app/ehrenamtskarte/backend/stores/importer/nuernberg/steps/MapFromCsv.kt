package app.ehrenamtskarte.backend.stores.importer.nuernberg.steps

import app.ehrenamtskarte.backend.stores.COUNTRY_CODE
import app.ehrenamtskarte.backend.stores.importer.ImportConfig
import app.ehrenamtskarte.backend.stores.importer.PipelineStep
import app.ehrenamtskarte.backend.stores.importer.common.types.AcceptingStore
import app.ehrenamtskarte.backend.stores.importer.nuernberg.constants.categoryMapping
import app.ehrenamtskarte.backend.stores.importer.nuernberg.types.CSVAcceptingStore
import app.ehrenamtskarte.backend.stores.importer.nuernberg.utils.Discounts
import app.ehrenamtskarte.backend.stores.importer.nuernberg.utils.mergeDiscount
import app.ehrenamtskarte.backend.stores.importer.replaceNa
import org.slf4j.Logger

/**
 * Maps [CSVAcceptingStore] to [AcceptingStore].
 * Properties are cleaned, decoded and converted to the correct types.
 */
class MapFromCsv(config: ImportConfig, private val logger: Logger) :
    PipelineStep<List<CSVAcceptingStore>, List<AcceptingStore>>(config) {

    override fun execute(input: List<CSVAcceptingStore>) = input.mapNotNull {
        val longitude = if (it.longitude?.isNotEmpty()!!) {
            it.longitude!!.toDouble()
        } else {
            null
        }

        val latitude = if (it.latitude?.isNotEmpty()!!) {
            it.latitude!!.toDouble()
        } else {
            null
        }

        val discount = mergeDiscount(Discounts(discountDE = it.discountDE, discountEN = it.discountEN))
        try {
            AcceptingStore(
                it.name.clean()!!,
                COUNTRY_CODE,
                it.location.clean()!!,
                it.postalCode.clean()!!,
                it.street.clean()!!,
                it.houseNumber.clean()!!,
                null,
                longitude,
                latitude,
                categoryMapping.getValue(it.categoryId!!),
                it.email.clean(),
                it.telephone.clean(),
                it.homepage.clean(),
                discount.clean(false),
                null,
                null
            )
        } catch (e: Exception) {
            logger.error("Exception occurred while mapping $it", e)
            null
        }
    }

    private fun String?.clean(removeSubsequentWhitespaces: Boolean = true): String? {
        val trimmed = this?.replaceNa()?.trim()
        if (removeSubsequentWhitespaces) {
            return trimmed?.replace(Regex("""\s{2,}"""), " ")
        }
        return trimmed
    }
}
