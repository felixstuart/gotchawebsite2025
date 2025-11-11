// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC35OSKmGGTL1l_T_lH_rjrhx6gUB1vkWY",
  authDomain: "felixs-gotcha-tes.firebaseapp.com",
  databaseURL: "https://felixs-gotcha-tes-default-rtdb.firebaseio.com",
  projectId: "felixs-gotcha-tes",
  storageBucket: "felixs-gotcha-tes.firebasestorage.app",
  messagingSenderId: "680586060563",
  appId: "1:680586060563:web:2648fbfc3511b636c970e6",
  measurementId: "G-GEVGLH9M75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log(analytics);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export const db = getFirestore(app);
export const storage = getStorage(app);
