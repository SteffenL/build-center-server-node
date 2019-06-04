class Mediator {
    constructor(queue) {
        this.topics = {};
        this.queue = queue;
    }

    subscribe(topic, callback) {
        let callbacks = this.topics[topic];
        if (!callbacks) {
            callbacks = this.topics[topic] = [];
        }

        if (callbacks.indexOf(callback) !== -1) {
            throw new Error("Callback already registered");
        }

        this.topics[topic].push(callback);
    }

    remove(topic, callback) {
        this.topics[topic].delete(callback);
    }

    publish(topic, ...args) {
        const callbacks = this.topics[topic];
        if (!callbacks || callbacks.length === 0) {
            return;
        }

        for (const cb of callbacks) {
            this.queue.push(() => cb(...args));
        }
    }
}

module.exports = Mediator;
