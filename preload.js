/**
 * 暴漏内部方法给前端页面
 */
const {ipcRenderer, shell} = require('electron')
const fs = require("fs")

async function startBot({ apiKey, apiSecret, hookPort = 8089, serverPort=8055 }) {
    return await ipcRenderer.invoke('startBot', apiKey, apiSecret, hookPort, serverPort)
}

function stopBot() {
    ipcRenderer.send('stopBot')
}

const links = document.querySelectorAll('a[href]')
links.forEach(link => {
    link.addEventListener('click', e => {
        const url = link.getAttribute('href');
        e.preventDefault();
        shell.openExternal(url);
    });
});
window.onload = () => {
    const startButton = document.getElementById('start')
    const stopButton = document.getElementById('stop')
    const apikeyInput = document.getElementById('apikey')
    const apisecretInput = document.getElementById('apisecret')
    const hookPort = document.getElementById('hookport')
    const serverPort = document.getElementById('serverport')
    const logDom = document.getElementById('log-wrap')
    const logDomPath = document.getElementById('log-path')
    hookPort.value = '8089'
    serverPort.value = '8055'

    let interval = null
    if (localStorage.getItem('key')) {
        apikeyInput.value = localStorage.getItem('key')
    }
    if (localStorage.getItem('secret')) {
        apisecretInput.value = localStorage.getItem('secret')
    }
    if(localStorage.getItem('hookPort')) {
        hookPort.value = localStorage.getItem('hookPort')
    }
    if(localStorage.getItem('serverPort')) {
        serverPort.value = localStorage.getItem('serverPort')
    }

    startButton.addEventListener('click', async () => {
        const key = apikeyInput.value
        const secret = apisecretInput.value
        const hookPortValue = hookPort.value
        const serverPortValue = serverPort.value
        if (key && secret && hookPort.value && serverPort.value) {
            localStorage.setItem('key', key)
            localStorage.setItem('secret', secret)
            localStorage.setItem('hookPort', hookPortValue)
            localStorage.setItem('serverPort', serverPortValue)
        }
        const logPath = await startBot({ apiKey: key, apiSecret: secret, hookPort: hookPortValue, serverPort: serverPortValue })
        logDomPath.innerText = logPath;

        if (!interval) {
            interval = setInterval(() => {
                fs.access(logPath, (err) => {
                    if (!err) {
                        fs.readFile(logPath, (err, data) => {
                            if (err) {
                                return;
                            }
                            logDom.innerHTML = data;
                        })
                    }
                })
            }, 2000)
        }
        startButton.style.display = 'none';
    });

    stopButton.addEventListener('click', () => {
        stopBot()
        if (interval) {
            clearInterval(interval)
            interval = null
        }
        logDom.innerHTML = ''
        startButton.style.display = 'unset';
    })

}
