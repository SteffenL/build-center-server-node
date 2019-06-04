const path = require("path");
const os = require("os");

module.exports = {
    server: {
        port: 3000,
        endpoint: {
            front: null,
            api: null
        }
    },
    uploads: {
        //temp: os.tmpdir(),
        temp: path.join(process.cwd(), "uploads/temp"),
        assets: path.join(process.cwd(), "uploads/assets")
    },
    database: {},
    webhook: {
        releases: {
            stable: {
                enabled: false,
                url: null
            },
            testing: {
                enabled: false,
                url: null
            }
        }
    }
};
