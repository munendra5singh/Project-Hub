const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9231',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-diag3',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9231/json/list').then(r => r.json());
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
    
    let res = await send('Runtime.evaluate', { expression: `(async () => {
        document.documentElement.style.overflowX = 'clip';
        document.body.style.overflowX = 'clip';
        document.documentElement.style.scrollBehavior = 'auto';
        
        // Scroll down to 300
        window.scrollTo(0, 300);
        await new Promise(r => setTimeout(r, 450));
        
        const nav = document.querySelector('.top-navbar');
        const sub = document.querySelector('.sub-header');
        const hiddenDown = document.body.classList.contains('header-hidden');
        const downNavBottom = nav.getBoundingClientRect().bottom;
        const downSubBottom = sub.getBoundingClientRect().bottom;

        // Scroll slightly UP (from 300 to 280)
        window.scrollTo(0, 280);
        await new Promise(r => setTimeout(r, 450));

        const hiddenUp = document.body.classList.contains('header-hidden');
        const upNavTop = nav.getBoundingClientRect().top;
        const upSubTop = sub.getBoundingClientRect().top;

        return {
            hiddenDown,
            downNavBottom,
            downSubBottom,
            hiddenUp,
            upNavTop,
            upSubTop
        };
    })()`, returnByValue: true, awaitPromise: true });

    console.log('Result with overflowX: clip and scroll 300:', JSON.stringify(res.result.value, null, 2));

    ws.close();
    chrome.kill();
}
run();
