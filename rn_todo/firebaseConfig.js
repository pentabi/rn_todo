import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfnEoRkE0UcUjHX0UVO9w_xm9ycvaxEaM",
  authDomain: "todo-rn-17910.firebaseapp.com",
  projectId: "todo-rn-17910",
  storageBucket: "todo-rn-17910.firebasestorage.app",
  messagingSenderId: "1076226019131",
  appId: "1:1076226019131:web:bbe5e45849d6fa05e7b11e",
  measurementId: "G-N8N3RW0HW1",
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
//Makes it enable to keep the user logged in even when the app is closed
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth, db, storage };
