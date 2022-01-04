const proxylist = require('proxylist');
const { filledBar } = require('string-progressbar');

module.exports = class Proxylist {
    
    /**
     * @param {(proxy: { host: string, port: number }, index: number) => Promise<boolean>} callback 
     */
    async filter(callback) {
        /** @type {string[]} */
        let proxies = await proxylist.main();
            // proxies.push(...(await proxylist.first()));
            // proxies.push(...(await proxylist.second()));
            proxies = proxies.filter(p => p.match(/(\d+\.){3}\d+:\d+/));
            proxies = proxies.map(p => ({ host: p.split(':')[0], port: p.split(':')[1] }));
            proxies = proxies.slice(0, 3);

        proxies = [
            { host: '54.37.160.93', port: 1080 },
            { host: '185.128.25.22', port: 8118 },
            { host: '212.129.15.88', port: 8080 },
            { host: '62.210.53.34', port: 3128 },
            { host: '51.158.160.195', port: 8118 },
            { host: '62.4.16.243', port: 3128 },
        ]
        
        this.proxies = [];

        const test = async i => {
            const proxy = proxies[i];
            if (!proxy) return;

            if (await callback(proxy, i)) this.proxies.push(proxy);
            console.log(...filledBar(proxies.length, i + 1).map((s, i) => i == 0 ? s : Math.floor(parseFloat(s)) + "%"));

            await test(i + 1);
        };
        await test(0);
    }

    random() {
        return this.proxies[Math.floor((Math.random() * this.proxies.length))];
    }

}