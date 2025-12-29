// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCneGeixnWUoKNkJVxqsz1IyBEOuHHdLf0",
  authDomain: "calorie-quest-afa5c.firebaseapp.com",
  projectId: "calorie-quest-afa5c",
  storageBucket: "calorie-quest-afa5c.firebasestorage.app",
  messagingSenderId: "573238919452",
  appId: "1:573238919452:web:f841db5f3a539cd421fad9",
  measurementId: "G-Y1B0GKW2PK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
