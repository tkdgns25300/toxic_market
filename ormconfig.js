require("dotenv").config();
const rootPath = process.env.NODE_ENV === "development" ? "src" : "dist"

module.exports = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    database: "toxic_market",
    synchronize: true,
    connectTimeout: 3000,
    logging: false,
    timezone: "Z",
    entities: [`${rootPath}/entity/**/*.{js,ts}`],
    migrations: [`${rootPath}/migration/**/*.{js,ts}`],
    subscribers: [`${rootPath}/subscriber/**/*.{js,ts}`],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber"
    }
}
