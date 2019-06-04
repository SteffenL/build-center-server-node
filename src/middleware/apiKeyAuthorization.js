const db = require("../db");

module.exports = () => async (req, res, next) => {
    try {
        const apiKeyValue = req.headers.authorization;
        if (!apiKeyValue) {
            res.status(401).json({
                error: {
                    message: "API key is required.",
                    code: 0
                }
            });
            return;
        }

        const apiKey = await db.getApiKey(apiKeyValue);
        if (!apiKey || !apiKey.enabled) {
            res.status(401).json({
                error: {
                    message: "Invalid API key.",
                    code: 0
                }
            });
            return;
        }

        req.apiKey = apiKey;

        next();
    } catch (error) {
        next(error);
    }
};
