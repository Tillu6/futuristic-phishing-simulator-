// frontend/src/components/AuthProvider.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from '../contexts/FirebaseContext'; // Ensure this path is correct

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { auth } = useFirebase();
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Indicates if auth state has been checked

  useEffect(() => {
    if (!auth) {
      console.log("Auth instance not available yet.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in.
        setUserId(user.uid);
        console.log("Firebase Auth State Changed: Signed in as", user.uid);
      } else {
        // User is signed out or not authenticated.
        console.log("Firebase Auth State Changed: No user signed in. Attempting anonymous sign-in or custom token.");
        try {
          // __initial_auth_token is a global variable provided by the Canvas environment
          const initialAuthToken = typeof __initial_auth_token !== 'undefined'
            ? __initial_auth_token
            : null;

          if (initialAuthToken) {
            const userCredential = await signInWithCustomToken(auth, initialAuthToken);
            setUserId(userCredential.user.uid);
            console.log("Signed in with custom token:", userCredential.user.uid);
          } else {
            const userCredential = await signInAnonymously(auth);
            setUserId(userCredential.user.uid);
            console.log("Signed in anonymously:", userCredential.user.uid);
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          // If anonymous sign-in also fails, use a random UUID as a fallback for userId
          setUserId(crypto.randomUUID());
        }
      }
      setIsAuthReady(true); // Auth state check is complete
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Re-run effect if auth instance changes

  // Display a loading state until authentication is ready
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-primary-200">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent-400 mb-4" />
          <p className="text-xl">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  const value = { userId, isAuthReady };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
