
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChqWf8LZ3vP1egxhtAqmoWKAqkjVZsliA",
  authDomain: "airguard-6e071.firebaseapp.com",
  projectId: "airguard-6e071",
  storageBucket: "airguard-6e071.firebasestorage.app",
  messagingSenderId: "1038605389253",
  appId: "1:1038605389253:web:6fb2cffd5ddf460475cfac",
  measurementId: "G-XVDDHVT6G9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { app, auth };