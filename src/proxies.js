const proxylist = require('proxylist');
const progressbar = require('string-progressbar');

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
        
        this.proxies = [];
        const progress = require('progressbar')
            .create()
            .step('Filtering Proxies')
            .setTotal(proxies.length);

        await Promise.all(proxies.map(async (p, i) => {
            if (await callback(p, i)) this.proxies.push(p);
            progress.addTick();
            console.log(...progressbar.filledBar(progress.addTotal, progress.getTick()));
        }));

        progress.finish();
    }

    random() {
        return this.proxies[Math.floor((Math.random() * this.proxies.length))];
    }

}