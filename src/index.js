const path = require('path');
const config = require('../config.json');
const Telegram = require('./telegram');
const Betclic = require('./betclic');
const DB = require('./db');

if (!process.env.TOKEN) {
    require('dotenv').config({
        path: path.join(__dirname, '../.env'),
        encoding: 'utf8',
    });
}

const db = new DB("mongodb://172.17.0.4:27017/ace-opening-bot");
const tg = new Telegram(process.env.TOKEN, config.telegram);
const bt = new Betclic(db);

bt.onOpen(bet => {
    tg.sendNotification(bet);
});

db.onReady(() => bt.watch());
// bt.watch();
// bt.test();