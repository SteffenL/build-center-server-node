const multer = require("multer");
const path = require("path");
const router = require("express-promise-router")();
const knex = require("../../knex");
const requireProperties = require("../../middleware/requireProperties");
const requireAccess = require("../../middleware/requireAccess");
const AccessLevel = require("../../AccessLevel");
const db = require("../../db");
const Version = require("../../Version");
const util = require("../../util");
const errors = require("../../errors");
const events = require("../../events");
const config = require("../../config");

const upload = multer({ dest: config.uploads.temp });

function addCreateOrUpdateReleaseProperties(to, from) {
    if (from.version !== undefined) {
        const parsedVersion = Version.parse(from.version);

        to.version = from.version;
        to.normalized_version = parsedVersion.print();
        to.packed_version = parsedVersion.pack();

        if (parsedVersion.prereleaseLabel !== undefined) {
            to.prerelease_label = parsedVersion.prereleaseLabel;
        }

        if (parsedVersion.prereleaseVersion !== undefined) {
            to.prerelease_version = parsedVersion.prereleaseVersion;
        }

        if (parsedVersion.buildMetadata !==  undefined) {
            to.build_metadata = parsedVersion.buildMetadata;
        }

        to.prerelease = parsedVersion.isPrerelease();
    }

    if (from.title !== undefined) {
        to.title = from.title;
    }

    if (from.description !== undefined) {
        to.description = from.description;
    }

    if (from.commit !== undefined) {
        to.commit = from.commit;
    }
}

function addCreateReleaseProperties(to, from) {
    addCreateOrUpdateReleaseProperties(to, from);
    to.draft = from.draft === undefined ? true : !!from.draft;
}

function addUpdateReleaseProperties(to, from) {
    addCreateOrUpdateReleaseProperties(to, from);
    if (from.draft !== undefined) {
        to.draft = !!from.draft;
    }
}

router.use(requireAccess(AccessLevel.ADMIN_READ));
router.use(requireAccess(AccessLevel.ADMIN_WRITE));

router.post("/app", requireProperties("body", ["name", "title", "description"]), async (req, res) => {
    const data = {
        uuid: util.uuid(),
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        created_at: util.timestamp()
    };
    await knex("application").insert(data);
    res.json();
});

router.post("/release/:app", requireProperties("body", ["version", "title"]), async (req, res) => {
    const app = await db.getApp(req.params.app);
    if (!app) {
        throw new errors.NotFoundError();
    }

    const data = {
        uuid: util.uuid(),
        created_at: util.timestamp(),
        application_id: app.id
    };

    addCreateReleaseProperties(data, req.body);
    const id = (await knex("release").insert(data))[0];

    if (!data.draft) {
        events.bus.publish(events.topics.releasePublished, id);
    }

    res.json();
});

router.put("/release/:app/:version", requireProperties("body"), async (req, res) => {
    const release = await db.getRelease(req.params.app, req.params.version, true, true);

    if (!release) {
        throw new errors.NotFoundError();
    }

    const data = {};

    addUpdateReleaseProperties(data, req.body);

    if (Object.getOwnPropertyNames(data).length == 0) {
        return res.json();
    }

    await knex("release")
        .update(data)
        .where({ id: release.id });

    // TODO: Publish only if the update affected rows
    if (release.draft && !data.draft) {
        events.bus.publish(events.topics.releasePublished, release.id);
    }

    res.json();
});

router.post("/release/:app/:version/asset", async (req, res) => {
    const digestAlgorithm = "sha256";
    const release = await db.getRelease(req.params.app, req.params.version, true, true);
    if (!release) {
        throw new errors.NotFoundError();
    }

    let tempFilePath = null;
    try {
        await new Promise((resolve, reject) => {
            upload.single("asset")(req, res, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        tempFilePath = req.file.path;
        const uuid = util.uuid();
        const digest = await util.hashFile(tempFilePath, digestAlgorithm, "binary");
        const newFilePath = path.join(config.uploads.assets, uuid);

        await util.createDirectories(path.dirname(newFilePath));

        await knex.transaction(async trx => {
            const asset = {
                uuid: uuid,
                name: req.file.originalname,
                size: req.file.size,
                release_id: release.id,
                created_at: util.timestamp()
            };
            const [assetId] = await trx.insert(asset).into("asset");
            const assetDigest = {
                algorithm: digestAlgorithm,
                value: digest,
                asset_id: assetId
            };
            await trx.insert(assetDigest).into("asset_digest");
        });

        await util.renameFile(tempFilePath, newFilePath);
    } finally {
        if (await util.fileExists(tempFilePath)) {
            await util.unlinkFile(tempFilePath);
        }
    }

    res.json();
});

module.exports = router;
