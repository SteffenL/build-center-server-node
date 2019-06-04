const router = require("express-promise-router")();
const db = require("../../db");
const errors = require("../../errors");
const Version = require("../../Version");
const modelMapper = require("../../modelMapper.js");
const requireAccess = require("../../middleware/requireAccess");
const AccessLevel = require("../../AccessLevel");

router.use(requireAccess(AccessLevel.READ));

router.get("/release/:app", async (req, res) => {
    let releases = await db.getReleases(req.params.app, parseInt(req.query.edge));
    releases = releases.sort((a, b) => Version.compare(a.version, b.version) * -1);

    if (releases.length === 0) {
        throw new errors.NotFoundError();
    }

    res.json(modelMapper.mapReleasesToViewModels(releases));
});

router.get("/release/:app/:version", async (req, res) => {
    const getLatest = async () => {
        const stable = await db.getLatestRelease(req.params.app, false, true);
        const pre = await db.getLatestRelease(req.params.app, true, true);
        let latest = stable;

        if (pre && parseInt(req.query.edge) && Version.compare(pre.version, stable.version) > 0) {
            latest =  pre;
        }

        return latest;
    };

    const getSpecific = async () => {
        return await db.getRelease(req.params.app, req.params.version, false, true);
    };

    const getRelease = req.params.version === "latest" ? getLatest : getSpecific;
    const release = await getRelease();

    if (!release) {
        throw new errors.NotFoundError();
    }

    const include = (req.query.include || "").split(",");

    if (include.includes("asset")) {
        const assets = await db.getAssetsForRelease(release);

        if (include.includes("digest")) {
            await Promise.all(assets.map(async asset => {
                asset.digests = await db.getDigestsForAsset(asset);
            }));
        }

        release.assets = assets;
    }

    res.json(modelMapper.mapReleaseToViewModel(release));
});

module.exports = router;
