const { EventEmitter } = require('events');
const { Axios } = require('axios');
const fs = require('fs');
const DB = require('./db')
const path = require('path');

module.exports = class {

    /**
     * @param {DB} db 
     */
    constructor(db) {
        this.db = db;
        this.events = new EventEmitter();
        this.axios = new Axios({
            baseURL: "https://www.betclic.fr/",
        });
    }

    async watch() {
        this.fetchBets();
        setInterval(this.fetchBets.bind(this), 15000);
    }

    async test() {
        const bet = new Bet("/tennis-s2/atp-cup-c26395/f-delbonis-a-metreveli-m3001123032", this);
        await bet.fetchInfos();
        console.log(bet);
    }

    async fetchBets() {
        let res;
        try {
            res = await this.axios.get("/tennis-s2");
        } catch (err) {
            throw new Error("Unable to fetch bets: " + err.message);
        }

        if (res.status != 200) {
            return console.error("Error", res.status + ":", res.statusText);
        }
        
        const bets = await Promise.all(res.data.match(/"\/tennis\-s2.+\/.+"/gi)
            ?.map(async url => {

                let bet = new Bet(url.substring(1, url.length - 1), this);
                if (await this.db.containsBet(bet.name)) return;

                await bet.fetchInfos();
                if (bet.isAceOpen) {
                    await this.db.addBet(bet.name);
                    this.emitOpen(bet);
                }

                return bet;
            }) || []);

        return bets;
    }

    /**
     * @param {(bet: Bet) => void} listener 
     */
    onOpen(listener) {
        this.events.addListener("bet", listener);
    }

    /**
     * @param {Bet} bet 
     */
    emitOpen(bet) {
        this.events.emit("bet", bet);
    }

}

class Bet {

    constructor(url, betclic) {
        this.url = url;
        this.name = url.match(/[^\/]+$/i)[0];
        this.betclic = betclic;
    }

    async fetchInfos() {
        let res;
        try {
            res = await this.betclic.axios.get(this.url);
        } catch (err) {
            throw new Error("Unable to fetch bet: " + err.message);
        }

        this.isAceOpen = !!res.data.match(/Aces/);

        if (!this.isAceOpen) return;

        const players = res.data.match(/<div class="scoreboard_contestantLabel">[\n<!-> ]*.*[\n ]*<\/div>/gmi);
        this.player1 = players[0].split("\n").slice(1).join("\n").match(/[^ ]+ [^\n ]+/gi)?.[0];
        this.player2 = players[1].split("\n").slice(1).join("\n").match(/[^ ]+ [^\n ]+/gi)?.[0];
        this.tournament = res.data.match(/<span class="marquee_content">[\n<!-> ]*.*[\n ]*<\/span>/mi)?.[0]
            .split("\n").slice(1).join("\n").match(/[^ ].*[^\n ]/gi)?.[0];
    }

}
