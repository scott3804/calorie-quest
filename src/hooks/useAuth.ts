import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore"; // Use onSnapshot
import { onAuthStateChanged, type User } from "firebase/auth";
import type { PlayerProfile } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // If there's no user, we know immediately there's no profile to load
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        setProfile(docSnap.exists() ? (docSnap.data() as PlayerProfile) : null);
        setLoading(false); // Definitive end of the loading state
      },
      (error) => {
        console.error("Profile listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  return { user, profile, loading };
};
