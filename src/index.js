const path = require('path');
const config = require('../config.json');
const Telegram = require('./telegram');

if (!process.env.TOKEN) {
    require('dotenv').config({
        path: path.join(__dirname, '.env'),
        encoding: 'utf8',
    });
}

const tg = new Telegram(process.env.TOKEN, config.telegram);

(async () => {
    setInterval(() => {
        tg.sendNotification(pickPlayer(), pickPlayer(), "Roland-Garros");
    }, 5000);
})();

function pickPlayer() {
    const random = Math.floor(Math.random() * config.players.length);
    return config.players[random];
}