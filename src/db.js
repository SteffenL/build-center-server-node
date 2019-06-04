const knex = require("./knex");
const Version = require("./Version");

const _getReleases = `
select r.id, r.version, r.title, r.description, r.\`commit\`, r.prerelease, r.application_id, r.draft, r.created_at, r.build_metadata
from \`release\` r
left join application a on a.id = r.application_id
where a.name = :appName and :prereleaseClause and :draftClause
order by r.packed_version desc, r.prerelease_label desc, r.prerelease_version desc, r.created_at desc
`;

const _getReleaseById = `
select r.id, r.version, r.title, r.description, r.\`commit\`, r.prerelease, r.application_id, r.draft, r.created_at, r.build_metadata
from \`release\` r
left join application a on a.id = r.application_id
where r.id = :id
limit 1
`;

const _getRelease = `
select r.id, r.uuid, r.version, r.title, r.description, r.\`commit\`, r.prerelease, r.application_id, r.draft, r.created_at, r.build_metadata
from \`release\` r
left join application a on a.id = r.application_id
where a.name = :appName and r.normalized_version = :normalizedVersion and :draftClause and :buildMetadataClause
order by r.packed_version desc, r.prerelease_label desc, r.prerelease_version desc, r.created_at desc
limit 1
`;

const _getLatestRelease = `
select r.id, r.uuid, r.version, r.title, r.description, r.\`commit\`, r.prerelease, r.application_id, r.draft, r.created_at, r.build_metadata
from \`release\` r
left join application a on a.id = r.application_id
where a.name = :appName and prerelease = :prerelease and :draftClause
order by r.packed_version desc, r.prerelease_label desc, r.prerelease_version desc, r.created_at desc
limit 1
`;

const _getDigestsForAsset = `
select id, algorithm, value
from asset_digest
where asset_id = :assetId
order by algorithm
`;

const _getAssetForRelease = `
select id, uuid, name, size
from asset
where release_id = :releaseId and name = :assetName
limit 1
`;

const _getAssetsForRelease = `
select id, uuid, name, size
from asset
where release_id = :releaseId
order by name
`;

const _getAppById = `
select id, uuid, name, title, description
from application
where id = :id
limit 1
`;

const _getApp = `
select id, uuid, name, title, description
from application
where name = :name
limit 1
`;

const _getApiKey = `
select id, value, enabled, allow_admin_read, allow_admin_write, allow_read
from api_key
where value = :value and enabled = 1
limit 1
`;

async function raw(sql, bindings) {
    const q = knex.raw(sql, bindings);
    //console.log(`SQL: ${q.toString().trim().replace(/[\r\n]/g, " ")}`);
    return await q;
}

async function all(sql, bindings) {
    const f = (from, previous) => {
        if (Array.isArray(from)) {
            return f(from[0], from);
        }

        return previous.map(o => Object.assign({}, o));
    };

    return f(await raw(sql, bindings));
}

async function one(sql, bindings) {
    const f = from => {
        if (Array.isArray(from)) {
            return f(from[0]);
        }

        return typeof from === "object" ? Object.assign({}, from) : from;
    };

    return f(await raw(sql, bindings));
}

module.exports = {
    async getReleases(appName, prerelease, includeDrafts) {
        const prereleaseClause = prerelease ? knex.raw("1") : knex.raw("prerelease = false");
        const draftClause = includeDrafts ? knex.raw("1") : knex.raw("draft = 0");
        return await all(_getReleases, { appName, prereleaseClause, draftClause });
    },

    async getReleaseById(id, includeDrafts) {
        const draftClause = includeDrafts ? knex.raw("1") : knex.raw("draft = 0");
        return await one(_getReleaseById, { id, draftClause });
    },

    async getRelease(appName, version, includeDrafts, compareBuildMetadata) {
        compareBuildMetadata = true;
        const v = Version.parse(version);
        const normalizedVersion = v.normalize();
        const draftClause = includeDrafts ? knex.raw("1") : knex.raw("draft = 0");
        const buildMetadataClause = compareBuildMetadata && v.buildMetadata !== undefined
            ? knex.raw("r.build_metadata = :buildMetadata", { buildMetadata: v.buildMetadata })
            : knex.raw("1");
        return await one(_getRelease, { appName, normalizedVersion, draftClause, buildMetadataClause });
    },

    async getLatestRelease(appName, prerelease, includeDrafts) {
        const draftClause = includeDrafts ? knex.raw("1") : knex.raw("draft = 0");
        return await one(_getLatestRelease, { appName, prerelease, draftClause });
    },

    async getDigestsForAsset(asset) {
        const assetId = asset.id || asset;
        return await all(_getDigestsForAsset, { assetId });
    },

    async getAssetsForRelease(release) {
        const releaseId = release.id || release;
        return await all(_getAssetsForRelease, { releaseId });
    },

    async getAssetForRelease(release, assetName) {
        const releaseId = release.id || release;
        return await one(_getAssetForRelease, { releaseId, assetName });
    },

    async getAppById(id) {
        return await one(_getAppById, { id });
    },

    async getApp(name) {
        return await one(_getApp, { name });
    },

    async getApiKey(value) {
        return await one(_getApiKey, { value });
    },
};
