package app.ehrenamtskarte.backend.stores.utils

import app.ehrenamtskarte.backend.stores.COUNTRY_CODE
import app.ehrenamtskarte.backend.stores.importer.common.types.AcceptingStore
import app.ehrenamtskarte.backend.stores.webservice.schema.types.CSVAcceptingStore

fun mapCsvToStore(csvStore: CSVAcceptingStore): AcceptingStore {
    return AcceptingStore(
        csvStore.name.clean()!!, COUNTRY_CODE, csvStore.location.clean()!!, csvStore.postalCode.clean()!!, csvStore.street.clean()!!, csvStore.houseNumber.clean()!!, "", csvStore.longitude!!.toDouble(), csvStore.latitude!!.toDouble(), csvStore.categoryId!!.toInt(), csvStore.email.clean()!!, csvStore.telephone.clean()!!, csvStore.homepage.clean()!!, csvStore.discountDE.orEmpty() + "\n\n" + csvStore.discountEN.orEmpty(), null, null
    )
}