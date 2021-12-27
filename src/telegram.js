const { Axios } = require('axios');

class Telegram {

    /**
     * 
     * @param {string} token 
     * @param {TelegramConfig} config 
     */
    constructor(token, config) {
        this.axios = new Axios({
            baseURL: `https://api.telegram.org/bot${token}`,
            transformResponse: [ data => JSON.parse(data) ],
            transformRequest: [ data => JSON.stringify(data) ],
        });

        this.chat_id = config.chat_id;
        this.notification_template = config.notification_template;
    }

    /**
     * @param {string} player1 
     * @param {string} player2 
     * @param {string} tournament 
     * @returns {Promise<MessageResult>}
     */
    async sendNotification(player1, player2, tournament) {
        let notif = this.notification_template
            .join('\n')
            .replace(/\{player1\}/g, player1)
            .replace(/\{player2\}/g, player2)
            .replace(/\{tournament}/g, tournament);

    
        let res;
        try {
            res = await this.axios.get('/sendMessage', {
                params: {
                    chat_id: this.chat_id,
                    text: notif,
                }
            });
        } catch (e) {
            throw new Error("Unable to send message: " + e.message);
        }

        if (!res.data.ok) {
            throw new Error("Unable to send message, Error " + res.data.error_code + ": " + res.data.description);
        }

        return res.data.result;
    }

}

/**
 * @typedef TelegramConfig
 * @type {object}
 * @property {string} chat_id
 * @property {string[]} notification_template
 */

/**
 * @typedef MessageResult
 * @type {object}
 * @property {number} message_id
 * @property {date} message_id
 * @property {string} text
 * @property {Chat} sender_chat
 * @property {Chat} chat
 */

/**
 * @typedef Chat
 * @type {object}
 * @property {number} id
 * @property {string} title
 * @property {string} type
 */