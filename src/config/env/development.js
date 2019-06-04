module.exports = {
    database: {
        client: 'sqlite3',
        connection: {
            filename: './dev.sqlite3'
        },
        pool: {
            afterCreate(conn, done) {
                conn.run("PRAGMA foreign_keys = ON;", err => {
                    done(err, conn);
                });
            }
        }
    }
};
