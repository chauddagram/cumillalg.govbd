// Firebase SDKs (v9 Compat - CDN লোড হবে index.html এ)

const firebaseConfig = {
    apiKey: "AIzaSyDSjhi_l5fec76l8gbZjWea9qYIF8PyfgM",
    authDomain: "chauddagram-cumillalg-govbd.firebaseapp.com",
    projectId: "chauddagram-cumillalg-govbd",
    storageBucket: "chauddagram-cumillalg-govbd.firebasestorage.app",
    messagingSenderId: "190893923606",
    appId: "1:190893923606:web:4b862bd2a7bcd63df5c437",
    measurementId: "G-G7T4CDR07Q"
};

// Firebase ইনিশিয়ালাইজ করুন
const app = firebase.initializeApp(firebaseConfig);

// প্রয়োজনীয় সার্ভিসগুলি এক্সপোর্ট করুন
const auth = app.auth();
const db = app.firestore();
const storage = app.storage();

// বর্তমান ইউজার তথ্য সংরক্ষণের জন্য গ্লোবাল ভেরিয়েবল
let currentUser = null; 

// অথেন্টিকেশন স্টেট চেকার এবং রিডাইরেক্ট লজিক
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    const publicPages = ['/', '/index.html', '/register.html', '/login.html', '/super_admin_login.html'];
    const requiresAuth = !publicPages.some(p => path.endsWith(p));

    if (user) {
        currentUser = user; // গ্লোবাল ভেরিয়েবল সেট
        db.collection("users").doc(user.uid).get().then(doc => {
            const userData = doc.data();

            if (!userData) {
                // ডেটাবেসে ইউজার ডেটা না থাকলে (ত্রুটি)
                auth.signOut(); 
                return;
            }

            const isSuperAdmin = userData.role === 'super_admin';
            const isActive = userData.status === 'Active';

            // ১. লগইন/হোম পেজ থেকে রিডাইরেক্ট
            if (path.endsWith('login.html') || path.endsWith('register.html') || path.endsWith('index.html') || path.endsWith('super_admin_login.html')) {
                if (isSuperAdmin) {
                    window.location.href = 'super_admin_dashboard.html';
                } else if (isActive) {
                    window.location.href = 'dashboard.html';
                }
            }

            // ২. অ্যাক্টিভেশন/স্ট্যাটাস চেক
            if (path.endsWith('dashboard.html') && !isSuperAdmin && !isActive) {
                alert("আপনার অ্যাকাউন্টটি এখনও প্রধান অ্যাডমিন কর্তৃক অনুমোদিত নয়।");
                auth.signOut().then(() => window.location.href = 'login.html');
            }
            if (path.endsWith('super_admin_dashboard.html') && !isSuperAdmin) {
                 alert("আপনার সুপার অ্যাডমিন অ্যাক্সেস নেই।");
                 auth.signOut().then(() => window.location.href = 'login.html');
            }

        }).catch(e => {
            console.error("Firestore error on auth check:", e);
            auth.signOut();
        });
    } else {
        currentUser = null;
        // যদি সুরক্ষিত পেজ হয় এবং user লগইন করা না থাকে
        if (requiresAuth) {
             if (!path.endsWith('login.html') && !path.endsWith('register.html') && !path.endsWith('index.html')) {
                window.location.href = 'login.html';
            }
        }
    }
});
