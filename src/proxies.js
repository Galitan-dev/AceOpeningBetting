const proxylist = require('proxylist');

module.exports = class Proxylist {
    
    /**
     * @param {({ host: string, port: number }) => Promise<boolean>} callback 
     */
    async filter(callback) {
        /** @type {string[]} */
        let proxies = await proxylist.main();
            proxies.push(...(await proxylist.first()));
            proxies.push(...(await proxylist.second()));
            proxies = proxies.filter(p => p.match(/(\d+\.){3}\d+:\d+/));
            proxies = proxies.map(p => ({ host: p.host, port: p.port }));
            proxies = await Promise.all(proxies.map(async p => await callback(p) ? p : null));
            proxies = proxies.filter(p => !!p);

        this.proxies = proxies;
    }

    random() {
        return this.proxies[Math.floor((Math.random() * this.proxies.length))];
    }

}