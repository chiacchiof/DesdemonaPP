import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { apiKey: "AIzaSyAHg5JmiYjoOlolQmpAQlA8PA4ZMc4Wo6c",
    authDomain: "fluentapp-8bdf8.firebaseapp.com",
    projectId: "fluentapp-8bdf8",
    storageBucket: "fluentapp-8bdf8.firebasestorage.app",
    messagingSenderId: "879518587606",
    appId: "1:879518587606:web:74e08202707db60d294777"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app); 