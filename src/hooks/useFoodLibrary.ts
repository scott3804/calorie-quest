import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import type { FoodDefinition } from "../types";

export const useFoodLibrary = (uid: string) => {
  const [foodLibrary, setFoodLibrary] = useState<FoodDefinition[]>([]);

  useEffect(() => {
    // Listen to the entire foodLibrary collection for this user
    const q = query(collection(db, "users", uid, "foodLibrary"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(
        (d) =>
          ({
            ...d.data(),
            id: d.id, // Ensure we use the Firestore document ID
          } as FoodDefinition)
      );
      setFoodLibrary(docs);
    });

    return () => unsubscribe();
  }, [uid]);

  // Now returning the full library; favorites can be derived from this
  const favorites = foodLibrary.filter((f) => f.isFavorite);

  return { foodLibrary, favorites };
};
