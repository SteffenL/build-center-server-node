class SequentialQueue {
    constructor() {
        this.started = false;
        this.items = [];
    }

    push(callback) {
        this.items.push(callback);

        if (this.started) {
            return;
        }

        this.started = true;

        const next = async () => {
            if (this.items.length === 0) {
                this.started = false;
                return;
            }

            const item = await Promise.resolve(this.items.shift());
            await Promise.resolve(item());

            setTimeout(next, 0);
        };
        next();
    }
}

module.exports = SequentialQueue;
