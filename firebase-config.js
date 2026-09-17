import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Replace these values with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyD0ZupfaAZMRWnHc9ynzlVC8nr6_--kmb8",
  authDomain: "luckywheel-a12ab.firebaseapp.com",
  projectId: "luckywheel-a12ab",
  storageBucket: "luckywheel-a12ab.firebasestorage.app",
  messagingSenderId: "693313375847",
  appId: "1:693313375847:web:28d901ac9dd80c34e18ec2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
