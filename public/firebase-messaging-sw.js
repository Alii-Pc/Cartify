importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// We need to fetch the config from the server or hardcode the basic non-sensitive ones.
// Since Service Workers run entirely isolated, we will hardcode the config you provided.
// (Firebase configs are safe to expose).
const firebaseConfig = {
  apiKey: "AIzaSyAcGOAl_sZR0k0MTCiMtXMHi7Ob9xXloPk",
  authDomain: "cartify-fb632.firebaseapp.com",
  projectId: "cartify-fb632",
  storageBucket: "cartify-fb632.firebasestorage.app",
  messagingSenderId: "255695388793",
  appId: "1:255695388793:web:3fc893e4fd0888780454a8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
