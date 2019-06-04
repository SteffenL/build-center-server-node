const path = require("path");
const fs = require("fs");
const util = require("../util");

function loadUserConfig() {
    const userConfigPath = path.join(process.cwd(), "config.js");
    let userConfig = null;

    if (fs.statSync(userConfigPath).isFile()) {
        const modulePath = path.join(path.dirname(userConfigPath), path.basename(userConfigPath));
        userConfig = require(modulePath);
    }

    return userConfig;
}

const Environment = Object.freeze({
    DEVELOPMENT: "development",
    STAGING: "staging",
    PRODUCTION: "production"
});

const nodeEnv = process.env.NODE_ENV || "development";
const environment = nodeEnv
    ? Environment[nodeEnv.toUpperCase()]
    : Environment.DEVELOPMENT;

const defaultConfig = require("./default");
const envConfig = require(`./env/${nodeEnv}`);
const userConfig = loadUserConfig();

let merged = util.mergeObjects(defaultConfig, envConfig);

if (userConfig) {
    merged = util.mergeObjects(merged, userConfig);
}

merged = Object.assign(merged, {
    Environment,
    environment,
    isDevelopment: () => environment === Environment.DEVELOPMENT
});

module.exports = merged;
