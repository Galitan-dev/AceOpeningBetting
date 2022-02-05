const { EventEmitter } = require('events');
const { Axios } = require('axios');
const DB = require('./db');
const ProxyList = require('./proxies');
const HttpsProxyAgent = require('https-proxy-agent')

module.exports = class {

    /**
     * @param {DB} db 
     */
    constructor(db) {
        this.db = db;
        this.events = new EventEmitter()
        this.axios = new Axios({
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    }

    async watch() {
        const proxyList = new ProxyList();
        // await proxyList.filter(async (proxy, index) => {
        //     let res;
        //     try {
        //         res = await this.axios.get("/tennis-s2", {
        //             httpsAgent: new HttpsProxyAgent(`https://${proxy.host}:${proxy.port}`),
        //         });
        //     } catch (err) {
        //         return false;
        //     }

        //     if (res.status != 200) {
        //         return false;
        //     }

        //     return true;
        // });
        
        this.fetchBets(proxyList);
        setInterval(this.fetchBets.bind(this, proxyList), 3000);// / (proxyList.proxies.length - 1));
    }

    async test() {
        const bet = new Bet("/tennis-s2/atp-cup-c26395/f-delbonis-a-metreveli-m3001123032", this);
        await bet.fetchInfos();
        console.log(bet);
    }

    async fetchBets(proxies) {
        let res;
        try {
            res = await this.axios.get("https://offer.cdn.betclic.fr/api/pub/v4/events?application=2&countrycode=fr&hasSwitchMtc=true&language=fr&limit=20&offset=0&sitecode=frfr&sortBy=ByLiveRankingPreliveDate&sportIds=2");
        } catch (err) {
            throw new Error("Unable to fetch bets: " + err.message);
        }

        if (res.status != 200) {
            return console.error("Error", res.status + ":", res.statusText);
        }

        let data;
        try {
            data = JSON.parse(res.data);
        } catch(err) {
            return console.error("Error parsing response (Maybe we have been banned?)");
        }

        console.log(data);
        
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
    
    async fetchInfos(proxy) {
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

module.exports.Bet = Bet; 
