// --- Firebase Configuration ---
// এটি Firebase-এর সাথে আপনার ওয়েবসাইটকে সংযুক্ত করার জন্য প্রয়োজনীয়
const firebaseConfig = {
    apiKey: "AIzaSyDSjhi_l5fec76l6gbZjWea9qYIF8PyfgM",
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

// --- Utility Function: Custom Alert (System Alert-এর পরিবর্তে) ---
function customAlert(message) {
    // এখানে আপনি একটি কাস্টম modal/div দেখাতে পারেন, আপাতত console.log/alert ব্যবহার করছি
    alert(message);
    console.log("ALERT:", message);
}

// ------------------------------------------------------------------
// --- SUPER ADMIN LOGIC ---

// 🚨🚨🚨 নিরাপত্তা সতর্কতা: আপনার ব্যক্তিগত/অফিসিয়াল ইমেইল এবং শক্তিশালী পাসওয়ার্ড দিয়ে নিচের মান দুটি পরিবর্তন করুন 🚨🚨🚨
const SUPER_ADMIN_EMAIL = "আপনার_নতুন_ইমেইলtusarhasnbd@gmail.com"; // <--- এখানে পরিবর্তন করুন
const SUPER_ADMIN_PASS = "আপনার_নতুন_শক্তিশালী_পাসওয়ার্ড"M2hTusar@2025; // <--- এখানে পরিবর্তন করুন (উদাহরণ: M2hTusar@2025!)

/**
 * Super Admin login logic
 */
async function loginSuperAdmin() {
    const saId = document.getElementById('saId').value;
    const saPassword = document.getElementById('saPassword').value;
    const loginBtn = document.querySelector('#superAdminLoginForm button');

    if (saId !== SUPER_ADMIN_EMAIL || saPassword !== SUPER_ADMIN_PASS) {
        customAlert("ভুল ইউজার আইডি বা পাসওয়ার্ড।");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'প্রবেশ করা হচ্ছে...';

    let userCredential = null;
    let isNewUser = false;

    try {
        // ১. সাধারণ লগইন করার চেষ্টা
        userCredential = await auth.signInWithEmailAndPassword(saId, saPassword);

    } catch (error) {
        // ২. যদি ইউজার না পাওয়া যায়, তবে প্রথমবার অ্যাকাউন্ট তৈরি করার চেষ্টা
        if (error.code === 'auth/user-not-found') {
             try {
                // প্রথমবার ইউজার তৈরি করা হচ্ছে
                userCredential = await auth.createUserWithEmailAndPassword(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS);
                isNewUser = true;
                
             } catch (createError) {
                 customAlert("সুপার অ্যাডমিন অ্যাকাউন্ট তৈরি ও লগইন ব্যর্থ: " + createError.message);
                 console.error("সুপার অ্যাডমিন তৈরি ত্রুটি:", createError);
                 loginBtn.disabled = false;
                 loginBtn.textContent = 'প্রবেশ করুন (Super Admin) 🚨';
                 return;
             }

        } else {
            customAlert("লগইন ব্যর্থ: " + error.message);
            console.error("লগইন ত্রুটি:", error);
            loginBtn.disabled = false;
            loginBtn.textContent = 'প্রবেশ করুন (Super Admin) 🚨';
            return;
        }
    } 
    
    // ৩. সফল লগইন বা অ্যাকাউন্ট তৈরির পর ডেটাবেসে স্ট্যাটাস চেক/সেট করা
    if (userCredential && userCredential.user.email === SUPER_ADMIN_EMAIL) {
        const uid = userCredential.user.uid;
        
        if (isNewUser) {
            // নতুন ইউজার হলে Firestore-এ ডেটা সেট করা
            try {
                 await db.collection("users").doc(uid).set({
                    nameBn: "প্রধান অ্যাডমিন",
                    nameEn: "Super Admin",
                    email: SUPER_ADMIN_EMAIL,
                    role: "Super Admin",
                    status: "Approved",
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });
                customAlert("সুপার অ্যাডমিন অ্যাকাউন্ট তৈরি ও প্রবেশ সফল!");
            } catch (dbError) {
                 customAlert("Firestore-এ ডেটা সংরক্ষণ ব্যর্থ। তবুও লগইন চলছে।");
                 console.error("Firestore ত্রুটি:", dbError);
            }
        } else {
            customAlert("সুপার অ্যাডমিন হিসেবে সফলভাবে প্রবেশ করেছেন!");
        }

        // ৪. ড্যাশবোর্ডে রিডাইরেক্ট করা (এই লাইনটি এখন নিশ্চিতভাবে কার্যকর হবে)
        window.location.href = "super_admin_dashboard.html"; 
    } else {
        customAlert("আপনার ইউজার আইডি সুপার অ্যাডমিন নয়।");
        await auth.signOut();
        loginBtn.disabled = false;
        loginBtn.textContent = 'প্রবেশ করুন (Super Admin) 🚨';
    }
}

/**
 * Check if the current user is the Super Admin before loading the dashboard.
 */
function checkSuperAdminAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            if (user.email !== SUPER_ADMIN_EMAIL) {
                customAlert("আপনার এই ড্যাশবোর্ডে প্রবেশাধিকার নেই।");
                auth.signOut();
                window.location.href = "index.html";
            } else {
                fetchPendingApplications();
                fetchApprovedUsers();
            }
        } else {
            customAlert("প্রবেশাধিকার নেই। প্রথমে লগইন করুন।");
            window.location.href = "super_admin_login.html";
        }
    });
}

function superAdminLogout() {
    auth.signOut().then(() => {
        customAlert("সফলভাবে লগআউট করেছেন।");
        window.location.href = "index.html";
    }).catch((error) => {
        customAlert("লগআউট ব্যর্থ: " + error.message);
    });
}

/**
 * Fetch and display pending user applications in real-time.
 */
function fetchPendingApplications() {
    const listElement = document.getElementById('pendingApplicationsList');
    const countElement = document.getElementById('pendingApplicationsCount');

    db.collection("pending_applications").onSnapshot(snapshot => {
        listElement.innerHTML = '';
        let count = 0;
        
        if (snapshot.empty) {
            listElement.innerHTML = '<p class="text-green-600 font-semibold">এই মুহূর্তে কোনো পেন্ডিং আবেদন নেই। ✨</p>';
            countElement.textContent = `মোট পেন্ডিং আবেদন: 0`;
            return;
        }

        const table = document.createElement('table');
        table.className = "min-w-full bg-white pending-table";
        table.innerHTML = `
            <thead>
                <tr class="bg-gray-100">
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">ব্যবহারকারীর ধরন</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">নাম (বাংলায়)</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">মোবাইল/ইমেইল</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">আবেদনের তারিখ</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">অ্যাকশন</th>
                </tr>
            </thead>
            <tbody id="pendingTableBody"></tbody>
        `;
        listElement.appendChild(table);
        const tableBody = document.getElementById('pendingTableBody');

        snapshot.forEach(doc => {
            count++;
            const data = doc.data();
            const uid = doc.id;
            const submittedDate = data.submitted_at ? new Date(data.submitted_at.seconds * 1000).toLocaleDateString('bn-BD') : 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-4 font-medium">${data.role === 'General User' ? 'সাধারণ ব্যবহারকারী' : data.role}</td>
                <td class="py-3 px-4">${data.nameBn || data.nameEn}</td>
                <td class="py-3 px-4 text-sm">${data.mobile || data.email}</td>
                <td class="py-3 px-4 text-sm">${submittedDate}</td>
                <td class="py-3 px-4">
                    <button class="btn-approve text-sm" onclick="openDetailModal('${uid}', 'pending')">বিস্তারিত ও অনুমোদন</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        countElement.textContent = `মোট পেন্ডিং আবেদন: ${count}`;
    }, error => {
        console.error("Error fetching pending applications:", error);
        listElement.innerHTML = '<p class="text-red-500">ডাটা লোড করতে ব্যর্থ হয়েছে।</p>';
    });
}

/**
 * Super Admin: Approves a user application.
 * Moves user data from pending_applications to users collection.
 * @param {string} uid - Firebase Auth User ID
 * @param {object} userData - Data of the user application
 */
async function approveUser(uid, userData) {
    if (!confirm(`আপনি কি ${userData.nameBn} (${userData.role}) এর আবেদনটি অনুমোদন করতে চান? অনুমোদনের পরে ব্যবহারকারী তার সেট করা পাসওয়ার্ড দিয়ে লগইন করতে পারবে।`)) return;

    try {
        // ১. অনুমোদিত ইউজার ডেটা তৈরি
        const approvedData = {
            ...userData,
            status: "Approved",
            approved_by_admin: auth.currentUser.email,
            approved_at: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // ২. ট্রানজেকশন শুরু: একই সাথে একাধিক অপারেশন করা
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection("users").doc(uid);
            const pendingRef = db.collection("pending_applications").doc(uid);

            // ক. নতুন অনুমোদিত ইউজারকে 'users' কালেকশনে সেট করা
            transaction.set(userRef, approvedData);

            // খ. 'pending_applications' কালেকশন থেকে আবেদনটি মুছে ফেলা
            transaction.delete(pendingRef);
        });

        customAlert(`✅ সফল! ${userData.nameBn} এখন একজন সক্রিয় ${userData.role} হিসেবে অনুমোদিত হয়েছেন। তিনি এখন তার নিবন্ধিত পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।`);
        closeDetailModal();

    } catch (error) {
        customAlert(`অনুমোদন ব্যর্থ হয়েছে: ${error.message}`);
        console.error("অনুমোদন ত্রুটি:", error);
    }
}

/**
 * Super Admin: Rejects a user application.
 * Deletes the pending application document.
 * @param {string} uid - Firebase Auth User ID
 * @param {object} userData - Data of the user application
 */
async function rejectUser(uid, userData) {
     if (!confirm(`আপনি কি নিশ্চিত যে আপনি ${userData.nameBn} এর আবেদনটি বাতিল করতে চান? এটি মুছে ফেলা হবে এবং ইউজারকে পুনরায় আবেদন করতে হবে।`)) return;

     try {
        await db.collection("pending_applications").doc(uid).delete();
        customAlert(`❌ সফলভাবে বাতিল করা হয়েছে! ${userData.nameBn} এর আবেদন বাতিল করা হলো।`);
        closeDetailModal();

     } catch (error) {
        customAlert(`বাতিলকরণ ব্যর্থ হয়েছে: ${error.message}`);
        console.error("বাতিলকরণ ত্রুটি:", error);
     }
}

// ------------------------------------------------------------------
// --- Approved Users & Role Management ---

/**
 * Fetch and display approved users.
 */
function fetchApprovedUsers() {
    const listElement = document.getElementById('approvedUsersList');
    
    db.collection("users").onSnapshot(snapshot => {
        listElement.innerHTML = '';
        if (snapshot.empty) {
            listElement.innerHTML = '<p class="text-gray-500">কোনো অনুমোদিত ব্যবহারকারী নেই।</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = "min-w-full bg-white pending-table";
        table.innerHTML = `
            <thead>
                <tr class="bg-gray-100">
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">নাম</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">রোল</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">ইমেইল</th>
                    <th class="py-3 px-4 font-semibold text-sm text-gray-600">অ্যাকশন</th>
                </tr>
            </thead>
            <tbody id="approvedTableBody"></tbody>
        `;
        listElement.appendChild(table);
        const tableBody = document.getElementById('approvedTableBody');

        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;
            
            if (data.role === 'Super Admin') return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-4 font-medium">${data.nameBn || data.nameEn}</td>
                <td class="py-3 px-4">${data.role}</td>
                <td class="py-3 px-4 text-sm">${data.email}</td>
                <td class="py-3 px-4">
                    <button class="text-blue-500 hover:text-blue-700 text-sm mr-4" onclick="openDetailModal('${uid}', 'approved')">রোল পরিবর্তন</button>
                    <button class="text-red-500 hover:text-red-700 text-sm" onclick="sendPasswordReset('${data.email}')">পাসওয়ার্ড রিসেট</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

/**
 * Sends a password reset email to the specified user.
 * @param {string} email - User's email address
 */
async function sendPasswordReset(email) {
    if (!confirm(`আপনি কি নিশ্চিত যে আপনি ${email} এই ইমেইল অ্যাড্রেসে পাসওয়ার্ড রিসেট লিংক পাঠাতে চান?`)) return;
    
    try {
        await auth.sendPasswordResetEmail(email);
        customAlert(`সফল! ${email} এ পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।`);
    } catch (error) {
        customAlert(`পাসওয়ার্ড রিসেট লিংক পাঠাতে ব্যর্থ: ${error.message}`);
        console.error("পাসওয়ার্ড রিসেট ত্রুটি:", error);
    }
}


/**
 * Super Admin: Function to open a modal with user details and action buttons.
 */
async function openDetailModal(uid, type) {
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    const collectionName = type === 'pending' ? 'pending_applications' : 'users';

    try {
        const doc = await db.collection(collectionName).doc(uid).get();
        if (!doc.exists) {
            customAlert("ব্যবহারকারীর ডেটা পাওয়া যায়নি।");
            return;
        }
        const data = doc.data();
        const userName = data.nameBn || data.nameEn || 'N/A';
        
        modalTitle.textContent = `${userName} এর বিস্তারিত তথ্য`;

        let contentHTML = `
            <p><strong>ভূমিক/রোল:</strong> ${data.role}</p>
            <p><strong>ইমেইল:</strong> ${data.email}</p>
            <p><strong>মোবাইল:</strong> ${data.mobile || 'N/A'}</p>
            <p><strong>জাতীয় পরিচয়পত্র:</strong> ${data.nid || 'N/A'}</p>
            ${data.office ? `<p><strong>অফিস:</strong> ${data.office}</p>` : ''}
            ${data.upazila ? `<p><strong>উপজেলা/পৌরসভা:</strong> ${data.upazila}</p>` : ''}
            <p><strong>বর্তমান ঠিকানা:</strong> ${data.currentAddress || 'N/A'}</p>
        `;
        modalContent.innerHTML = contentHTML;

        let actionsHTML = '';
        if (type === 'pending') {
            actionsHTML = `
                <button class="btn-approve" onclick='approveUser("${uid}", ${JSON.stringify(data)})'>✅ অনুমোদন করুন</button>
                <button class="btn-reject" onclick='rejectUser("${uid}", ${JSON.stringify(data)})'>❌ বাতিল করুন</button>
            `;
        } else if (type === 'approved') {
            // রোল পরিবর্তন ও পাসওয়ার্ড রিসেট অপশন
            actionsHTML = `
                <p class="text-left font-semibold mb-2">রোল পরিবর্তন:</p>
                <select id="roleSelector" class="w-full p-2 border rounded">
                    <option value="General User" ${data.role === 'General User' ? 'selected' : ''}>সাধারণ ব্যবহারকারী</option>
                    <option value="Control-Admin" ${data.role === 'Control-Admin' ? 'selected' : ''}>কন্ট্রোল অ্যাডমিন</option>
                    <option value="Sub-Admin" ${data.role === 'Sub-Admin' ? 'selected' : ''}>সাব-অ্যাডমিন</option>
                </select>
                <div class="mt-4 flex justify-between">
                    <button class="btn-reject bg-gray-500 hover:bg-gray-700 w-1/2 mr-2" onclick='sendPasswordReset("${data.email}")'>🔑 পাসওয়ার্ড রিসেট লিংক পাঠান</button>
                    <button class="btn-approve w-1/2" onclick='updateUserRole("${uid}")'>রোল আপডেট করুন</button>
                </div>
            `;
        }
        modalActions.innerHTML = actionsHTML;
        modal.classList.remove('hidden');

    } catch (error) {
        customAlert("ডেটা লোড করতে সমস্যা হয়েছে: " + error.message);
        console.error("Detail Modal Error:", error);
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

/**
 * Super Admin: Update the role of an approved user.
 * @param {string} uid - Firebase Auth User ID
 */
async function updateUserRole(uid) {
    const newRole = document.getElementById('roleSelector').value;
    
    if (!confirm(`আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীর রোল "${newRole}" এ পরিবর্তন করতে চান?`)) return;

    try {
        await db.collection("users").doc(uid).update({
            role: newRole,
            role_updated_at: firebase.firestore.FieldValue.serverTimestamp(),
            role_updated_by: auth.currentUser.email
        });
        customAlert(`✅ সফল! ব্যবহারকারীর রোল সফলভাবে "${newRole}" এ আপডেট হয়েছে।`);
        closeDetailModal();

    } catch (error) {
        customAlert(`রোল আপডেট ব্যর্থ হয়েছে: ${error.message}`);
        console.error("রোল আপডেট ত্রুটি:", error);
    }
}


// ------------------------------------------------------------------
// --- Standard Login/Registration Functions ---

/**
 * Check Auth Status and Redirect (Standard Users/Admins)
 */
async function checkAuthStatusAndRedirect(user, role) {
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists || userDoc.data().status !== "Approved") {
        customAlert("আপনার অ্যাকাউন্ট এখনো অনুমোদিত/সক্রিয় হয়নি। অনুগ্রহ করে অপেক্ষা করুন।");
        await auth.signOut();
        return;
    }

    const userData = userDoc.data();
    
    if (userData.status === "Approved") {
        if (userData.role.includes("Admin")) {
            window.location.href = "admin_dashboard.html"; 
        } else if (userData.role === "General User") {
            window.location.href = "user_dashboard.html"; 
        } else {
            customAlert("আপনার ভূমিকা (Role) সনাক্ত করা যায়নি। কর্তৃপক্ষের সাথে যোগাযোগ করুন।");
            await auth.signOut();
        }
    } else {
        customAlert("আপনার অ্যাকাউন্টের অবস্থা সক্রিয় নয়। কর্তৃপক্ষের সাথে যোগাযোগ করুন।");
        await auth.signOut();
    }
}

// লগইন লজিক
async function performLogin(email, password, loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'প্রবেশ করা হচ্ছে...';

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        const pendingDoc = await db.collection("pending_applications").doc(user.uid).get();
        if (pendingDoc.exists) {
             customAlert("আপনার অ্যাকাউন্ট এখনো অনুমোদনের জন্য অপেক্ষা করছে। অনুমোদন পেলে আপনি প্রবেশ করতে পারবেন।");
             await auth.signOut();
             return;
        }
        
        await checkAuthStatusAndRedirect(user, null);

    } catch (error) {
        customAlert("লগইন ব্যর্থ: " + error.message);
        console.error("লগইন ত্রুটি:", error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'প্রবেশ করুন 🚀';
    }
}

function loginAdmin() {
    const adminId = document.getElementById('adminId').value;
    const adminPassword = document.getElementById('adminPassword').value;
    const loginBtn = document.querySelector('#adminLoginForm button');
    if (!adminId || !adminPassword) { customAlert("দয়া করে ইউজার আইডি এবং পাসওয়ার্ড লিখুন।"); return; }
    
    performLogin(adminId, adminPassword, loginBtn);
}

function loginUser() {
    const userId = document.getElementById('userId').value;
    const userPassword = document.getElementById('userPassword').value;
    const loginBtn = document.querySelector('#userLoginForm button');
    if (!userId || !userPassword) { customAlert("দয়া করে ইউজার আইডি এবং পাসওয়ার্ড লিখুন।"); return; }

    performLogin(userId, userPassword, loginBtn);
}


// --- Registration Functions (Included for completeness) ---

function goToStep2() {
    const nameBn = document.getElementById('nameBn').value;
    const nameEn = document.getElementById('nameEn').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    const nid = document.getElementById('nid').value;
    const accountType = document.getElementById('accountType').value;

    if (!nameBn || !nameEn || !mobile || !password || !nid || !accountType) {
        customAlert("অনুগ্রহ করে ধাপ ১ এর তারকা চিহ্নিত সকল ঘর পূরণ করুন।");
        return false;
    }

    if (nid.length !== 10 && nid.length !== 17) {
        customAlert("জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০ বা ১৭ ডিজিটের হতে হবে।");
        return false;
    }
    if (mobile.length !== 11) {
        customAlert("মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।");
        return false;
    }
    if (password.length < 6) {
        customAlert("পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।");
        return false;
    }
    if (accountType === "") {
        customAlert("অনুগ্রহ করে অ্যাকাউন্টের ধরন নির্বাচন করুন।");
        return false;
    }

    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    return true;
}

function togglePermanentAddress() {
    const isChecked = document.getElementById('sameAsCurrent').checked;
    const permAddrField = document.getElementById('permanentAddressFields');
    const permAddrInput = document.getElementById('permanentAddress');

    if (permAddrField && permAddrInput) {
        permAddrField.style.display = isChecked ? 'none' : 'block';
        permAddrInput.required = !isChecked;
    }
}

function submitSubAdminRegistration() {
    const nameBn = document.getElementById('nameBn').value;
    const mobile = document.getElementById('mobile').value;
    const nid = document.getElementById('nid').value;
    const password = document.getElementById('password').value;
    const office = document.getElementById('office').value;
    const currentAddress = document.getElementById('currentAddress').value;
    const upazila = document.getElementById('upazila').value;

    if (!office || !upazila || !currentAddress) {
        customAlert("অনুগ্রহ করে ধাপ ২ এর তারকা চিহ্নিত সকল তথ্য পূরণ করুন।");
        return;
    }
    const permAddressInput = document.getElementById('permanentAddress');
    if (document.getElementById('sameAsCurrent').checked === false && (!permAddressInput || !permAddressInput.value)) {
         customAlert("অনুগ্রহ করে স্থায়ী ঠিকানা পূরণ করুন।");
         return;
    }
    
    const email = mobile + "@" + nid + ".com"; 

    const regData = {
        nameBn: nameBn,
        nameEn: document.getElementById('nameEn').value,
        nid: nid,
        mobile: mobile,
        email: email,
        role: document.getElementById('accountType').value,
        office: office,
        currentAddress: currentAddress,
        upazila: upazila,
        district: 'কুমিল্লা',
        permanentAddress: document.getElementById('sameAsCurrent').checked 
            ? currentAddress
            : (permAddressInput ? permAddressInput.value : null),
        
        status: "Pending", 
        submitted_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const submitBtn = document.querySelector('#step2 button');
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'নিবন্ধন হচ্ছে...';
    }


    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const uid = userCredential.user.uid;
            return db.collection("pending_applications").doc(uid).set(regData);
        })
        .then(() => {
            customAlert(`✨ অভিনন্দন! ${nameBn.toUpperCase()} - আপনার আবেদন এখন M²H. TUSAR _ COMPUTECH কর্তৃপক্ষের নিকট অনুমোদনের জন্য অপেক্ষা করছে। অ্যাকাউন্টি অনুমোদিত/সক্রিয় হলে আপনাকে ইমেল বা মোবাইল নম্বরে মেসেজ পেরন করা হবে।`);
            window.location.href = "index.html"; 
        })
        .catch((error) => {
            customAlert("নিবন্ধন ব্যর্থ: " + error.message);
            console.error("নিবন্ধন ত্রুটি:", error);
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'নিবন্ধন করুন ✅';
            }
        });
}

function submitUserRegistration() {
    const nameBn = document.getElementById('userNameBn').value;
    const nameEn = document.getElementById('userNameEn').value;
    const mobile = document.getElementById('userMobile').value;
    const nid = document.getElementById('userNid').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const dob = `${document.getElementById('dobYear').value}-${document.getElementById('dobMonth').value}-${document.getElementById('dobDay').value}`;

    if (!nameBn || !nameEn || !mobile || !nid || !email || !password || dob.includes("")) {
        customAlert("অনুগ্রহ করে তারকা চিহ্নিত সকল ঘর পূরণ করুন।");
        return;
    }
    if (nid.length !== 10 && nid.length !== 17) {
        customAlert("জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০ বা ১৭ ডিজিটের হতে হবে।");
        return;
    }
    if (mobile.length !== 11) {
        customAlert("মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।");
        return;
    }
    if (password.length < 6) {
        customAlert("পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।");
        return;
    }

    const regData = {
        nameBn: nameBn,
        nameEn: nameEn,
        nid: nid,
        mobile: mobile,
        email: email,
        dob: dob,
        role: "General User",
        status: "Pending",
        submitted_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    const submitBtn = document.querySelector('#userRegForm button');
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'নিবন্ধন হচ্ছে...';
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const uid = userCredential.user.uid;
            return db.collection("pending_applications").doc(uid).set(regData);
        })
        .then(() => {
            customAlert(`✨ অভিনন্দন! ${nameBn.toUpperCase()} - আপনার আবেদন এখন M²H. TUSAR _ COMPUTECH কর্তৃপক্ষের নিকট অনুমোদনের জন্য অপেক্ষা করছে। অ্যাকাউন্টি অনুমোদিত/সক্রিয় হলে আপনাকে ইমেল বা মোবাইল নম্বরে মেসেজ পেরন করা হবে।`);
            window.location.href = "index.html";
        })
        .catch((error) => {
            customAlert("নিবন্ধন ব্যর্থ: " + error.message);
            console.error("নিবন্ধন ত্রুটি:", error);
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'নিবন্ধন করুন ✅';
            }
        });
}