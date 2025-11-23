// ফর্ম ভ্যালিডেশন এবং সাধারণ UI ফাংশনালিটি

document.addEventListener('DOMContentLoaded', function() {
    // সকল ফর্ম সিলেক্ট করুন
    const forms = document.querySelectorAll('form');
    
    // প্রতিটি ফর্মে ইভেন্ট লিসেনার যোগ করুন
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // ফর্ম ভ্যালিডেশন
            if (validateForm(this)) {
                // সফল ভ্যালিডেশন - ডেমো মেসেজ দেখান
                showAlert('ফর্ম সফলভাবে জমা হয়েছে!', 'success');
                
                // লগইন ফর্মের ক্ষেত্রে রিডাইরেক্ট
                if (this.id === 'loginForm' || this.id === 'adminLoginForm') {
                    setTimeout(() => {
                        // ডেমো উদ্দেশ্যে - বাস্তবে সার্ভার সাইড ভ্যালিডেশন প্রয়োজন
                        window.location.href = 'index.html';
                    }, 1500);
                }
                
                // রেজিস্ট্রেশন ফর্মের ক্ষেত্রে লগইন পেজে রিডাইরেক্ট
                if (this.id === 'registrationForm') {
                    setTimeout(() => {
                        window.location.href = 'user_login.html';
                    }, 1500);
                }
            }
        });
    });
    
    // পাসওয়ার্ড ভিজিবিলিটি টগল (যদি প্রয়োজন হয়)
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // পাসওয়ার্ড ম্যাচ ভ্যালিডেশন (রেজিস্ট্রেশন ফর্মে)
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        confirmPassword.addEventListener('input', function() {
            if (password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('পাসওয়ার্ড মেলে না');
            } else {
                confirmPassword.setCustomValidity('');
            }
        });
    }
});

// ফর্ম ভ্যালিডেশন ফাংশন
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            highlightError(input);
        } else {
            removeHighlight(input);
            
            // ইমেইল ভ্যালিডেশন
            if (input.type === 'email') {
                if (!isValidEmail(input.value)) {
                    isValid = false;
                    highlightError(input);
                    showAlert('দয়া করে একটি বৈধ ইমেইল ঠিকানা লিখুন', 'error');
                }
            }
            
            // মোবাইল নম্বর ভ্যালিডেশন
            if (input.name === 'mobile') {
                if (!isValidMobile(input.value)) {
                    isValid = false;
                    highlightError(input);
                    showAlert('দয়া করে একটি বৈধ মোবাইল নম্বর লিখুন', 'error');
                }
            }
        }
    });
    
    return isValid;
}

// ইমেইল ভ্যালিডেশন
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// মোবাইল নম্বর ভ্যালিডেশন (বাংলাদেশ)
function isValidMobile(mobile) {
    const mobileRegex = /^(?:\+88|01)?\d{11}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ''));
}

// এরর হাইলাইট ফাংশন
function highlightError(element) {
    element.classList.add('border-red-500');
    element.classList.remove('border-gray-300');
}

// এরর হাইলাইট রিমুভ ফাংশন
function removeHighlight(element) {
    element.classList.remove('border-red-500');
    element.classList.add('border-gray-300');
}

// অ্যালার্ট মেসেজ ফাংশন
function showAlert(message, type = 'info') {
    // বিদ্যমান অ্যালার্ট মুছে ফেলুন
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // নতুন অ্যালার্ট তৈরি করুন
    const alert = document.createElement('div');
    alert.className = `custom-alert fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    alert.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // 5 সেকেন্ড পরে অ্যালার্ট মুছে ফেলুন
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// সার্ভিস কার্ড ক্লিক হ্যান্ডলার
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card a');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // চেক করুন ব্যবহারকারী লগইন করেছে কিনা
            const isLoggedIn = false; // ডেমো উদ্দেশ্যে - বাস্তবে সেশন চেক করতে হবে
            
            if (!isLoggedIn) {
                e.preventDefault();
                showAlert('সেবা গ্রহণের জন্য দয়া করে লগইন করুন', 'warning');
                setTimeout(() => {
                    window.location.href = 'user_login.html';
                }, 2000);
            }
        });
    });
});