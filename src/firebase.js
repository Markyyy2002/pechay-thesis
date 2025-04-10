// /src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDmBWWU8biW7hZ4jn8DCFiY0D7kvOnMQJE",
  authDomain: "pechay-thesis.firebaseapp.com",
  projectId: "pechay-thesis",
  databaseURL: "https://pechay-thesis-default-rtdb.asia-southeast1.firebasedatabase.app/", // Add this line
  appId: "1:726164361611:web:c691148a7acb41a28b1f8e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app); // Export the database
