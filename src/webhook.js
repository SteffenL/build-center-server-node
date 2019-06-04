const request = require("request");
const limiter = require("limiter");
const util = require("./util");

const rateLimiter = new limiter.RateLimiter(2, 1000);

module.exports.send = (embedObject, webhookUrl) => {
    return new Promise((resolve, reject) => {
        const webhookData = embedObject;

        const options = {
            url: webhookUrl,
            method: "post",
            body: webhookData,
            json: true
        };

        const uuid = util.uuid();
        console.log(`Outgoing webhook (${uuid}):`, webhookData)

        rateLimiter.removeTokens(1, () => {
            request(options, (err, res, body) => {
                if (err) {
                    console.error(`Error while sending webhook (${uuid}): ${err}`);
                    reject(err);
                    return;
                }

                console.log(`Webhook response (${uuid}):`, body);
                resolve(body);
            });
        });
    });
};
