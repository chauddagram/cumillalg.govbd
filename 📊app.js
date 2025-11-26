// firebase-config.js থেকে auth, db লোড করা হবে
document.addEventListener('DOMContentLoaded', () => {
    
    // --- ইউজার ড্যাশবোর্ড লজিক ---
    if (window.location.pathname.endsWith('dashboard.html')) {
        loadDashboardContent('orders'); 
        
        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection("users").doc(user.uid).get().then(doc => {
                    const userData = doc.data();
                    if (userData) {
                        document.getElementById('dashboard-title').textContent = `স্বাগতম, ${userData.nameBn || 'ব্যবহারকারী'}! | ড্যাশবোর্ড 📊`;
                    }
                });
            }
        });
    }

    // --- অ্যাডমিন ড্যাশবোর্ড লজিক ---
     if (window.location.pathname.endsWith('super_admin_dashboard.html')) {
        auth.onAuthStateChanged(user => {
            if (user) loadSuperAdminDashboard();
        });
    }
});


// ** অ্যাডমিন ড্যাশবোর্ড লোড লজিক **
function loadSuperAdminDashboard() {
    if (!currentUser) return;

    // ইউজার ম্যানেজমেন্ট এরিয়া
    const pendingUsersList = document.getElementById('pending-users-list');
    
    // Pending ইউজারদের Firestore থেকে রিয়েল-টাইমে লোড করুন
    db.collection("users").where("status", "==", "Pending").onSnapshot(snapshot => {
        let html = '<h4 class="text-lg font-bold mb-3">নতুন নিবন্ধনের জন্য অপেক্ষা করছে:</h4><ul class="space-y-3">';
        
        if (snapshot.empty) {
            html += '<p class="text-green-600">বর্তমানে কোনো Pending ইউজার নেই।</p>';
        } else {
            snapshot.forEach(doc => {
                const user = doc.data();
                html += `
                    <li class="p-3 bg-white rounded-lg shadow flex justify-between items-center border border-yellow-300">
                        <div>
                            <p class="font-semibold">${user.nameBn} (${user.email})</p>
                            <p class="text-sm text-gray-500">মোবাইল: ${user.mobile} | স্ট্যাটাস: ${user.status}</p>
                            <p class="text-xs text-gray-400">নিবন্ধনের তারিখ: ${user.createdAt ? user.createdAt.toDate().toLocaleDateString('bn-BD') : 'N/A'}</p>
                        </div>
                        <button onclick="activateUser('${doc.id}', '${user.nameBn}')" class="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700">
                            অ্যাক্টিভেট করুন
                        </button>
                    </li>
                `;
            });
        }
        html += '</ul>';
        pendingUsersList.innerHTML = html;
    }, error => {
         console.error("Error fetching pending users:", error);
         pendingUsersList.innerHTML = '<p class="text-red-500">ইউজার তালিকা লোড করতে ব্যর্থ হয়েছে। ফায়ারস্টোর রুলস চেক করুন।</p>';
    });
}

// ** ইউজার অ্যাক্টিভেট ফাংশন **
function activateUser(userId, userName) {
    if (confirm(`আপনি কি ${userName} -এর অ্যাকাউন্টটি সক্রিয় করতে চান?`)) {
        db.collection("users").doc(userId).update({
            status: "Active",
            //currentUser.email ব্যবহার করা হয়েছে যা firebase-config.js থেকে আসবে
            activatedBy: currentUser ? currentUser.email : 'Admin', 
            activatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert(`${userName} এর অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে!`);
        }).catch(error => {
            console.error("Activation failed:", error);
            alert("অ্যাক্টিভেশন ব্যর্থ হয়েছে।");
        });
    }
}


// ** ইউজার ড্যাশবোর্ড কন্টেন্ট লোড লজিক **
function loadDashboardContent(contentName) {
    const mainContent = document.getElementById('dashboard-main-content');
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(contentName)) {
            item.classList.add('active');
        }
    });

    let contentHTML = '';

    if (contentName === 'orders') {
        contentHTML = `
            <h2 class="text-3xl font-bold text-purple-700 mb-6">ইউজার ড্যাশবোর্ড</h2>
            
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p class="font-bold">** Account Verified & Secured</p>
                <p class="text-sm">অভিনন্দন। আপনার একাউন্ট ১০০% ভেরিফাইড এবং সক্রিয় আছে।</p>
            </div>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                <p class="font-bold">Notice (প্রধান অ্যাডমিন কর্তৃক)</p>
                <p class="text-sm">(সার্ভার কপি এবং সাইন থেকে সাভার কপি চালু করা হয়েছে। যাদের একাউন্ট  ২০০ টাকার কম তারা  রিচার্জ করুন। না হয় একাউন্ট বন্ধ করে দেওয়া হবে।)</p>
            </div>

            <h3 class="text-xl font-semibold text-gray-700 mb-4">**** অর্ডার স্ট্যাটাস লগ (Orders Logs)</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="p-3 bg-red-100 text-red-700 rounded-lg text-center shadow">Pending</div>
                <div class="p-3 bg-blue-100 text-blue-700 rounded-lg text-center shadow">Received</div>
                <div class="p-3 bg-green-100 text-green-700 rounded-lg text-center shadow">Delivered</div>
                <div class="p-3 bg-gray-100 text-gray-700 rounded-lg text-center shadow">Refunded</div>
            </div>
            
            <h3 class="text-2xl font-bold text-purple-700 mb-4 border-t pt-4">📋 নতুন অর্ডার ও সেবার তালিকা</h3>
            ${generateServiceListHTML(true)}
        `;
    } 
    else if (contentName === 'recharge') {
        contentHTML = `
            <h3 class="text-2xl font-bold text-purple-700 mb-4">৳ অ্যাকাউন্ট রিচার্জ</h3>
            <p class="text-red-500 mb-4 font-semibold">আপনার বর্তমান ব্যালেন্স: <span class="text-3xl text-red-700">৳ ০.০০</span></p>
            <div class="bg-gray-100 p-4 rounded-lg">
                <p>রিচার্জ করার ফর্ম বা পেমেন্ট গেটওয়ে ইন্টিগ্রেশন এর জন্য ডেটাবেস লজিক প্রয়োজন।</p>
            </div>
        `;
    } else if (contentName === 'account') {
        contentHTML = `
            <h3 class="text-2xl font-bold text-purple-700 mb-4">👤 অ্যাকাউন্ট সেটিংস</h3>
            <p class="text-gray-600">আপনার ব্যক্তিগত তথ্য: (Firebase থেকে লোড করা হবে)</p>
            <ul class="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>ইমেইল: ${auth.currentUser ? auth.currentUser.email : 'N/A'}</li>
                <li>স্ট্যাটাস: <span class="text-green-600 font-bold">Active</span> (অ্যাডমিন অনুমোদিত)</li>
                <li>ভূমিকা: <span class="text-blue-600 font-bold">User</span></li>
            </ul>
        `;
    }
    else {
         contentHTML = `<h3 class="text-2xl font-bold text-purple-700 mb-4">${contentName.toUpperCase()} পেজ</h3><p>এই কন্টেন্টটি তৈরির জন্য ডেটাবেস লজিক প্রয়োজন।</p>`;
    }
    
    mainContent.innerHTML = contentHTML;
}

function generateServiceListHTML(showOrderButton = false) {
    const services = [
        { name: "নাগরিক সনদ", price: "৫০" },
        { name: "চারিত্রিক সনদ", price: "৫০" },
        { name: "ওয়ারিশান সনদ", price: "১০০" },
        { name: "নতুন জন্ম নিবন্ধন মেক", price: "৪৫০" },
        { name: "জন্ম নিবন্ধন সংশোধন", price: "২০০" },
        { name: "জাতীয় পরিচয়পত্র সংশোধন", price: "৩৫০" },
        { name: "অনলাইনে টিআইএন নম্বর খোলা", price: "১০০" },
        { name: "PDF ফাইল টু Web URL Link Create", price: "৫০" },
        { name: "অন্যান্য প্রত্যয়ন পত্র", price: "🔴 সময় সাপেক্ষ" },
    ];

    let html = `<div class="overflow-x-auto"><table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead><tr class="bg-purple-100 text-purple-800">
                        <th class="py-3 px-4 text-left">ক্রমিক</th><th class="py-3 px-4 text-left">সেবার নাম</th>
                        <th class="py-3 px-4 text-right">মূল্য (৳)</th>
                        ${showOrderButton ? '<th class="py-3 px-4 text-center">আবেদন</th>' : ''}
                    </tr></thead><tbody>`;

    services.forEach((service, index) => {
        const priceClass = service.price.includes('সময় সাপেক্ষ') ? 'text-red-500 font-bold' : 'text-green-600 font-bold';
        html += `<tr class="border-b hover:bg-gray-50"><td class="py-3 px-4">${index + 1}.</td>
            <td class="py-3 px-4">${service.name}</td>
            <td class="py-3 px-4 text-right ${priceClass}">${service.price}</td>
            ${showOrderButton ? `<td class="py-3 px-4 text-center"><button class="bg-purple-500 text-white text-sm px-3 py-1 rounded hover:bg-purple-600" onclick="alert('অর্ডার ফর্ম লোড হবে: ${service.name}')">অর্ডার করুন</button></td>` : ''}
        </tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
        }
