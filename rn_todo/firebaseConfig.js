import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getDocs } from "firebase/firestore";

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

export const testFirebase = async () => {
  console.log("calling test firebase...");
  try {
    const docRef = await addDoc(collection(db, "users"), {
      first: "Alan",
      middle: "Mathison",
      last: "Turing",
      born: 1912,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const readFirebase = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
  });
};

export { db };
