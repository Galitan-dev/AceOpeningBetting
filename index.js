const { TelegramBaseController, TextCommand, Telegram } = require('telegram-node-bot');

const tg = new Telegram(process.env.TOKEN);

class PingController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    pingHandler($) {
        $.sendMessage('pong')
    }

    get routes() {
        return {
            'pingCommand': 'pingHandler'
        }
    }
}

tg.router.when(
    new TextCommand('ping', 'pingCommand'),
    new PingController()
)