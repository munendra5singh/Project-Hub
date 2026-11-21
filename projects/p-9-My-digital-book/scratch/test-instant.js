const { spawn } = require('child_process');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9228',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-instant',
        '--disable-gpu',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 1500));
    const pages = await fetch('http://127.0.0.1:9228/json/list').then(r => r.json());
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
    
    // Set scrollTop directly and trigger scroll event
    let r = await send('Runtime.evaluate', { expression: `(async () => {
        const nav = document.querySelector('.top-navbar');
        const sub = document.querySelector('.sub-header');
        
        document.documentElement.scrollTop = 200;
        window.dispatchEvent(new Event('scroll'));
        
        // Wait for requestAnimationFrame and CSS transition
        await new Promise(res => setTimeout(res, 400));

        return {
            scrollY: window.scrollY,
            hidden: document.body.classList.contains('header-hidden'),
            navTransform: getComputedStyle(nav).transform,
            subTransform: getComputedStyle(sub).transform,
            navRectTop: nav.getBoundingClientRect().top,
            navRectBottom: nav.getBoundingClientRect().bottom,
            subRectTop: sub.getBoundingClientRect().top,
            subRectBottom: sub.getBoundingClientRect().bottom
        };
    })()`, returnByValue: true, awaitPromise: true });

    console.log('Mobile Scroll Down Result:', JSON.stringify(r.result.value, null, 2));

    // Now test scrolling up slightly (from 200 to 180)
    let rUp = await send('Runtime.evaluate', { expression: `(async () => {
        const nav = document.querySelector('.top-navbar');
        const sub = document.querySelector('.sub-header');
        
        document.documentElement.scrollTop = 180;
        window.dispatchEvent(new Event('scroll'));
        
        await new Promise(res => setTimeout(res, 400));

        return {
            scrollY: window.scrollY,
            hidden: document.body.classList.contains('header-hidden'),
            navTransform: getComputedStyle(nav).transform,
            subTransform: getComputedStyle(sub).transform,
            navRectTop: nav.getBoundingClientRect().top,
            navRectBottom: nav.getBoundingClientRect().bottom,
            subRectTop: sub.getBoundingClientRect().top,
            subRectBottom: sub.getBoundingClientRect().bottom
        };
    })()`, returnByValue: true, awaitPromise: true });

    console.log('Mobile Scroll Up Result:', JSON.stringify(rUp.result.value, null, 2));

    ws.close();
    chrome.kill();
}
run();
