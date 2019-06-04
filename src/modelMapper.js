class ModuleMapper {
    mapReleaseToViewModel(release) {
        const result = {
            version: release.version,
            title: release.title,
            description: release.description,
            commit: release.commit,
            prerelease: !!release.prerelease
        };

        if (release.assets) {
            result.assets = this.mapAssetsToViewModels(release.assets);
        };

        return result;
    }

    mapReleasesToViewModels(releases) {
        return releases.map(release => this.mapReleaseToViewModel(release));
    }

    mapAssetToViewModel(asset) {
        const result = {
            name: asset.name,
            size: asset.size,
            // TODO: url for download
        };

        if (asset.digests) {
            result.digests = this.mapAssetDigestsToViewModel(asset.digests);
        }

        return result;
    }

    mapAssetsToViewModels(assets) {
        return assets.map(asset => this.mapAssetToViewModel(asset));
    }

    mapAssetDigestsToViewModel(digests) {
        const result = {};

        for (const digest of digests) {
            result[digest.algorithm] = Buffer.from(digest.value).toString("hex");
        }

        return result;
    }
}

module.exports = new ModuleMapper();
