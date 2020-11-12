/*
 * This Kotlin source file was generated by the Gradle 'init' task.
 */
package xyz.elitese.ehrenamtskarte

import io.javalin.Javalin

fun main(args: Array<String>) {
    val app = Javalin.create().start(7000)
    app.get("/") { ctx -> ctx.result("Hello World!") }
    println("Server is running at http://localhost:7000")
}
