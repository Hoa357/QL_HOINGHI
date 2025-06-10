import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
const firebaseConfig = {
    apiKey: "AIzaSyDkuw9SPjemJSC3B_6TTKnjzDDngjvhsaM",
    authDomain: "doanltdd-888c2.firebaseapp.com",
    projectId: "doanltdd-888c2",
    storageBucket: "doanltdd-888c2.firebasestorage.app",
    messagingSenderId: "513687375255",
    appId: "1:513687375255:web:84ddf5277c97d120aa08d2",
    measurementId: "G-HBJQKEMDEL"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);
export { auth, db };