const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const uuidv4 = require("uuid/v4");

module.exports.timestamp = () => Date.now();
module.exports.uuid = () => uuidv4();

module.exports.unlinkFile = filePath => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports.fileExists = filePath => {
    if (!filePath) {
        return Promise.resolve(false);
    }

    return new Promise(resolve => {
        fs.access(filePath, err => resolve(!err));
    });
};

module.exports.renameFile = (from, to) => {
    return new Promise((resolve, reject) => {
        fs.rename(from, to, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports.createDirectory = async dirPath => {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports.createDirectories = async dirPath => {
    if (await module.exports.fileExists(dirPath)) {
        return;
    }

    const dirs = [];
    let current = path.resolve(dirPath);
    let last = undefined;

    while (current && current.length > 0) {
        if (last !== undefined && last === current) {
            // Avoid potential infinite loop
            break;
        }

        if (await module.exports.fileExists(current)) {
            break;
        }

        last = current;
        dirs.push(current);
        current = path.dirname(current);
    }

    for (const dir of dirs.reverse()) {
        await module.exports.createDirectory(dir);
    }
};

module.exports.hashFile = (filePath, algorithm) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        const hash = crypto.createHash(algorithm);

        stream.on("open", () => {
            stream.pipe(hash);
        });

        stream.on("end", () => {
            resolve(hash.digest());
        });

        stream.on("error", err => {
            reject(err);
        });
    });
};

module.exports.mergeObjects = (to, from) => {
    if (Array.isArray(from)) {
        return from;
    }

    if (from === null || typeof from !== "object") {
        return from === undefined ? to : from;
    }

    const toKeys = Object.keys(to === undefined ? {} : to);
    const fromKeys = Object.keys(from === undefined ? {} : from);
    const combinedKeys = new Set(toKeys.concat(fromKeys));

    const m = {};

    for (const p of combinedKeys) {
        if (from[p] === undefined) {
            m[p] = to[p];
        } else if (to[p] === undefined) {
            m[p] = from[p];
        } else {
            m[p] = module.exports.mergeObjects(to[p], from[p]);
        }
    }

    return m;
};
