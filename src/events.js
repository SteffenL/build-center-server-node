const SequentialQueue = require("./SequentialQueue");
const Mediator = require("./Mediator");

const queue = new SequentialQueue();
const mediator = new Mediator(queue);

module.exports = {
    topics: Object.freeze({
        serverStarted: "serverStarted",
        releasePublished: "releasePublished"
    }),
    bus: mediator
};
