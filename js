<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>সাধারণ ব্যবহারকারী লগইন</title>
    
    <!-- Tailwind CSS লোড করা হয়েছে -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        body { font-family: sans-serif; background-color: #f7f7f7; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-card {
            max-width: 400px;
            width: 100%;
            padding: 2rem;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        label { display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: bold; color: #333; }
        input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        button { 
            padding: 10px; margin-top: 1.5rem; background-color: #28a745; color: white; border: none; 
            border-radius: 5px; font-weight: bold; cursor: pointer; transition: background-color 0.3s;
        }
        button:hover:enabled { background-color: #1e7e34; }
    </style>
    
    <!-- Firebase SDKs (Compat Version) -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script> 
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    
    <!-- আপনার নিজস্ব জাভাস্ক্রিপ্ট -->
    <script src="js/script.js" defer></script>
</head>
<body>
    <div class="login-card">
        <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">🧑‍🤝‍🧑 সাধারণ ব্যবহারকারী লগইন</h2>
        
        <form id="userLoginForm">
            <label for="userId">ইউজার আইডি (ইমেইল/মোবাইল) *</label>
            <input type="text" id="userId" required placeholder="আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বর">
            
            <label for="userPassword">পাসওয়ার্ড *</label>
            <input type="password" id="userPassword" required placeholder="আপনার পাসওয়ার্ড">
            
            <button type="button" onclick="loginUser()">প্রবেশ করুন 🚀</button>
        </form>
    </div>
</body>
</html>