import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDogD11if_l9yVlSZdDBwVQmKO_QeHPB4U",
  authDomain: "lt-keyword.firebaseapp.com",
  projectId: "lt-keyword",
  storageBucket: "lt-keyword.appspot.com",
  messagingSenderId: "164909920243",
  appId: "1:164909920243:web:dffa9f1388921a74786c86",
  measurementId: "G-1BBMB33R2G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
