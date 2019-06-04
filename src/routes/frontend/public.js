const router = require("express-promise-router")();
const errors = require("../../errors");
const db = require("../../db");
const path = require("path");
const config = require("../../config");
const util = require("../../util");

router.get("/download/:app/:version/:filename", async (req, res) => {
    const release = await db.getRelease(req.params.app, req.params.version, false, true);
    if (!release) {
        throw new errors.NotFoundError();
    }

    const asset = await db.getAssetForRelease(release, req.params.filename);
    if (!asset) {
        throw new errors.NotFoundError();
    }

    const filePath = path.join(config.uploads.assets, asset.uuid);
    if (!(await util.fileExists(filePath))) {
        console.error(`File for release asset is missing: ${filePath}`);
        throw new errors.NotFoundError();
    }

    res.sendFile(filePath);
});

module.exports = router;
