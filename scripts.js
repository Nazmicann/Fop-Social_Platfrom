import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi7khxDbOnxYg5iqyOzkZh_gD278S6Z7o",
  authDomain: "prometheus-1907.firebaseapp.com",
  projectId: "prometheus-1907",
  storageBucket: "prometheus-1907.firebasestorage.app",
  messagingSenderId: "975445348601",
  appId: "1:975445348601:web:782f19fb431652656dd228",
  measurementId: "G-FN1D9M9X4P"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Kullanıcı ve paylaşım verileri
let currentUser = null;

// Karşılama Sayfası
document.getElementById('registerButton').addEventListener('click', function () {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('registerSection').classList.remove('hidden');
});

document.getElementById('loginButton').addEventListener('click', function () {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
});

// Kayıt Ol
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;
    const profilePic = document.getElementById('regProfilePicture').files[0];
    const phone = document.getElementById('regPhone').value;
    const specialTalent = document.getElementById('regSpecialTalent').value;

    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            document.getElementById('registerMessage').textContent = "Bu e-posta zaten kayıtlı!";
        } else {
            const newUser = {
                username,
                password,
                email,
                profilePic: profilePic ? URL.createObjectURL(profilePic) : "",
                phone,
                specialTalent
            };
            await addDoc(collection(db, "users"), newUser);
            document.getElementById('registerMessage').textContent = "Kayıt başarılı! Giriş yapabilirsiniz.";
            document.getElementById('registerForm').reset();
        }
    } catch (error) {
        console.error("Kayıt sırasında hata oluştu:", error);
    }
});
// Mevcut kodunuz burada olacak

// Admin girişi için fonksiyon
function adminLogin() {
    const username = prompt("Kullanıcı adınızı girin:");
    const password = prompt("Şifrenizi girin:");

    if (username === "admin" && password === "1234") {
        window.location.href = "admin_panel"; // Admin paneli sayfasına yönlendir
    } else {
        alert("Hatalı kullanıcı adı veya şifre!");
    }
}

// Admin giriş butonu ekleme
document.addEventListener("DOMContentLoaded", function() {
    const adminLoginButton = document.createElement("button");
    adminLoginButton.textContent = "Admin Girişi";
    adminLoginButton.onclick = adminLogin;
    document.body.appendChild(adminLoginButton);
});

// Mevcut kodunuz burada devam edecek



// Giriş Yap
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === "admin1" && password === "123") {
        currentUser = { username: "admin1", role: "user" };
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('feedSection').classList.remove('hidden');
        loadFeed();
        return;
    }

    try {
        const q = query(collection(db, "users"), where("username", "==", username), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            currentUser = querySnapshot.docs[0].data();
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('feedSection').classList.remove('hidden');
            document.getElementById('usernameDisplay').textContent = currentUser.username;
            document.getElementById('profilePic').src = currentUser.profilePic;
            loadFeed();
        } else {
            document.getElementById('loginMessage').textContent = "Kullanıcı adı veya şifre hatalı!";
        }
    } catch (error) {
        console.error("Giriş sırasında hata oluştu:", error);
    }
});

// Paylaşım Yap
document.getElementById('postForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const postText = document.getElementById('postText').value;
    const postImage = document.getElementById('postImage').files[0];
    const postMusic = document.getElementById('postMusic').files[0];

    const newPost = {
        username: currentUser.username,
        text: postText,
        image: postImage ? URL.createObjectURL(postImage) : null,
        music: postMusic ? URL.createObjectURL(postMusic) : null,
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "posts"), newPost);
        loadFeed();
        document.getElementById('postForm').reset();
    } catch (error) {
        console.error("Paylaşım eklenirken hata oluştu:", error);
    }
});

// Akışı Yükle
async function loadFeed() {
    const feed = document.getElementById('feed');
    feed.innerHTML = "";

    try {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <strong>${post.username}</strong>
                <p>${post.text}</p>
                ${post.image ? `<img src="${post.image}" alt="Paylaşım Resmi">` : ''}
                ${post.music ? `<audio src="${post.music}" controls></audio>` : ''}
            `;
            feed.appendChild(postElement);
        });
    } catch (error) {
        console.error("Akış yüklenirken hata oluştu:", error);
    }
}

// Takip Sistemi
async function loadFollowList() {
    const followList = document.getElementById('followList');
    followList.innerHTML = "";

    try {
        const q = query(collection(db, "users"), where("username", "==", currentUser.username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const user = querySnapshot.docs[0].data();
            user.following.forEach((username) => {
                const listItem = document.createElement('li');
                listItem.textContent = username;
                followList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Takip listesi yüklenirken hata oluştu:", error);
    }
}

// Çıkış Yap
document.getElementById('logoutButton').addEventListener('click', function () {
    currentUser = null;
    document.getElementById('feedSection').classList.add('hidden');
    document.getElementById('welcomeSection').classList.remove('hidden');
});