import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// Firebase yapılandırması
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

// Kullanıcıları çek ve göster
function fetchUsers() {
    db.collection("users").get().then((querySnapshot) => {
        const userContainer = document.getElementById("userContainer");
        userContainer.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const userCard = document.createElement("div");
            userCard.className = "user-card";
            userCard.innerHTML = `
                <h3>${user.username}</h3>
                <p>Email: ${user.email}</p>
                <p>Resim: ${user.profileImage || "Yok"}</p>
            `;
            userContainer.appendChild(userCard);
        });
    });
}

// Mesaj gönderme
document.getElementById("sendMessageForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;
    const message = document.getElementById("message").value;

    db.collection("messages").add({
        userId: userId,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Mesaj gönderildi!");
    }).catch((error) => {
        console.error("Mesaj gönderilirken hata oluştu:", error);
    });
});

// Gönderileri çek ve göster
function fetchPosts() {
    db.collection("posts").get().then((querySnapshot) => {
        const postContainer = document.getElementById("postContainer");
        postContainer.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement("div");
            postElement.className = "post-card";
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <button onclick="deletePost('${doc.id}')">Sil</button>
            `;
            postContainer.appendChild(postElement);
        });
    });
}

// Gönderi silme
function deletePost(postId) {
    db.collection("posts").doc(postId).delete().then(() => {
        alert("Gönderi silindi!");
        fetchPosts(); // Gönderileri yeniden yükle
    }).catch((error) => {
        console.error("Gönderi silinirken hata oluştu:", error);
    });
}

// Sayfa yüklendiğinde verileri çek
document.addEventListener("DOMContentLoaded", function() {
    fetchUsers();
    fetchPosts();
});