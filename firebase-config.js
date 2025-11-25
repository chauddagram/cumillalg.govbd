// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, setLogLevel, serverTimestamp, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Firebase কনফিগারেশন
const firebaseConfig = {
    apiKey: "AIzaSyDSjhi_l5fec76l8gbZjWea9qYIF8PyfgM",
    authDomain: "chauddagram-cumillalg-govbd.firebaseapp.com",
    projectId: "chauddagram-cumillalg-govbd",
    storageBucket: "chauddagram-cumillalg-govbd.firebasestorage.app",
    messagingSenderId: "190893923606",
    appId: "1:190893923606:web:4b862bd2a7bcd63df5c437",
    measurementId: "G-G7T4CDR07Q"
};

// Firebase অ্যাপ ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// গ্লোবাল ভ্যারিয়েবল
const appId = 'cumilla-helpdesk-default-id';
const initialAuthToken = null;

// সার্ভিস তালিকা
const serviceList = [
    { name: "নাগরিক সনদ", price: 50 },
    { name: "নতুন ভোটার সনদ", price: 150 },
    { name: "ওয়ারিশ সনদ", price: 100 },
    { name: "পারিবারিক সনদ", price: 100 },
    { name: "ভোটার আইডি স্থানান্তর সনদ", price: 150 },
    { name: "জাতীয় পরিচয়পত্র সংশোধন সংক্রান্ত", price: 300 },
    { name: "পাসপোর্ট সুপারিশ", price: 250 },
    { name: "একই নামের প্রত্যয়ন", price: 100 },
    { name: "অন্যান্য প্রত্যয়ন পত্র", price: 80 },
    { name: "স্মার্ট কার্ড মেক", price: 200 },
    { name: "এনআইডি মেক", price: 200 },
    { name: "নতুন জন্ম নিবন্ধন মেক", price: 250 },
    { name: "নাম ঠিকানা দিয়ে হারানো এন আইডি কার্ড", price: 150 },
    { name: "এন আইডি ইউজার পাসওয়ার্ড সেট", price: 100 },
    { name: "ফরম নম্বর দিয়ে এন আইডি কার্ড", price: 100 },
    { name: "মোবাইল নম্বর দিয়ে এন আইডি কার্ড", price: 100 },
    { name: "জন্মনিবন্ধন নম্বর দিয়ে এন আইডি কার্ড", price: 100 },
    { name: "১০/১৭ ডিজিটের আইডি দিয়ে এন আইডি কার্ড", price: 100 },
    { name: "পিডিএফ ফাইল টু web url link create", price: 50 },
    { name: "Web url link to qr code scanner create", price: 50 },
];

// গ্লোবালভাবে এক্সপোর্ট করুন
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
window.firebaseConfig = firebaseConfig;
window.serviceList = serviceList;
window.appId = appId;
