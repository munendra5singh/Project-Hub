const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9230',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-diag2',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9230/json/list').then(r => r.json());
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
    
    let res = await send('Runtime.evaluate', { expression: `(() => {
        document.documentElement.style.overflowX = 'clip';
        document.body.style.overflowX = 'clip';
        
        window.scrollTo(0, 300);
        const nav = document.querySelector('.top-navbar');
        const sub = document.querySelector('.sub-header');
        return {
            bodyOverflow: getComputedStyle(document.body).overflow,
            scrollY: window.scrollY,
            navTop: nav.getBoundingClientRect().top,
            subTop: sub.getBoundingClientRect().top
        };
    })()`, returnByValue: true });

    console.log('Result with overflowX: clip:', JSON.stringify(res.result.value, null, 2));

    ws.close();
    chrome.kill();
}
run();
