const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9226',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-mob-detail',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9226/json/list').then(r => r.json());
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
        const nav = document.querySelector('.top-navbar');
        const sub = document.querySelector('.sub-header');
        const r0 = { nav: nav.getBoundingClientRect(), sub: sub.getBoundingClientRect(), scrollY: window.scrollY };
        
        // Scroll down 200
        window.scrollTo(0, 200);
        const r1 = { 
            nav: nav.getBoundingClientRect(), 
            sub: sub.getBoundingClientRect(), 
            scrollY: window.scrollY,
            hidden: document.body.classList.contains('header-hidden'),
            navTransform: getComputedStyle(nav).transform,
            subTransform: getComputedStyle(sub).transform
        };

        return { r0, r1 };
    })()`, returnByValue: true });

    console.log('Results:', JSON.stringify(res.result.value, null, 2));

    ws.close();
    chrome.kill();
}
run();
