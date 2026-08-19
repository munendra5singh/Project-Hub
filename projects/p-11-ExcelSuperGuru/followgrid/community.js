import { db } from './firebase-config.js';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const grid = document.getElementById('followerGrid');

// 20 Dummy Data
const dummyUsers = [
    {name:"RAHUL SHARMA", gender:"male"}, {name:"PRIYA VERMA", gender:"female"},
    {name:"AMIT KUMAR", gender:"male"}, {name:"NEHA SINGH", gender:"female"},
    {name:"VIKASH YADAV", gender:"male"}, {name:"POOJA GUPTA", gender:"female"},
    {name:"ROHIT MISHRA", gender:"male"}, {name:"ANJALI SHARMA", gender:"female"},
    {name:"SAURABH PATEL", gender:"male"}, {name:"KAVYA JAIN", gender:"female"},
    {name:"ABHISHEK TIWARI", gender:"male"}, {name:"SNEHA AGARWAL", gender:"female"},
    {name:"DEEPAK KUMAR", gender:"male"}, {name:"SHREYA SINGH", gender:"female"},
    {name:"NITIN CHAUHAN", gender:"male"}, {name:"MUSKAN VERMA", gender:"female"},
    {name:"ARJUN MEHTA", gender:"male"}, {name:"RIYA GUPTA", gender:"female"},
    {name:"MANISH RAJ", gender:"male"}, {name:"ADITI SHARMA", gender:"female"}
];

// Helper Function: Card banane ke liye
function createCard(name, gender) {
    const card = document.createElement('div');
    card.className = 'follower-card';
    card.innerHTML = `
        <div class="inner-box">${gender.toLowerCase() === "female" ? "👩‍💻" : "👨‍💻"}</div>
        <div class="name-text">${name}</div>
    `;
    return card;
}

// 1. FRONTEND: Real-time Data Sync
onSnapshot(doc(db, "community", "members"), (docSnap) => {
    let firebaseCount = 0;
    const followers = docSnap.exists() ? (docSnap.data().followers || []) : [];
    firebaseCount = followers.length;

    // AGAR GRID HAI (Home/Contact page par)
    if (grid) {
        grid.innerHTML = "";

        // Sabse pehle Firebase wale add karein (Naya follower top par)
        if (firebaseCount > 0) {
            [...followers].reverse().forEach(user => grid.appendChild(createCard(user.name, user.gender)));
        }

        // Uske baad Dummy list niche dikhegi
        dummyUsers.forEach(user => grid.appendChild(createCard(user.name, user.gender)));
    }

    // TOTAL COUNT UPDATE
    const totalCount = firebaseCount + dummyUsers.length;

    // Contact Page Counter Update (ID target)
    const memberCountEl = document.getElementById('memberCount');
    if (memberCountEl) {
        memberCountEl.innerText = totalCount;
    }

    // Home Page Counter Update (Class target)
    const homeCounters = document.querySelectorAll('.memberCount');
    if (homeCounters.length > 0) {
        homeCounters.forEach(el => {
            el.innerText = totalCount;
        });
    }
}, (error) => {
    console.error("Realtime sync failed:", error);
});

// 2. Add Follower (toggle switch support ke saath)
window.addFollower = async function() {
    const nameInput = document.getElementById('userName');
    const phoneInput = document.getElementById('userPhone');
    const submitBtn = document.querySelector('.submit-btn');
    if (!nameInput || !phoneInput) return;

    const genderToggle = document.getElementById('genderToggle');
    const gender = (genderToggle && genderToggle.checked) ? "female" : "male";

    const name = nameInput.value.trim().toUpperCase();
    const phone = phoneInput.value.trim();

    if (!name || !/^[0-9]{10}$/.test(phone)) {
        alert("कृपया सही नाम और 10 अंकों का नंबर भरें!");
        return;
    }

    // Double-submit protection
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";
    }

    try {
        const docRef = doc(db, "community", "members");
        const docSnap = await getDoc(docRef);
        const followers = docSnap.exists() ? (docSnap.data().followers || []) : [];

        if (followers.find(f => f.phone === phone)) {
            alert("⚠️ यह नंबर पहले से रजिस्टर्ड है!");
            return;
        }

        await updateDoc(docRef, { followers: arrayUnion({ name, phone, gender }) });

        // Form reset aur popup band karein
        const popup = document.getElementById('followPopup');
        if (popup) popup.style.display = 'none';

        nameInput.value = '';
        phoneInput.value = '';
        if (genderToggle) {
            genderToggle.checked = false;
            if (typeof window.toggleGenderText === "function") window.toggleGenderText();
        }

        window.triggerToast(name);

    } catch (err) {
        console.error("Follower add failed:", err);
        alert("Kuch gadbad ho gayi, dobara try karein. (Network ya permission issue ho sakta hai)");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";
        }
    }
};

// 3. Notification Beep (Web Audio se generate — kisi external file ki zaroorat nahi)
function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.6);
    } catch (err) {
        console.error("Sound play failed:", err);
    }
}

// 4. Toast Trigger
window.triggerToast = function(name) {
    const toast = document.getElementById("toast");
    const toastName = document.getElementById("toastName");
    if (toast && toastName) {
        toastName.innerText = "🎉 Welcome to the Family, " + name + "!";
        playNotificationSound();
        toast.style.visibility = "visible";
        toast.style.opacity = "1";
        toast.style.transition = "0.5s";
        setTimeout(() => { toast.style.visibility = "hidden"; toast.style.opacity = "0"; }, 7000);
    }
};

// Toggle badalne par text aur uska rang (Blue/Pink) update karne ke liye
window.toggleGenderText = function() {
    const toggle = document.getElementById('genderToggle');
    const genderText = document.getElementById('genderText');

    if (toggle && genderText) {
        if (toggle.checked) {
            genderText.innerText = "Female 👩‍💼";
            genderText.className = "gender-text female-mode";
        } else {
            genderText.innerText = "Male 👨‍💼";
            genderText.className = "gender-text male-mode";
        }
    }
};

// Keyboard Esc button se popup band karne ke liye
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popup = document.getElementById('followPopup');
        if (popup && popup.style.display !== 'none') {
            popup.style.display = 'none';

            const nameInp = document.getElementById('userName');
            const phoneInp = document.getElementById('userPhone');
            if (nameInp) nameInp.value = '';
            if (phoneInp) phoneInp.value = '';

            const toggle = document.getElementById('genderToggle');
            if (toggle) {
                toggle.checked = false;
                if (typeof window.toggleGenderText === "function") window.toggleGenderText();
            }
        }
    }
});