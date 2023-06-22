package app.ehrenamtskarte.backend.stores.database.repos

import app.ehrenamtskarte.backend.common.database.sortByKeys
import app.ehrenamtskarte.backend.projects.database.Projects
import app.ehrenamtskarte.backend.stores.database.AcceptingStoreEntity
import app.ehrenamtskarte.backend.stores.database.AcceptingStores
import app.ehrenamtskarte.backend.stores.database.Addresses
import app.ehrenamtskarte.backend.stores.database.PhysicalStores
import app.ehrenamtskarte.backend.stores.webservice.schema.types.Coordinates
import net.postgis.jdbc.geometry.Point
import org.jetbrains.exposed.sql.ComparisonOp
import org.jetbrains.exposed.sql.CustomFunction
import org.jetbrains.exposed.sql.DoubleColumnType
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.Op
import org.jetbrains.exposed.sql.OrOp
import org.jetbrains.exposed.sql.SizedIterable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.doubleParam
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringParam

object AcceptingStoresRepository {

    // TODO would be great to support combinations like "Tür an Tür Augsburg"
    // TODO Fulltext search is possible with tsvector in postgres: https://www.compose.com/articles/mastering-postgresql-tools-full-text-search-and-phrase-search/
    // TODO Probably not relevant right now
    fun findBySearch(
        project: String,
        searchText: String?,
        categoryIds: List<Int>?,
        coordinates: Coordinates?,
        limit: Int,
        offset: Long
    ): SizedIterable<AcceptingStoreEntity> {
        val categoryMatcher =
            if (categoryIds == null) {
                Op.TRUE
            } else {
                Op.build { AcceptingStores.categoryId inList categoryIds }
            }

        val textMatcher =
            if (searchText == null) {
                Op.TRUE
            } else {
                OrOp(
                    listOf(
                        AcceptingStores.name ilike "%$searchText%",
                        AcceptingStores.description ilike "%$searchText%",
                        Addresses.location ilike "%$searchText%",
                        Addresses.postalCode ilike "%$searchText%",
                        Addresses.street ilike "%$searchText%"
                    )
                )
            }

        val sortExpression = if (coordinates != null) {
            DistanceFunction(
                PhysicalStores.coordinates,
                MakePointFunction(doubleParam(coordinates.lng), doubleParam(coordinates.lat))
            )
        } else {
            AcceptingStores.name
        }

        return (Projects innerJoin (AcceptingStores leftJoin PhysicalStores leftJoin Addresses))
            .slice(AcceptingStores.columns)
            .select(Projects.project eq project and categoryMatcher and textMatcher)
            .orderBy(sortExpression)
            .let { AcceptingStoreEntity.wrapRows(it) }
            .limit(limit, offset)
    }

    fun findByIds(ids: List<Int>) =
        AcceptingStoreEntity.find { AcceptingStores.id inList ids }.sortByKeys({ it.id.value }, ids)
}

// Postgres' "like" operation uses case sensitive comparison by default.
// Postgres has a builtin "ilike" operation which does case sensitive comparison.
class InsensitiveLikeOp(expr1: Expression<*>, expr2: Expression<*>) : ComparisonOp(expr1, expr2, "ILIKE")

infix fun <T : String?> Expression<T>.ilike(pattern: String): InsensitiveLikeOp =
    InsensitiveLikeOp(this, stringParam(pattern))

class DistanceFunction(expr1: Expression<Point>, expr2: Expression<Point>) :
    CustomFunction<Double>("ST_DistanceSphere", DoubleColumnType(), expr1, expr2)

class MakePointFunction(expr1: Expression<Double>, expr2: Expression<Double>) :
    CustomFunction<Point>("ST_MakePoint", DoubleColumnType(), expr1, expr2)
