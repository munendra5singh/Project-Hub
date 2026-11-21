const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CDP {
    constructor(wsUrl) {
        this.ws = new WebSocket(wsUrl);
        this.id = 1;
        this.callbacks = new Map();
        this.ready = new Promise((resolve, reject) => {
            this.ws.onopen = resolve;
            this.ws.onerror = reject;
        });
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id && this.callbacks.has(data.id)) {
                const { resolve, reject } = this.callbacks.get(data.id);
                this.callbacks.delete(data.id);
                if (data.error) reject(data.error);
                else resolve(data.result);
            }
        };
    }
    send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = this.id++;
            this.callbacks.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }
    async eval(expr) {
        const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        if (res.exceptionDetails) {
            throw new Error(JSON.stringify(res.exceptionDetails));
        }
        return res.result.value;
    }
    async screenshot(filepath) {
        const res = await this.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    }
    async waitForLoad() {
        for (let i = 0; i < 50; i++) {
            const state = await this.eval('document.readyState');
            if (state === 'complete') {
                const hasNav = await this.eval('Boolean(document.querySelector(".top-navbar"))');
                if (hasNav) return;
            }
            await new Promise(r => setTimeout(r, 100));
        }
    }
}

async function main() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9223',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-qa-run',
        '--disable-gpu',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1500));

    try {
        const pages = await fetch('http://127.0.0.1:9223/json/list').then(r => r.json());
        const pageWsUrl = pages[0].webSocketDebuggerUrl;
        const cdp = new CDP(pageWsUrl);
        await cdp.ready;

        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
            source: "localStorage.setItem('ba5_language', 'hi');"
        });

        console.log('--- TEST 1: DESKTOP BOOK READING (1280x800) ---');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        await cdp.send('Page.navigate', { url: 'http://localhost:8080/hindi/hindi-bhasha-1.html' });
        await cdp.waitForLoad();

        let initialDesk = await cdp.eval(`(() => {
            const navbar = document.querySelector('.top-navbar');
            const subheader = document.querySelector('.sub-header');
            const navRect = navbar.getBoundingClientRect();
            const subRect = subheader.getBoundingClientRect();
            const hidden = document.body.classList.contains('header-hidden');
            return { navTop: navRect.top, navHeight: navRect.height, subTop: subRect.top, hidden };
        })()`);
        console.log('Desktop Initial State:', initialDesk);

        // Scroll content-area down by 250px
        await cdp.eval(`(() => {
            const content = document.querySelector('.content-area');
            content.scrollTop = 250;
            content.dispatchEvent(new Event('scroll'));
        })()`);
        // Wait for requestAnimationFrame and transition
        await new Promise(r => setTimeout(r, 450));

        let afterScrollDown = await cdp.eval(`(() => {
            const navbar = document.querySelector('.top-navbar');
            const subheader = document.querySelector('.sub-header');
            const wrapper = document.querySelector('.main-wrapper');
            const navRect = navbar.getBoundingClientRect();
            const subRect = subheader.getBoundingClientRect();
            const wrapRect = wrapper.getBoundingClientRect();
            const hidden = document.body.classList.contains('header-hidden');
            return {
                hidden,
                navBottom: navRect.bottom,
                subBottom: subRect.bottom,
                wrapTop: wrapRect.top,
                wrapHeight: wrapRect.height
            };
        })()`);
        console.log('Desktop After Scroll Down (250px):', afterScrollDown);
        await cdp.screenshot('scratch/desk_scrolled_down.png');

        // Scroll content-area slightly up by 20px (from 250 to 230)
        await cdp.eval(`(() => {
            const content = document.querySelector('.content-area');
            content.scrollTop = 230;
            content.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        let afterScrollUp = await cdp.eval(`(() => {
            const navbar = document.querySelector('.top-navbar');
            const subheader = document.querySelector('.sub-header');
            const wrapper = document.querySelector('.main-wrapper');
            const navRect = navbar.getBoundingClientRect();
            const subRect = subheader.getBoundingClientRect();
            const wrapRect = wrapper.getBoundingClientRect();
            const hidden = document.body.classList.contains('header-hidden');
            return {
                hidden,
                navTop: navRect.top,
                subTop: subRect.top,
                wrapTop: wrapRect.top
            };
        })()`);
        console.log('Desktop After Scroll Up Slightly (to 230px):', afterScrollUp);
        await cdp.screenshot('scratch/desk_scrolled_up.png');

        console.log('\n--- TEST 2: MOBILE VIEW (375x667) ---');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            mobile: true
        });

        await cdp.send('Page.navigate', { url: 'http://localhost:8080/hindi/hindi-bhasha-1.html' });
        await cdp.waitForLoad();

        let initialMobile = await cdp.eval(`(() => {
            const navbar = document.querySelector('.top-navbar');
            const subheader = document.querySelector('.sub-header');
            const navRect = navbar.getBoundingClientRect();
            const subRect = subheader.getBoundingClientRect();
            return {
                navTop: navRect.top,
                subTop: subRect.top,
                hidden: document.body.classList.contains('header-hidden')
            };
        })()`);
        console.log('Mobile Initial State:', initialMobile);

        // Scroll mobile window down by 200px
        await cdp.eval(`(() => {
            window.scrollTo({ top: 200, behavior: 'instant' });
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        let mobileScrolledDown = await cdp.eval(`(() => {
            const navbar = document.querySelector('.top-navbar');
            const subheader = document.querySelector('.sub-header');
            const navRect = navbar.getBoundingClientRect();
            const subRect = subheader.getBoundingClientRect();
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navBottom: navRect.bottom,
                subBottom: subRect.bottom
            };
        })()`);
        console.log('Mobile After Scroll Down (200px):', mobileScrolledDown);
        await cdp.screenshot('scratch/mobile_scrolled_down.png');

        // Scroll mobile window slightly up by 15px (from 200 to 185)
        await cdp.eval(`(() => {
            window.scrollTo({ top: 185, behavior: 'instant' });
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        let mobileScrolledUp = await cdp.eval(`(() => {
            const navbar = document.querySelector('.top-navbar');
            const subheader = document.querySelector('.sub-header');
            const navRect = navbar.getBoundingClientRect();
            const subRect = subheader.getBoundingClientRect();
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navTop: navRect.top,
                subTop: subRect.top
            };
        })()`);
        console.log('Mobile After Scroll Up (to 185px):', mobileScrolledUp);
        await cdp.screenshot('scratch/mobile_scrolled_up.png');

        console.log('\n--- TEST 3: HOMEPAGE (index.html) ---');
        await cdp.send('Page.navigate', { url: 'http://localhost:8080/hindi/index.html' });
        await cdp.waitForLoad();

        await cdp.eval(`(() => {
            window.scrollTo({ top: 250, behavior: 'instant' });
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        let homeDown = await cdp.eval(`(() => {
            return {
                hidden: document.body.classList.contains('header-hidden'),
                scrollY: window.scrollY
            };
        })()`);
        console.log('Homepage Scrolled Down:', homeDown);

        cdp.close();
    } catch (e) {
        console.error('Test execution error:', e);
    } finally {
        chrome.kill();
    }
}
main();
