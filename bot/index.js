const {WechatyBuilder} = require('wechaty')
const {WechatyWebPanelPlugin} = require('wechaty-web-panel')
const {PuppetEngine} = require('wechaty-puppet-engine');

const name = 'wechat-assistant-engine';
let bot = ''
console.log('使用puppet-engine协议启动，默认使用大恩wxhook，请在windows 环境下使用')

function startBot({apiKey, apiSecret, hookPort = 8089, serverPort = 8055}) {
    bot = WechatyBuilder.build({
        name,
        puppet: new PuppetEngine({
            port: hookPort,
            httpServer: `http://localhost:${serverPort}`,
            runLocal: true
        })
    });

    bot.use(WechatyWebPanelPlugin({
        apiKey: apiKey, apiSecret: apiSecret,
    }))
    bot.start()
        .catch((e) => console.error(e));
}

function stopBot() {
    bot.stop();
    bot = null;
}
module.exports = {
    startBot,
    stopBot
}
