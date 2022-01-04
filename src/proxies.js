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
        
        this.proxies = [];

        const test = async i => {
            const proxy = proxies[i];
            if (!proxy) return;

            if (await callback(proxy, i)) this.proxies.push(proxy);
            console.log(filledBar(proxies.length, i + 1));

            await test(i + 1);
        };
        await test(0);
    }

    random() {
        return this.proxies[Math.floor((Math.random() * this.proxies.length))];
    }

}