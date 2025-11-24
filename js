// --- Firebase Configuration (আপনার দেওয়া কী) ---
// এটি Firebase-এর সাথে আপনার ওয়েবসাইটকে সংযুক্ত করার জন্য প্রয়োজনীয়
const firebaseConfig = {
    apiKey: "AIzaSyDSjhi_l5fec76l8gbZjWea9qYIF8PyfgM", // <-- আপনার কী
    authDomain: "chauddagram-cumillalg-govbd.firebaseapp.com", 
    projectId: "chauddagram-cumillalg-govbd",
    storageBucket: "chauddagram-cumillalg-govbd.firebasestorage.app",
    messagingSenderId: "190893923606",
    appId: "1:190893923606:web:4b862bd2a7bcd63df5c437",
    measurementId: "G-G7T4CDR07Q" 
};

// Firebase অ্যাপ এবং সার্ভিসগুলো ইনিশিয়ালাইজ করুন (Compat Version)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();     // Authentication সার্ভিস
const db = firebase.firestore();  // Firestore ডাটাবেস সার্ভিস

console.log("Firebase App Initialized!");
// ------------------------------------------------------------------

// --- Utility Functions (ফর্ম লজিক) ---

// ধাপ ১ থেকে ধাপ ২ এ যাওয়ার ফাংশন
function goToStep2() {
    // ফর্ম ভ্যালিডেশন
    const nameBn = document.getElementById('nameBn').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    const nid = document.getElementById('nid').value;
    
    // NID এবং মোবাইল নম্বরের দৈর্ঘ্য পরীক্ষা
    if (nid.length !== 10 && nid.length !== 17) {
        alert("জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০ বা ১৭ ডিজিটের হতে হবে।");
        return;
    }
    if (mobile.length !== 11) {
        alert("মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।");
        return;
    }
    if (password.length < 6) {
        alert("পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।");
        return;
    }

    if (nameBn && mobile && nid && password) {
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
    } else {
        alert("অনুগ্রহ করে ধাপ ১ এর তারকা চিহ্নিত সকল ঘর পূরণ করুন।");
    }
}

// স্থায়ী ঠিকানা ফিল্ড দেখানো বা লুকানোর ফাংশন
function togglePermanentAddress() {
    const isChecked = document.getElementById('sameAsCurrent').checked;
    document.getElementById('permanentAddressFields').style.display = isChecked ? 'none' : 'block';
    document.getElementById('permanentAddress').required = !isChecked;
}

// --- Registration Function (Firebase Interaction) ---

// সাব-অ্যাডমিন নিবন্ধন প্রক্রিয়া
function submitSubAdminRegistration() {
    const mobile = document.getElementById('mobile').value;
    const nid = document.getElementById('nid').value;
    // Firebase Auth-এর জন্য ইউনিক ইমেল তৈরি (Mobile + NID দিয়ে)
    const email = mobile + "@" + nid + ".com"; 
    const password = document.getElementById('password').value;

    // সমস্ত ডেটা সংগ্রহ
    const regData = {
        nameBn: document.getElementById('nameBn').value,
        nameEn: document.getElementById('nameEn').value,
        nid: nid,
        mobile: mobile,
        accountType: document.getElementById('accountType').value,
        office: document.getElementById('office').value,
        currentAddress: document.getElementById('currentAddress').value,
        upazila: document.getElementById('upazila').value,
        district: 'কুমিল্লা',
        permanentAddress: document.getElementById('sameAsCurrent').checked 
            ? document.getElementById('currentAddress').value 
            : document.getElementById('permanentAddress').value,
        
        status: "Pending", // অনুমোদনের জন্য অপেক্ষা করছে
        role: "Sub-Admin", 
        submitted_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // চূড়ান্ত ভ্যালিডেশন
    if (!regData.office || !regData.upazila || !regData.currentAddress) {
        alert("অনুগ্রহ করে ধাপ ২ এর তারকা চিহ্নিত সকল তথ্য পূরণ করুন।");
        return;
    }
    
    // বাটন নিষ্ক্রিয় করা
    const submitBtn = document.querySelector('#step2 button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'নিবন্ধন হচ্ছে...';

    // ১. Firebase Authentication-এ ইউজার তৈরি
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const uid = userCredential.user.uid;
            
            // ২. Firestore ডাটাবেসে তথ্য জমা
            return db.collection("pending_applications").doc(uid).set(regData);
        })
        .then(() => {
            alert("✨ অভিনন্দন! আপনার আবেদন কর্তৃপক্ষের অনুমোদনের জন্য অপেক্ষা করছে।");
            window.location.href = "index.html"; // সফল হলে হোমে ফিরে যাবে
        })
        .catch((error) => {
            alert("নিবন্ধন ব্যর্থ: " + error.message);
            console.error("নিবন্ধন ত্রুটি:", error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'নিবন্ধন করুন ✅';
        });
}