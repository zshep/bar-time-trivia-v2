import { useState } from "react";
import { auth } from "../api/firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from "../../../src/components/PasswordInput";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSignin = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    try {
      // Sign in using Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User successfully logged in.");

      // Redirect user to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      console.log("Credentials not recognized");
      setError(err.message || 'An unknown error has occured');
      navigate("/");
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
              className="border text-center w-full py-2"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-center mt-2">
            <PasswordInput
              id="password"
              label=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error text-red-700 font-bold">{error}</div>}
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
