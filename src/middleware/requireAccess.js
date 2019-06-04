module.exports = accessLevel => async (req, res, next) => {
    if (!req.access || !req.access[accessLevel]) {
        res.status(403).json({ error: { message: "Access denied.", code: 0 } });
        return;
    }

    next();
};
