import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
