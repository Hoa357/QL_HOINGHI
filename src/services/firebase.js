import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDkuw9SPjemJSC3B_6TTKnjzDDngjvhsaM",
    authDomain: "doanltdd-888c2.firebaseapp.com",
    projectId: "doanltdd-888c2",
    storageBucket: "doanltdd-888c2.appspot.com",
    messagingSenderId: "513687375255",
    appId: "1:513687375255:android:c62a4bb5221f2c42aa08d2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };