module.exports = {
    database: {
        client: "mysql",
        connection: {
            database: "dbname",
            user: "dbuser",
            password: "dbpassword"
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
