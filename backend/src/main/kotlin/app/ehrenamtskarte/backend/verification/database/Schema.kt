package app.ehrenamtskarte.backend.verification.database

import app.ehrenamtskarte.backend.regions.database.Regions
import app.ehrenamtskarte.backend.verification.DayUtil
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import java.time.LocalDateTime
import java.time.ZoneOffset

const val CARD_DETAILS_HASH_LENGTH = 32 // Using SHA256-HMAC
const val TOTP_SECRET_LENGTH = 20

object Cards : IntIdTable() {
    val totpSecret = binary("totpSecret", TOTP_SECRET_LENGTH)
    // Using long because unsigned types are not stable
    // Days since 1970
    val expirationDay = long("expirationDay")
    val issueDate = long("issueDate")
    val revoked = bool("revoked")
    val regionId = reference("regionId", Regions)
    val cardDetailsHash = binary("cardDetailsHash", CARD_DETAILS_HASH_LENGTH).uniqueIndex()
}

class CardEntity(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<CardEntity>(Cards)

    var totpSecret by Cards.totpSecret
    private var expirationDay by Cards.expirationDay
    private var issueDateEpochSeconds by Cards.issueDate
    var revoked by Cards.revoked
    var cardDetailsHash by Cards.cardDetailsHash
    var regionId by Cards.regionId

    var expirationDate: LocalDateTime?
        get() = if (expirationDay > 0) DayUtil.daysSinceEpochToDate(expirationDay) else null
        set(value) {
            expirationDay = if (value != null) {
                DayUtil.dateToDaysSinceEpoch(value)
            } else {
                0
            }
        }

    var issueDate: LocalDateTime
        get() = LocalDateTime.ofEpochSecond(issueDateEpochSeconds, 0, ZoneOffset.UTC)
        set(value) {
            issueDateEpochSeconds = value.toEpochSecond(ZoneOffset.UTC)
        }
}
