// app.js - মূল অ্যাপ্লিকেশন লজিক
import { 
    signInAnonymously, signInWithCustomToken, onAuthStateChanged, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    signOut, sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, 
    onSnapshot, collection, query, where, getDocs, 
    setLogLevel, serverTimestamp, orderBy, limit 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase instances
const auth = window.firebaseAuth;
const db = window.firebaseDb;
const appId = window.appId;
const serviceList = window.serviceList;

// কোর অ্যাপ্লিকেশন লজিক
const App = {
    db: db,
    auth: auth,
    state: {
        userId: null,
        isAuthReady: false,
        currentView: 'loading',
        isLoading: false,
        error: null,
        userProfile: null,
        orders: [],
        notice: "সিস্টেম নোটিশ লোড হচ্ছে...",
        isSidebarOpen: false,
        registrationData: {
            email: null,
            name: null,
        }
    },

    // ফায়ারস্টোর কালেকশন রেফারেন্স
    COLLECTIONS: {
        USER_PROFILES: (uid) => doc(db, `/artifacts/${appId}/public/data/user_profiles`, uid),
        ORDERS: (uid) => collection(db, `/artifacts/${appId}/users/${uid}/orders`),
        CONFIG: doc(db, `/artifacts/${appId}/public/data/config`, 'site_notice'),
    },

    // ইউটিলিটি: টোস্ট নোটিফিকেশন দেখানো
    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const colorMap = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        const toast = document.createElement('div');
        toast.className = `${colorMap[type]} text-white px-4 py-3 rounded-lg shadow-xl mb-2 transition-all duration-300 transform translate-x-full opacity-0`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        }, 10);

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            toast.classList.remove('translate-x-0', 'opacity-100');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // অ্যাপ্লিকেশন শুরু করার ফাংশন
    async init() {
        try {
            setLogLevel('debug');
            
            if (window.initialAuthToken) {
                await signInWithCustomToken(auth, window.initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }

            onAuthStateChanged(auth, async (user) => {
                App.state.userId = user ? user.uid : null;
                App.state.isAuthReady = true;
                
                if (user && !user.isAnonymous) {
                    await App.loadUserProfile(user.uid);
                    if (App.state.userProfile && App.state.userProfile.status === 'Active') {
                        App.loadDashboardData(user.uid);
                        App.changeView('dashboard');
                    } else {
                        App.showToast("আপনার অ্যাকাউন্টটি এখনও Super Admin দ্বারা সক্রিয় করা হয়নি। অনুগ্রহ করে অপেক্ষা করুন।", 'warning');
                        await signOut(auth);
                        App.changeView('login');
                    }
                } else {
                    App.changeView('home');
                }
            });

        } catch (error) {
            console.error("Firebase/App Initialization Error:", error);
            App.state.error = 'সিস্টেম লোড করতে সমস্যা হচ্ছে। কনফিগারেশন চেক করুন।';
            App.changeView('home'); 
        }
    },

    // ইউজার প্রোফাইল লোড করা
    async loadUserProfile(uid) {
        try {
            const userDocRef = App.COLLECTIONS.USER_PROFILES(uid);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
                App.state.userProfile = docSnap.data();
            } else {
                App.state.userProfile = null;
                console.warn("User profile not found in Firestore for UID:", uid);
            }
        } catch (e) {
            console.error("Error loading user profile:", e);
            App.showToast("প্রোফাইল ডেটা লোড করতে ব্যর্থ।", 'error');
        }
    },

    // ড্যাশবোর্ডের ডেটা লোড করা
    loadDashboardData(uid) {
        onSnapshot(App.COLLECTIONS.CONFIG, (docSnap) => {
            if (docSnap.exists() && docSnap.data().text) {
                App.state.notice = docSnap.data().text;
                App.render();
            }
        }, (error) => console.error("Notice listener error:", error));

        onSnapshot(query(App.COLLECTIONS.ORDERS(uid)), (snapshot) => {
            App.state.orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            App.render();
        }, (error) => console.error("Orders listener error:", error));
    },
    
    // নতুন ইউজার রেজিস্ট্রেশন
    async handleRegister(e) {
        e.preventDefault();
        App.state.error = null;
        App.state.isLoading = true;
        App.render();

        const form = e.target;
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const fullNameBn = form.fullNameBn.value.trim();
        const fullNameEn = form.fullNameEn.value.trim();
        const mobile = form.mobile.value.trim();
        const photoFile = form.photo.files[0];
        
        if (password !== confirmPassword) {
            App.state.error = "পাসওয়ার্ড নিশ্চিতকরণ মেলেনি।";
            App.state.isLoading = false;
            App.render();
            return;
        }

        if (photoFile && photoFile.size > 500000) {
            App.state.error = "ছবির ফাইল সাইজ 500KB-এর কম হতে হবে।";
            App.state.isLoading = false;
            App.render();
            return;
        }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            let photoDataUrl = null;
            if (photoFile) {
                photoDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsDataURL(photoFile);
                });
            }

            await setDoc(App.COLLECTIONS.USER_PROFILES(user.uid), {
                fullNameBn,
                fullNameEn,
                email,
                mobile,
                photoDataUrl,
                status: 'Pending',
                balance: 0,
                createdAt: serverTimestamp(),
                userId: user.uid
            });
            
            App.state.registrationData.email = email;
            App.state.registrationData.name = fullNameBn;

            await signOut(auth); 
            
            App.showToast("নিবন্ধন সফল! অনুমোদনের জন্য অপেক্ষা করুন।", 'success');
            App.changeView('registrationSuccess');
            
        } catch (error) {
            console.error("Registration Error:", error);
            let errorMessage = 'নিবন্ধনে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'এই ইমেইল আইডিটি ইতিমধ্যেই ব্যবহার করা হয়েছে।';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।';
            }
            
            App.state.error = errorMessage;
            App.state.isLoading = false;
            App.render();
        }
    },
    
    // ইউজার লগইন
    async handleLogin(e) {
        e.preventDefault();
        App.state.error = null;
        App.state.isLoading = true;
        App.render();

        const form = e.target;
        const emailOrMobile = form.username.value.trim();
        const password = form.password.value;
        
        try {
            await signInWithEmailAndPassword(auth, emailOrMobile, password);
        } catch (error) {
            console.error("Login Error:", error);
            let errorMessage = 'ভুল ইমেইল আইডি বা পাসওয়ার্ড।';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'এই অ্যাকাউন্টটি রেজিস্টার করা নেই।';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'পাসওয়ার্ডটি ভুল দেওয়া হয়েছে।';
            } else if (error.code === 'auth/invalid-email') {
                 errorMessage = 'দয়া করে একটি বৈধ ইমেইল আইডি দিন।';
            }
            
            App.state.error = errorMessage;
            App.state.isLoading = false;
            App.render();
        }
    },
    
    // পাসওয়ার্ড রিসেট
    async handlePasswordReset(e) {
        e.preventDefault();
        App.state.error = null;
        App.state.isLoading = true;
        App.render();

        const email = document.getElementById('reset-email').value.trim();
        
        try {
            await sendPasswordResetEmail(auth, email);
            App.showToast(`পাসওয়ার্ড রিসেট লিংক ${email} ঠিকানায় পাঠানো হয়েছে।`, 'success');
            App.changeView('login');
        } catch (error) {
            console.error("Password Reset Error:", error);
            App.state.error = 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে। ইমেইলটি সঠিক কিনা দেখুন।';
            App.render();
        } finally {
            App.state.isLoading = false;
            App.render();
        }
    },

    // নতুন অর্ডার তৈরি
    async handleOrderSubmission(serviceName, price) {
        if (!App.state.userId) {
            App.showToast("অর্ডার দিতে হলে প্রথমে লগইন করুন।", 'error');
            return;
        }
        
        if (App.state.userProfile.balance < price) {
            App.showToast(`আপনার অ্যাকাউন্টে ${price} টাকা নেই। রিচার্জ করুন।`, 'error');
            return;
        }

        App.state.isLoading = true;
        App.render();

        try {
            await addDoc(App.COLLECTIONS.ORDERS(App.state.userId), {
                userId: App.state.userId,
                serviceName: serviceName,
                price: price,
                status: 'Pending',
                orderDate: serverTimestamp(),
            });

            const newBalance = App.state.userProfile.balance - price;
            await updateDoc(App.COLLECTIONS.USER_PROFILES(App.state.userId), {
                balance: newBalance
            });
            
            App.state.userProfile.balance = newBalance;
            
            App.showToast(`অর্ডার (${serviceName}) সফলভাবে জমা হয়েছে। আপনার ব্যালেন্স থেকে ${price} টাকা কেটে নেওয়া হয়েছে।`, 'success');
        } catch (e) {
            console.error("Order submission error:", e);
            App.showToast("অর্ডার জমা দিতে সমস্যা হয়েছে।", 'error');
        } finally {
            App.state.isLoading = false;
            App.render();
        }
    },
    
    // লগআউট
    async handleLogout() {
        try {
            await signOut(auth);
            App.state.userProfile = null;
            App.state.orders = [];
            App.showToast("সফলভাবে লগআউট করা হয়েছে।", 'info');
            App.changeView('home');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },
    
    // ভিউ পরিবর্তন
    changeView(view) {
        App.state.currentView = view;
        App.state.error = null;
        App.state.isLoading = false;
        App.state.isSidebarOpen = false;
        App.render();
    },
    
    // সাইডবার টগল
    toggleSidebar() {
        App.state.isSidebarOpen = !App.state.isSidebarOpen;
        App.render();
    },

    // স্ট্যাটাস ব্যাজ রেন্ডার
    renderStatusBadge(status) {
        let colorClass = 'bg-gray-200 text-gray-800';
        let textBn = status;
        
        switch (status) {
            case 'Pending':
                colorClass = 'bg-yellow-100 text-yellow-800';
                textBn = 'বিচারাধীন';
                break;
            case 'Received':
                colorClass = 'bg-blue-100 text-blue-800';
                textBn = 'গ্রহণ করা হয়েছে';
                break;
            case 'Delivered':
                colorClass = 'bg-green-100 text-green-800';
                textBn = 'সরবরাহ করা হয়েছে';
                break;
            case 'Refunded':
                colorClass = 'bg-red-100 text-red-800';
                textBn = 'ফেরত দেওয়া হয়েছে';
                break;
            case 'Active':
                colorClass = 'bg-primary text-white';
                textBn = 'সক্রিয়';
                break;
            default:
                break;
        }
        return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${colorClass}">${textBn}</span>`;
    },
    
    // DOM রেন্ডার
    render() {
        const appContainer = document.getElementById('app');
        
        if (!App.state.isAuthReady && App.state.currentView === 'loading') {
            appContainer.innerHTML = App.renderLoadingScreen();
            return;
        }
        
        let viewHtml = '';
        switch(App.state.currentView) {
            case 'home':
                viewHtml = App.renderHome();
                break;
            case 'register':
                viewHtml = App.renderRegister();
                break;
            case 'registrationSuccess':
                viewHtml = App.renderRegistrationSuccess();
                break;
            case 'login':
                viewHtml = App.renderLogin();
                break;
            case 'forgotPassword':
                viewHtml = App.renderForgotPassword();
                break;
            case 'dashboard':
                viewHtml = App.renderDashboard();
                break;
            case 'orderService':
                viewHtml = App.renderOrderService();
                break;
            case 'recharge':
                viewHtml = App.renderRecharge();
                break;
            case 'support':
                viewHtml = App.renderSupport();
                break;
            case 'fileList':
                viewHtml = App.renderFileList();
                break;
            case 'account':
                viewHtml = App.renderAccount();
                break;
            default:
                viewHtml = App.renderHome();
        }

        appContainer.innerHTML = viewHtml;

        // ইভেন্ট লিসেনার যুক্ত করা
        document.getElementById('register-form')?.addEventListener('submit', (e) => App.handleRegister(e));
        document.getElementById('login-form')?.addEventListener('submit', (e) => App.handleLogin(e));
        document.getElementById('reset-form')?.addEventListener('submit', (e) => App.handlePasswordReset(e));
        document.getElementById('toggle-sidebar')?.addEventListener('click', () => App.toggleSidebar());
        document.getElementById('menu-overlay')?.addEventListener('click', () => App.toggleSidebar());
        document.getElementById('logout-btn-sidebar')?.addEventListener('click', () => App.handleLogout());

        document.querySelectorAll('[data-menu]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                App.changeView(e.currentTarget.dataset.menu);
            });
        });
        
        document.querySelectorAll('[data-order-service]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceName = e.currentTarget.dataset.name;
                const price = parseFloat(e.currentTarget.dataset.price);
                App.handleOrderSubmission(serviceName, price);
            });
        });
    },
    
    // --- ভিউ রেন্ডারিং ফাংশনসমূহ ---
    // [এখানে আপনার সব render ফাংশনগুলো থাকবে - Home, Register, Login, Dashboard ইত্যাদি]
    // এই অংশগুলো আপনার মূল কোড থেকে কপি করে নিন
    
    renderLoadingScreen() {
        return `
            <div class="flex flex-col justify-center items-center h-screen text-gray-600 bg-white">
                <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-4 text-lg text-primary font-semibold">সিস্টেম লোড হচ্ছে...</p>
            </div>
        `;
    },
    
    renderHome() {
        return `
            <div class="min-h-screen">
                <div class="hero-bg text-center rounded-b-3xl shadow-xl">
                    <h1 class="text-3xl font-extrabold mb-2 leading-tight">
                        ✨ কুমিল্লা জেলা ইউনিট – অনলাইন সেবা হেল্পডেস্ক 🌐
                    </h1>
                    <p class="text-lg font-medium text-secondary mb-4">
                        ✨ Comilla District Unit – Online Service Helpdesk 🌐
                    </p>
                    <p class="text-xl font-semibold mb-2">💡 ডিজিটাল সেবায় কুমিল্লার নতুন সম্ভাবনা 🚀</p>
                    <p class="text-md font-medium mb-1">🤝 সহজ সেবা — সবার জন্য, সবসময় ✨</p>
                    <p class="text-md font-medium">⚡ দ্রুত, সহজ, নির্ভরযোগ্য অনলাইন সহায়তা 🛡️</p>
                    <div class="mt-6 flex justify-center space-x-4">
                        <button onclick="App.changeView('register')" class="px-6 py-3 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-150 flex items-center">
                            <svg class="icon-lg mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-1v-4H8V9h3v8zM12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            নিবন্ধন ✍️
                        </button>
                        <button onclick="App.changeView('login')" class="px-6 py-3 bg-primary text-white border border-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-150 flex items-center">
                            <svg class="icon-lg mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 11c1.66 0 2.99-1.34 2.99-3S13.66 5 12 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                            লগইন 🔑
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">মূল লক্ষ্য ও উদ্দেশ্য</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="card bg-white p-4 rounded-xl shadow-md border-t-2 border-primary">
                            <p class="font-bold text-lg text-primary">নাগরিক সেবা সহজীকরণ</p>
                            <p class="text-sm text-gray-600">গ্রামীণ জনগণের জন্য ডিজিটাল প্ল্যাটফর্মের সহজলভ্যতা নিশ্চিত করা এবং সনাতন পদ্ধতির জটিলতা হ্রাস করা।</p>
                        </div>
                        <div class="card bg-white p-4 rounded-xl shadow-md border-t-2 border-primary">
                            <p class="font-bold text-lg text-primary">ডিজিটাল বাংলাদেশের লক্ষ্যপূরণ</p>
                            <p class="text-sm text-gray-600">স্থানীয় প্রশাসনকে একটি কার্যকর, সুরক্ষিত ডিজিটাল টুল সরবরাহ করে উন্নয়নকে ত্বরান্বিত করা।</p>
                        </div>
                    </div>

                    <h3 class="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">প্রযুক্তিগত ভিত্তি</h3>
                    <div class="bg-gray-100 p-4 rounded-xl shadow-inner text-sm text-gray-700">
                        <p class="mb-1"><span class="font-semibold text-primary">ওয়েবসাইট:</span> <a href="https://chauddagram.github.io/cumillalg.govbd/" target="_blank" class="text-blue-500 hover:underline">https://chauddagram.github.io/cumillalg.govbd/</a></p>
                        <p class="mb-1"><span class="font-semibold text-primary">ফ্রন্টএন্ড:</span> GitHub Pages (HTML/JS/Tailwind CSS)</p>
                        <p><span class="font-semibold text-primary">ব্যাকএন্ড/নিরাপত্তা:</span> Google Firebase (Authentication & Firestore Database)</p>
                    </div>
                </div>

                <footer class="text-center py-4 text-xs text-gray-500 bg-white border-t mt-4">
                    <p>© MD. MUHSINUL HASAN TUSAR. ${new Date().getFullYear()} সকল স্বত্ব সংরক্ষিত।</p>
                    <p class="mt-1">Super Admin/Owner: MD. MUHSINUL HASAN TUSAR</p>
                </footer>
            </div>
        `;
    },
    
    // বাকি render ফাংশনগুলো আপনার মূল কোড থেকে কপি করুন
    // renderRegister(), renderLogin(), renderDashboard(), ইত্যাদি
};

// অ্যাপ্লিকেশন শুরু করা
window.App = App;
window.onload = () => App.init();
