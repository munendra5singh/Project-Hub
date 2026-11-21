const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9227',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-sc-test',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9227/json/list').then(r => r.json());
    const ws = new WebSocket(pages[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(m, p={}) { return new Promise(r => {
        const i = id++;
        ws.send(JSON.stringify({ id: i, method: m, params: p }));
        const h = e => {
            const d = JSON.parse(e.data);
            if (d.id === i) { ws.removeEventListener('message', h); r(d.result); }
        };
        ws.addEventListener('message', h);
    }); }
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('ba5_language', 'hi');" });
    await send('Page.navigate', { url: 'http://localhost:8080/hindi/hindi-bhasha-1.html' });
    await new Promise(r => setTimeout(r, 2000));
    
    let info = await send('Runtime.evaluate', { expression: `(() => {
        const html = document.documentElement;
        const body = document.body;
        const content = document.querySelector('.content-area');
        return {
            windowInner: { w: window.innerWidth, h: window.innerHeight },
            html: {
                scrollHeight: html.scrollHeight,
                clientHeight: html.clientHeight,
                overflowY: getComputedStyle(html).overflowY,
                height: getComputedStyle(html).height
            },
            body: {
                scrollHeight: body.scrollHeight,
                clientHeight: body.clientHeight,
                overflowY: getComputedStyle(body).overflowY,
                height: getComputedStyle(body).height
            },
            contentArea: content ? {
                scrollHeight: content.scrollHeight,
                clientHeight: content.clientHeight,
                overflowY: getComputedStyle(content).overflowY,
                height: getComputedStyle(content).height
            } : null
        };
    })()`, returnByValue: true });

    console.log('Scroll Info:', JSON.stringify(info.result.value, null, 2));

    ws.close();
    chrome.kill();
}
run();
