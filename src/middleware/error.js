const config = require("../config");
const errors = require("../errors");

module.exports = () => (err, req, res, next) => {
    if (res.headersSent) {
        console.error(err.stack);
        next(err);
        return;
    }

    const responseBody = {
        error: {
            message: "An error has occurred.",
            code: 0
        }
    };

    if (err && err instanceof errors.NotFoundError) {
        res.status(404).json();
        //next(err);
        return;
    }

    if (err && err instanceof errors.ValidationError) {
        responseBody.error.message = err.message;
        res.status(401).json(responseBody);
        //next(err);
        return;
    }

    if (err && err.message && config.isDevelopment()) {
        responseBody.error.message = err.message;
    }

    console.error(err.stack);
    res.status(500).json(responseBody);
    //next(err);
};
