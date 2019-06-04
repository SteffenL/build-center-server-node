class Version {
    constructor(major, minor, patch, prereleaseLabel, prereleaseVersion, buildMetadata) {
        this.major = major === undefined ? 0 : major;
        this.minor = minor === undefined ? 0 : minor;
        this.patch = patch === undefined ? 0 : patch;
        this.prereleaseLabel = prereleaseLabel === undefined ? undefined : prereleaseLabel;
        this.prereleaseVersion = prereleaseVersion === undefined ? undefined : prereleaseVersion;
        this.buildMetadata = buildMetadata === undefined ? undefined : buildMetadata;
    }

    compare(that) {
        const majorDiff = this.major - that.major;
        const minorDiff = this.minor - that.minor;
        const patchDiff = this.patch - that.patch;

        if (majorDiff !== 0) {
            return majorDiff;
        }

        if (minorDiff !== 0) {
            return minorDiff;
        }

        if (patchDiff !== 0) {
            return patchDiff;
        }

        if (this.isPrerelease() !== that.isPrerelease()) {
            return this.isPrerelease() > that.isPrerelease() ? -1 : 1;
        }

        if (this.prereleaseLabel !== that.prereleaseLabel) {
            const a = this.prereleaseLabel === undefined ? "" : this.prereleaseLabel;
            const b = that.prereleaseLabel === undefined ? "" : that.prereleaseLabel;
            return a < b ? -1 : 1;
        }

        if (this.prereleaseVersion !== that.prereleaseVersion) {
            const a = this.prereleaseVersion === undefined ? 0 : this.prereleaseVersion;
            const b = that.prereleaseVersion === undefined ? 0 : that.prereleaseVersion;
            return a - b;
        }

        return 0;
    }

    isPrerelease() {
        return this.prereleaseLabel !== undefined || this.prereleaseVersion !== undefined;
    }

    normalize() {
        return this.print();
    }

    print(withBuildMetadata) {
        let result = [this.major, this.minor, this.patch].join(".");

        if (this.prereleaseLabel !== undefined) {
            result += "-" + this.prereleaseLabel;
        }

        if (this.prereleaseVersion !== undefined) {
            result += "." + this.prereleaseVersion;
        }

        if (this.buildMetadata !== undefined && withBuildMetadata) {
            result += "+" + this.buildMetadata;
        }

        return result;
    }

    pack() {
        // 10 bits per component
        return (this.major & 0x3ff) << 20
            | (this.minor & 0x3ff) << 10
            | (this.patch & 0x3ff);
    }

    isNewerThan(that) {
        return this.compare(that) > 0;
    }

    static normalize(version) {
        return (typeof version === "string" ? Version.parse(version) : version).normalize();
    }

    static compare(first, second) {
        first = typeof first === "string" ? Version.parse(first) : first;
        second = typeof second === "string" ? Version.parse(second) : second;
        return first ? first.compare(second) : second.compare(first) * -1;
    }

    static parse(versionString) {
        const versionPattern = /^(\d+(?:\.\d+){0,2})(?:-([\da-z\d.]+))?(?:\+([\da-z\d.]+))?$/;
        const match = versionPattern.exec(versionString);
        if (!match) {
            throw new Error("Invalid version format");
        }

        const version = match[1] || "";

        let [major, minor, patch] = version.split(".").map(n => parseInt(n));
        major = Number.isInteger(major) ? major : 0;
        minor = Number.isInteger(minor) ? minor : 0;
        patch = Number.isInteger(patch) ? patch : 0;

        const prereleaseLabel = match[2] || undefined;
        let prereleaseVersion = parseInt(match[3]);
        prereleaseVersion = Number.isInteger(prereleaseVersion) ? prereleaseVersion : undefined;

        const buildMetadata = match[3] || undefined;

        return new Version(major, minor, patch, prereleaseLabel, prereleaseVersion, buildMetadata);
    }

    static unpack(version) {
        // 10 bits per component
        return {
            major: (version >> 20) & 0x3ff,
            minor: (version >> 10) & 0x3ff,
            patch: version & 0x3ff
        };
    }
}

module.exports = Version;
