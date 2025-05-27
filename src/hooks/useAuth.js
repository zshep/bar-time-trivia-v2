import { useState, useEffect } from "react";
import { auth } from "../../app/server/api/firebase/firebaseConfig";

export function useAuth() {
    const [user, setUser] =useState(null);

    useEffect(() => {

        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
        });

        return unsubscribe;
    }, []);

    return user;

}