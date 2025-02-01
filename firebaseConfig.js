import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD18bBpRgOZZJAHsGKDdRa7lUHdhl71RcI",
  authDomain: "ageverificationservice.firebaseapp.com",
  projectId: "ageverificationservice",
  storageBucket: "ageverificationservice.firebasestorage.app",
  messagingSenderId: "587819983449",
  appId: "1:587819983449:web:80841173c822ee092a0748"
};

const app = initializeApp(firebaseConfig);
export default app;