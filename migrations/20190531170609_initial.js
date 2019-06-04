
exports.up = knex => knex.schema
    .createTable("api_key", table => {
        table.increments("id").unsigned();
        table.string("value").notNull().unique();
        table.boolean("enabled").notNull();
        table.boolean("allow_admin_read").notNull();
        table.boolean("allow_admin_write").notNull();
        table.boolean("allow_read").notNull();
    })
    .createTable("application", table => {
        table.increments("id").unsigned();
        table.string("uuid").notNull().unique();
        table.string("name").notNull().unique();
        table.string("title").notNull().unique();
        table.string("description");
        table.bigInteger("created_at").unsigned().notNull().index();
    })
    .createTable("release", table => {
        table.increments("id").unsigned();
        table.string("uuid").notNull().unique();
        table.string("version").notNull().index(); // x.x.x
        table.string("normalized_version").notNull().index();
        table.integer("packed_version").unsigned().notNull().index(); // sortable version
        table.string("prerelease_label").index();
        table.integer("prerelease_version").unsigned().index();
        table.string("build_metadata").index();;
        table.string("commit").index();
        table.string("title").notNull();
        table.string("description");
        table.boolean("prerelease").notNull().index();
        table.boolean("draft").notNull().index();
        table.bigInteger("created_at").unsigned().notNull().index();
        table.integer("application_id").unsigned().notNull();
        table.foreign("application_id").references("id").inTable("application").onDelete("CASCADE");
        //table.unique(["normalized_version", "application_id"]);
        table.unique(["title", "application_id"]);
    })
    .createTable("asset", table => {
        table.increments("id").unsigned();
        table.string("uuid").notNull().unique();
        table.string("name").notNull();
        table.string("size").notNull();
        table.bigInteger("created_at").unsigned().notNull().index();
        table.integer("release_id").unsigned().notNull();
        table.foreign("release_id").references("id").inTable("release").onDelete("CASCADE");
        table.unique(["name", "release_id"]);
    })
    .createTable("asset_digest", table => {
        table.increments("id").unsigned();
        table.string("algorithm").notNull().index();
        table.binary("value", 255).notNull().index();
        table.integer("asset_id").unsigned().notNull();
        table.foreign("asset_id").references("id").inTable("asset").onDelete("CASCADE");
    });

exports.down = knex => knex.schema
    .dropTable("asset_digest")
    .dropTable("asset")
    .dropTable("release")
    .dropTable("application")
    .dropTable("api_key");
