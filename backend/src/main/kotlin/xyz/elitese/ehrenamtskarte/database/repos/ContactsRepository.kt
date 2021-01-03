package xyz.elitese.ehrenamtskarte.database.repos

import xyz.elitese.ehrenamtskarte.database.ContactEntity
import xyz.elitese.ehrenamtskarte.database.Contacts
import xyz.elitese.ehrenamtskarte.database.sortByKeys

object ContactsRepository {

    fun findByIds(ids: List<Int>) =
        ContactEntity.find { Contacts.id inList ids }.sortByKeys({ it.id.value }, ids)

}
