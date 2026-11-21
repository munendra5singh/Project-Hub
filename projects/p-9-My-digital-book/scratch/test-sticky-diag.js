const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9229',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-diag',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9229/json/list').then(r => r.json());
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
    
    let diag = await send('Runtime.evaluate', { expression: `(() => {
        const nav = document.querySelector('.top-navbar');
        let el = nav.parentElement;
        const chain = [];
        while (el) {
            const s = getComputedStyle(el);
            chain.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                overflow: s.overflow,
                overflowX: s.overflowX,
                overflowY: s.overflowY,
                position: s.position,
                height: s.height
            });
            el = el.parentElement;
        }
        return {
            navStyle: {
                position: getComputedStyle(nav).position,
                top: getComputedStyle(nav).top,
                zIndex: getComputedStyle(nav).zIndex
            },
            chain
        };
    })()`, returnByValue: true });

    console.log('Diagnostic Chain:', JSON.stringify(diag.result.value, null, 2));

    ws.close();
    chrome.kill();
}
run();
