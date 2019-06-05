const db = require("./db");
const config = require("./config");
const events = require("./events");
const webhook = require("./webhook");

function makeDownloadUrl(app, release, asset) {
    return `${config.server.endpoint.front}/download/${app.name}/${release.version}/${asset.name}`;
}

module.exports = () => {
    events.bus.subscribe(events.topics.serverStarted, async () => {
        console.log("Server started.");
    });

    events.bus.subscribe(events.topics.releasePublished, async id => {
        const release = await db.getReleaseById(id);
        const app = await db.getAppById(release.application_id);
        const assets = await db.getAssetsForRelease(release);

        await Promise.all(assets.map(async asset =>  {
            asset.digests = await db.getDigestsForAsset(asset);
            asset.downloadUrl = makeDownloadUrl(app, release, asset);
        }));

        const description = release.prerelease
            ? `A new experimental release is a available.`
            : `A new stable release is available.`;
        const fields = [];

        if (assets.length > 0) {
            const downloadsText = assets.map(asset => {
                return `[${asset.name}](${asset.downloadUrl})`;
            }).join("\n");

            fields.push({
                name: "Downloads",
                value: downloadsText
            });
        }

        // TODO: Include commit?
        /*fields.push({
            name: "Commit",
            value: "`" + release.commit + "`"
        });*/

        const embed = {
            title: `${app.title} ${release.version}`,
            description,
            fields
        };

        const webhookConfig = release.prerelease
            ? config.webhook.releases.testing
            : config.webhook.releases.stable;

        if (!webhookConfig.enabled) {
            return;
        }

        console.log(`Sending release notification for ${app.name}/${release.version} via webhook...`);

        await webhook.send({
            embeds: [embed]
        }, webhookConfig.url);
    });
};
