const mysql = require('promise-mysql')
const SqlString = require('sqlstring')

const getConnection = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        insecureAuth: true,
    })
}

const setup = async () => {
    const db = await getConnection()

    const usersTable = `
        CREATE TABLE users(
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

    `

    const refreshTokensTable = `
        CREATE TABLE refresh_tokens(
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL
        );
    `
    await db.query(usersTable)
    await db.query(refreshTokensTable)

    await db.end()
}

const getUserByUsername = async username => {
    const db = await getConnection()
    const results = await db.query(
        SqlString.format('SELECT * FROM users WHERE name = ? LIMIT 1', [
            username,
        ])
    )
    await db.end()
    return results[0]
}

const storeRefreshToken = async (token, id) => {
    const db = await getConnection()
    const results = await db.query(
        SqlString.format(
            'INSERT INTO refresh_tokens (token, user_id) VALUES (?, ?)',
            [token, id]
        )
    )
    await db.end()
}

module.exports = {
    setup,
    getUserByUsername,
    storeRefreshToken,
}
