const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9225',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-clip',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9225/json/list').then(r => r.json());
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
    
    // Check with overflow-x: clip vs overflow-x: hidden
    let stickyHidden = await send('Runtime.evaluate', { expression: `(() => {
        window.scrollTo(0, 200);
        const rect = document.querySelector('.top-navbar').getBoundingClientRect();
        return { top: rect.top, pos: getComputedStyle(document.querySelector('.top-navbar')).position };
    })()`, returnByValue: true });
    console.log('With current CSS, navbar top at scroll 200 is:', stickyHidden.result.value);

    // Now test setting html and body overflow-x to clip
    let stickyClip = await send('Runtime.evaluate', { expression: `(() => {
        document.documentElement.style.overflowX = 'clip';
        document.body.style.overflowX = 'clip';
        window.scrollTo(0, 200);
        const rect = document.querySelector('.top-navbar').getBoundingClientRect();
        return { top: rect.top, pos: getComputedStyle(document.querySelector('.top-navbar')).position };
    })()`, returnByValue: true });
    console.log('With overflow-x: clip, navbar top at scroll 200 is:', stickyClip.result.value);

    ws.close();
    chrome.kill();
}
run();
