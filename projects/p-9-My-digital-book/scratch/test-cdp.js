const { spawn } = require('child_process');
const fs = require('fs');

async function run() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-qa',
        '--disable-gpu',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1500));

    try {
        const ver = await fetch('http://127.0.0.1:9222/json/version').then(r => r.json());
        console.log('Chrome CDP Connected:', ver.Browser);
    } catch (e) {
        console.error('CDP Error:', e.message);
    } finally {
        chrome.kill();
    }
}
run();
