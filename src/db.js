const mongoose = require('mongoose');

module.exports = class DB {

    constructor(mongoUri) {
        console.log("Connecting to Mongo database...");
        mongoose.connect(mongoUri);
        const db = mongoose.connection;

        db.on('error', err => console.error("MongoDB connection error:", err));
        db.on('open', () => {
            console.log("Connected!");
            this.listener?.();
        });
    }

    onReady(listener) {
        this.listener = listener;
    }

    async addBet(name) {
        if (await this.containsBet(name)) return;
        await BetModel.create({ name });
    }

    async containsBet(name) {
        return !!(await BetModel.findOne({ name }).exec())
    }

}

const BetModel = mongoose.model("Bet", {
    name: String
});
