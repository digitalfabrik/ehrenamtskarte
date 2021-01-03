package xyz.elitese.ehrenamtskarte.webservice.dataloader

import kotlinx.coroutines.runBlocking
import org.dataloader.DataLoader
import org.jetbrains.exposed.sql.transactions.transaction
import xyz.elitese.ehrenamtskarte.database.repos.CategoriesRepository
import xyz.elitese.ehrenamtskarte.webservice.schema.types.Category
import java.util.concurrent.CompletableFuture

const val CATEGORY_LOADER_NAME = "CATEGORY_LOADER"

val categoryLoader = DataLoader<Int, Category?> { ids ->
    CompletableFuture.supplyAsync {
        runBlocking {
            transaction {
                CategoriesRepository.findByIds(ids).map {
                    if (it == null) null
                    else Category(it.id.value, it.name)
                }
            }
        }
    }
}
