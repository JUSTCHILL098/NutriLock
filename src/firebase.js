import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyA3WPCkvaSlqY5xyhCbYi22pto1TLgKHvs",
  authDomain: "nutrilock-12a1f.firebaseapp.com",
  projectId: "nutrilock-12a1f",
  storageBucket: "nutrilock-12a1f.firebasestorage.app",
  messagingSenderId: "442439764772",
  appId: "1:442439764772:web:c0f31bfdfe80ef8f6601b1",
  measurementId: "G-2KFZQHGR61",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
