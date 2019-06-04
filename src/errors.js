class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    NotFoundError,
    ValidationError
};
