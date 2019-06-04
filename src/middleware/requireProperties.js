const errors = require("../errors");

module.exports = (propertyOfProject, properties) => (req, res, next) => {
    const obj = req[propertyOfProject];
    if (!obj) {
        return next(new errors.ValidationError("One or more parameters are required."));
    }

    properties = properties || [];
    for (const p of properties) {
        if (!obj.hasOwnProperty(p)) {
            return next(new errors.ValidationError(`Parameter "${p}" is required.`));
        }
    }

    next();
};
