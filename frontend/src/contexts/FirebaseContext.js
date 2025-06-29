// frontend/src/contexts/FirebaseContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [app, setApp] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Initialize Firebase only once
    if (!app) {
      try {
        // __firebase_config is a global variable provided by the Canvas environment
        const firebaseConfig = typeof __firebase_config !== 'undefined'
          ? JSON.parse(__firebase_config)
          : {}; // Fallback for local development if not in Canvas

        if (Object.keys(firebaseConfig).length === 0) {
          console.warn("Firebase config not found. Firebase will not be initialized.");
          return;
        }

        const firebaseApp = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(firebaseApp);
        const firebaseAuth = getAuth(firebaseApp);

        setApp(firebaseApp);
        setDb(firestoreDb);
        setAuth(firebaseAuth);
        console.log("Firebase initialized successfully.");

      } catch (e) {
        console.error("Failed to initialize Firebase:", e);
      }
    }
  }, [app]); // Run only once when `app` is null

  const value = { app, db, auth };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
