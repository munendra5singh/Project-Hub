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
    async screenshot(filepath) {
        const res = await this.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    }
    close() {
        this.ws.close();
    }
}

async function runTests() {
    console.log('Starting Headless Chrome for Comprehensive Auto-Hide Header QA...');
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--remote-debugging-port=9232',
        '--user-data-dir=C:\\Users\\acer\\AppData\\Local\\Temp\\chrome-full-qa',
        '--disable-gpu',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1500));
    let passedCount = 0;
    let failedCount = 0;

    function assert(name, condition, details = '') {
        if (condition) {
            console.log(`[PASS] ${name}`);
            passedCount++;
        } else {
            console.error(`[FAIL] ${name} - ${details}`);
            failedCount++;
        }
    }

    try {
        const pages = await fetch('http://127.0.0.1:9232/json/list').then(r => r.json());
        const cdp = new CDP(pages[0].webSocketDebuggerUrl);
        await cdp.ready;

        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
            source: "localStorage.setItem('ba5_language', 'hi');"
        });

        // =========================================================================
        // TEST SUITE 1: DESKTOP BOOK READING PAGE (1280x800) - hindi-bhasha-1.html
        // =========================================================================
        console.log('\n=== SUITE 1: DESKTOP BOOK READING (1280x800) ===');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        await cdp.send('Page.navigate', { url: 'http://localhost:8080/hindi/hindi-bhasha-1.html' });
        await cdp.waitForLoad();

        // 1. Initial State
        const deskInitial = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            const wrap = document.querySelector('.main-wrapper');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navTop: nav.getBoundingClientRect().top,
                navHeight: nav.getBoundingClientRect().height,
                subTop: sub.getBoundingClientRect().top,
                wrapTop: wrap.getBoundingClientRect().top
            };
        })()`);
        assert('Desktop: Initial headers visible', !deskInitial.hidden && deskInitial.navTop === 0 && deskInitial.subTop === 60);
        assert('Desktop: Initial content area position below headers', deskInitial.wrapTop >= 104);

        // 2. Scroll content-area DOWN by 300px
        await cdp.eval(`(() => {
            const content = document.querySelector('.content-area');
            content.scrollTop = 300;
            content.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const deskScrolledDown = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            const wrap = document.querySelector('.main-wrapper');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navBottom: nav.getBoundingClientRect().bottom,
                subBottom: sub.getBoundingClientRect().bottom,
                wrapTop: wrap.getBoundingClientRect().top,
                wrapHeight: wrap.getBoundingClientRect().height
            };
        })()`);
        assert('Desktop: Headers hidden on scroll down', deskScrolledDown.hidden);
        assert('Desktop: Both headers slid above viewport (bottom <= 0)', deskScrolledDown.navBottom <= 0 && deskScrolledDown.subBottom <= 0, JSON.stringify(deskScrolledDown));
        assert('Desktop: Reading container moved to top of viewport to provide maximum reading space', deskScrolledDown.wrapTop <= 4, JSON.stringify(deskScrolledDown));

        // 3. Scroll content-area UP slightly by 25px (from 300 to 275)
        await cdp.eval(`(() => {
            const content = document.querySelector('.content-area');
            content.scrollTop = 275;
            content.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const deskScrolledUp = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            const wrap = document.querySelector('.main-wrapper');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navTop: nav.getBoundingClientRect().top,
                subTop: sub.getBoundingClientRect().top,
                wrapTop: wrap.getBoundingClientRect().top
            };
        })()`);
        assert('Desktop: Headers smoothly reappeared on slight scroll upward', !deskScrolledUp.hidden && deskScrolledUp.navTop === 0 && deskScrolledUp.subTop === 60, JSON.stringify(deskScrolledUp));
        assert('Desktop: Container returned to position below headers', deskScrolledUp.wrapTop >= 104, JSON.stringify(deskScrolledUp));

        // 4. Scrolling stops -> state preserved
        await new Promise(r => setTimeout(r, 300));
        const deskStopState = await cdp.eval('!document.body.classList.contains("header-hidden")');
        assert('Desktop: Visibility state preserved when scrolling stops', deskStopState);

        // =========================================================================
        // TEST SUITE 2: MOBILE VIEW (375x667) - hindi-bhasha-1.html
        // =========================================================================
        console.log('\n=== SUITE 2: MOBILE VIEW (375x667) ===');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            mobile: true
        });

        await cdp.send('Page.navigate', { url: 'http://localhost:8080/hindi/hindi-bhasha-1.html' });
        await cdp.waitForLoad();

        // 1. Initial State on Mobile
        const mobInitial = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navTop: nav.getBoundingClientRect().top,
                subTop: sub.getBoundingClientRect().top
            };
        })()`);
        assert('Mobile: Initial headers visible', !mobInitial.hidden && mobInitial.navTop === 0);

        // 2. Scroll mobile window DOWN by 300px
        await cdp.eval(`(() => {
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, 300);
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const mobScrolledDown = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navBottom: nav.getBoundingClientRect().bottom,
                subBottom: sub.getBoundingClientRect().bottom
            };
        })()`);
        assert('Mobile: Headers hidden on scroll down', mobScrolledDown.hidden);
        assert('Mobile: Both headers slid above viewport', mobScrolledDown.navBottom <= 0 && mobScrolledDown.subBottom <= 0, JSON.stringify(mobScrolledDown));

        // 3. Scroll mobile window UP slightly by 25px (from 300 to 275)
        await cdp.eval(`(() => {
            window.scrollTo(0, 275);
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const mobScrolledUp = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navTop: nav.getBoundingClientRect().top,
                subTop: sub.getBoundingClientRect().top
            };
        })()`);
        assert('Mobile: Headers smoothly reappeared fixed at top on slight scroll upward', !mobScrolledUp.hidden && mobScrolledUp.navTop === 0, JSON.stringify(mobScrolledUp));

        // 4. Mobile Hamburger Drawer Test: Opening menu keeps headers visible
        const hamburgerTest = await cdp.eval(`(() => {
            const btn = document.getElementById('nav-menu-toggle');
            if (btn) btn.click();
            return {
                menuOpen: Boolean(document.querySelector('.nav-menu.mobile-open')),
                hidden: document.body.classList.contains('header-hidden')
            };
        })()`);
        assert('Mobile: Hamburger toggle opens navigation menu with headers visible', hamburgerTest.menuOpen && !hamburgerTest.hidden);

        // Close menu
        await cdp.eval(`(() => {
            const btn = document.getElementById('nav-menu-toggle');
            if (btn) btn.click();
        })()`);

        // =========================================================================
        // TEST SUITE 3: HOMEPAGE (index.html)
        // =========================================================================
        console.log('\n=== SUITE 3: HOMEPAGE (index.html) ===');
        await cdp.send('Page.navigate', { url: 'http://localhost:8080/hindi/index.html' });
        await cdp.waitForLoad();

        // 1. Initial State
        const homeInitial = await cdp.eval('!document.body.classList.contains("header-hidden")');
        assert('Homepage: Headers initially visible', homeInitial);

        // 2. Scroll window down 250px
        await cdp.eval(`(() => {
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, 250);
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const homeDown = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            const sub = document.querySelector('.sub-header');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navBottom: nav.getBoundingClientRect().bottom,
                subBottom: sub.getBoundingClientRect().bottom
            };
        })()`);
        assert('Homepage: Headers auto-hidden on scroll down', homeDown.hidden && homeDown.navBottom <= 0 && homeDown.subBottom <= 0, JSON.stringify(homeDown));

        // 3. Scroll window up slightly (to 220px)
        await cdp.eval(`(() => {
            window.scrollTo(0, 220);
            window.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const homeUp = await cdp.eval(`(() => {
            const nav = document.querySelector('.top-navbar');
            return {
                hidden: document.body.classList.contains('header-hidden'),
                navTop: nav.getBoundingClientRect().top
            };
        })()`);
        assert('Homepage: Headers auto-revealed on scroll up', !homeUp.hidden && homeUp.navTop === 0, JSON.stringify(homeUp));

        // =========================================================================
        // TEST SUITE 4: ENGLISH VERSION (geo-theory.html & index.html)
        // =========================================================================
        console.log('\n=== SUITE 4: ENGLISH VERSION ===');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        await cdp.send('Page.navigate', { url: 'http://localhost:8080/englisg/geo-theory.html' });
        await cdp.waitForLoad();

        await cdp.eval(`(() => {
            const content = document.querySelector('.content-area');
            content.scrollTop = 300;
            content.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const enDown = await cdp.eval('document.body.classList.contains("header-hidden")');
        assert('English Desktop: Headers auto-hidden on scroll down', enDown);

        await cdp.eval(`(() => {
            const content = document.querySelector('.content-area');
            content.scrollTop = 270;
            content.dispatchEvent(new Event('scroll'));
        })()`);
        await new Promise(r => setTimeout(r, 450));

        const enUp = await cdp.eval('!document.body.classList.contains("header-hidden")');
        assert('English Desktop: Headers auto-revealed on slight scroll up', enUp);

        console.log(`\n========================================`);
        console.log(`FINAL RESULT: ${passedCount} PASSED, ${failedCount} FAILED`);
        console.log(`========================================`);

        cdp.close();
    } catch (e) {
        console.error('Fatal Test Error:', e);
    } finally {
        chrome.kill();
    }
}

runTests();
