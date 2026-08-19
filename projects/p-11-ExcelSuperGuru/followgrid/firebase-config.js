import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOZL_CvNZBYPpgkfifVrBMT-ko-oDrV0w",
  authDomain: "freecoursehub-54e23.firebaseapp.com",
  projectId: "freecoursehub-54e23",
  storageBucket: "freecoursehub-54e23.firebasestorage.app",
  messagingSenderId: "305286620866",
  appId: "1:305286620866:web:6f31be8c246b64caa7fd5b",
  measurementId: "G-3VVD9MY4W1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);