package app.ehrenamtskarte.backend.stores.importer.steps

import app.ehrenamtskarte.backend.stores.importer.PipelineStep
import app.ehrenamtskarte.backend.stores.importer.replaceNa
import app.ehrenamtskarte.backend.stores.importer.types.AcceptingStore
import app.ehrenamtskarte.backend.stores.importer.types.LbeAcceptingStore
import org.slf4j.Logger

const val COUNTRY_CODE = "de"

class Map(private val logger: Logger) : PipelineStep<List<LbeAcceptingStore>, List<AcceptingStore>>() {

    override fun execute(input: List<LbeAcceptingStore>) = input.mapNotNull {
        try {
            AcceptingStore(
                it.name!!.trim(),
                COUNTRY_CODE,
                it.location!!.trim(),
                it.postalCode.clean(),
                it.street.clean(),
                it.houseNumber.clean(),
                it.longitude!!.replace(",", ".").toDouble(),
                it.latitude!!.replace(",", ".").toDouble(),
                categoryId(it.category!!),
                it.email.clean(),
                it.telephone.clean(),
                it.homepage.clean(),
                it.discount.clean()
            )
        } catch (e: Exception) {
            logger.info("Exception occurred while mapping $it", e)
            null
        }
    }

    private fun categoryId(category: String): Int {
        val int = category.toInt()
        return if (int == 99) 9 else int
    }

    private fun String?.clean(): String? {
        return this?.replaceNa()?.trim()
    }

}
