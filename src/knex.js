const config = require("./config");
const knex = require("knex")(config.database)

module.exports = knex;
