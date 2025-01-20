import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../app/server/api/firebase/firebaseConfig.js"; // Import your firebase configuration
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";


export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    //setting up db to firestore
    //const db = getFirestore();

    const handleSignup = async (event) => {
        event.preventDefault();

        if (password !== password2) {
            setError("Passwords do not match");
            return;
        }

    
        try {

            console.log("starting username query");

            // Check for unique username
            const usersRef = collection(db, "users");
            console.log("usersRef initialized:", usersRef);
        
            const q = query(usersRef, where("username", "==", username));
            console.log("Query object created:", q);
        
            const querySnapshot = await getDocs(q);
            console.log("QuerySnapshot:", querySnapshot);
            

            console.log("Query executed successfully!");
            console.log(querySnapshot);

            if (!querySnapshot.empty) {
                console.log("Username exists:", querySnapshot.docs.map(doc => doc.data()));
                setError("Username is already taken. Please choose another.");
                return;
            }

            // Create user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Creating user with UID:", user.uid);

            // Save additional user info to Firestore and update profile
            await Promise.all([
                updateProfile(user, { displayName: username }),
                setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: user.email,
                    gamesCreated: 0,
                    sessionsPlayed: 0,
                    stats: {},
                }),
            ]);

            // Redirect user to main screen after successful signup
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
            console.error("Error during signup:", err);
        }
             
    };

    return (
        <div className="flex flex-col self-center w-80 mb-20 pb-10">
            <div>
                <p>Sign up today to create an account</p>
            </div>
            <div className="border border-black rounded m-2">
                <div className="">
                    {error && <p className="error text-red-700 font-bold">{error}</p>}
                    <form onSubmit={handleSignup}>
                        <div className="d-flex flex-column justify-content-space-between mr-4 ml-2">
                            <div className="mb-2">
                                <input
                                    className="border mt-2 ml-2 text-center"
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    required
                                    autoFocus
                                />
                                <label className="ml-3 text-xs font-medium hidden" htmlFor="email">
                                    Email
                                </label>
                            </div>
                            <div className="d-flex flex-row justify-content-evenly mb-2">
                                <input
                                    className="border ml-2 text-center"
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Username"
                                    required
                                    autoFocus
                                />
                                <label className="ml-3 text-xs font-medium hidden" htmlFor="username">
                                    User Name
                                </label>
                            </div>
                            <div className="d-flex flex-row justify-content-space-evenly">
                                <input
                                    className="border ml-2 text-center"
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                    minLength={3}
                                />
                                <label className="ml-3 text-xs font-medium hidden" htmlFor="password">
                                    Password
                                </label>
                            </div>
                            <div className="d-flex flex-row justify-content-space-evenly mt-2">
                                <input
                                    className="border ml-2 text-center"
                                    id="password2"
                                    type="password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    placeholder="Re-enter password"
                                    required
                                    minLength={3}
                                />
                                <label className="ml-3 text-xs font-medium hidden" htmlFor="password2">
                                    Retype Password
                                </label>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center mb-2 mt-4">
                            <button
                                type="submit"
                                className="btn btn-outline-success"
                                id="button"
                                name="signupBTN">
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="d-flex mt-2">
                <Link className="text-green-500" to="/">
                    Already have a login? Log in!
                </Link>
            </div>
        </div>
    );
}