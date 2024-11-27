import { useState } from "react";
import { auth } from "../api/firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Link, useNavigate } from 'react-router-dom';

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    try {
      // Sign in using Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User successfully logged in.");

      // Redirect user to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };


  return (

    <div className="flex-col">
      <div className="flex justify-center">
        <p>Log In</p>
      </div>
      <form onSubmit={handleSignin}>
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

      <button className="mt-4 mb-10" type="submit">Sign In</button>
      </form>
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
