// firebase-config.js থেকে auth, db, storage এবং currentUser লোড করা হবে

// ** ১. নিবন্ধন লজিক **
function handleRegistration(e) {
    e.preventDefault();
    const nameBn = document.getElementById('reg-name-bn').value;
    const nameEn = document.getElementById('reg-name-en').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const mobile = document.getElementById('reg-mobile').value;
    const photoFile = document.getElementById('reg-photo').files[0];
    const messageEl = document.getElementById('reg-message');

    if (password !== confirmPassword) {
        messageEl.textContent = 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।';
        return;
    }
    
    if (!photoFile) {
        messageEl.textContent = 'অনুগ্রহ করে ছবি আপলোড করুন।';
        return;
    }

    messageEl.textContent = 'নিবন্ধন প্রক্রিয়া চলছে...';

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            
            // ছবি আপলোড
            const storageRef = storage.ref(`users/${user.uid}/profile.jpg`);
            return storageRef.put(photoFile).then(() => {
                return storageRef.getDownloadURL();
            }).then(photoURL => {
                // Firestore-এ ডেটা সংরক্ষণ (ডিফল্ট স্ট্যাটাস 'Pending')
                return db.collection("users").doc(user.uid).set({
                    nameBn,
                    nameEn,
                    mobile,
                    email,
                    photoURL,
                    role: 'user',
                    status: 'Pending', 
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        })
        .then(() => {
            // নিবন্ধন সফল হলে লগইন পেজে অভিনন্দন বার্তা সহ রিডাইরেক্ট
             window.location.href = `login.html?reg_success=${encodeURIComponent(nameBn)}`;
        })
        .catch(error => {
            let errorMessage = 'নিবন্ধন ব্যর্থ হয়েছে: ' + error.message;
            if (error.code === 'auth/email-already-in-use') errorMessage = 'এই ইমেলটি ইতিমধ্যেই ব্যবহৃত হয়েছে।';
            messageEl.textContent = errorMessage;
            console.error("Registration Error:", error);
        });
}

// ** ২. ইউজার লগইন লজিক **
function handleLogin(e) {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    messageEl.textContent = 'লগইন প্রক্রিয়া চলছে...';

    auth.signInWithEmailAndPassword(loginId, password)
        .then(() => {
             // firebase-config.js এ রিডাইরেক্ট হবে
        })
        .catch(error => {
            let errorMessage = 'লগইন ব্যর্থ হয়েছে। ইমেল বা পাসওয়ার্ড ভুল।';
            messageEl.textContent = errorMessage;
            console.error("Login Error:", error);
        });
}

// ** ৩. সুপার অ্যাডমিন লগইন লজিক **
function handleSuperAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('sa-email').value;
    const password = document.getElementById('sa-password').value;
    const messageEl = document.getElementById('sa-login-message');
    messageEl.textContent = 'চেক করা হচ্ছে...';

    // লগইন প্রক্রিয়া
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // role চেক
            db.collection("users").doc(userCredential.user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'super_admin') {
                    window.location.href = 'super_admin_dashboard.html';
                } else {
                    messageEl.textContent = 'আপনার অ্যাডমিন অ্যাক্সেস নেই।';
                    auth.signOut(); // রোল অ্যাডমিন না হলে লগআউট করে দিন
                }
            });
        })
        .catch(error => {
            messageEl.textContent = 'সুপার অ্যাডমিন লগইন ব্যর্থ। ইমেল বা পাসওয়ার্ড ভুল।';
            console.error("Admin Login Error:", error);
        });
}


// ** ৪. লগআউট লজিক **
function handleLogout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch(error => {
        console.error("Logout Error:", error);
        alert("লগআউটে সমস্যা হয়েছে।");
    });
}
