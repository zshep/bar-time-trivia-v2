import { useState } from "react";
import { auth } from "../api/firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Link } from 'react-router-dom';

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Signed in:", userCredential.user);
      })
      .catch((error) => {
        console.error("Sign in error:", error);
      });
  };

  return (

    <div className="flex-col">
      <div className="flex justify-center">
        <p>Log In</p>
      </div>
      <div className="border border-black ">
        <div className="flex justify-center mt-2">
          <label className="mr-4 hidden" htmlFor="email">Email:</label>
          <input
            className="border text-center"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex justify-center mt-2">
          <label className="hidden" htmlFor="password">Password:</label>
          <input
            name="password"
            className="border mb-2 text-center"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button className="mt-4 mb-10" onClick={signIn}>Sign In</button>

      <div className="d-flex mt-2">
        <Link
          className="text-green-500"
          to="/signup">
          Need a log in? Sign up today!
        </Link>
      </div>

    </div>
  );
}

export default Auth;
