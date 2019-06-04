console.log("Warming up...");

require("./eventSubscriptions")();

const express = require("express");
const errorHandler = require("./middleware/error");
const knex = require("./knex");
const apiKeyAuthorization = require("./middleware/apiKeyAuthorization");
const AccessLevel = require("./AccessLevel");
const apiRouter = require("express-promise-router")();
const publicApiRouter = require("./routes/api/public");
const adminApiRouter = require("./routes/api/admin");
const publicFrontendRouter = require("./routes/frontend/public");
const events = require("./events");

const port = process.env.PORT || 3000;
const server = express();

apiRouter.use(apiKeyAuthorization());
apiRouter.use(async (req, res, next) => {
    req.access = {
        [AccessLevel.ADMIN_READ]: req.apiKey.allow_admin_read,
        [AccessLevel.ADMIN_WRITE]: req.apiKey.allow_admin_write,
        [AccessLevel.READ]: req.apiKey.allow_read
    };
    next();
});

apiRouter.use(publicApiRouter);
apiRouter.use(adminApiRouter);

server.use(express.urlencoded({ extended: true }));
server.use(express.json({ type: "application/json" }));
server.use("/api", apiRouter);
server.use("/", publicFrontendRouter);
server.use(errorHandler());

const startup = async () => {
    await knex.migrate.latest();
    server.listen(port, () => {
        events.bus.publish(events.topics.serverStarted);
    });
};

startup();
