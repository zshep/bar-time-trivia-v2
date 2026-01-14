import { useState } from "react";
import { auth } from "../api/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

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
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <form
      onSubmit={handleSignin}
      className="w-full max-w-sm bg-white border border-gray-300 rounded-lg p-6 shadow"
    >
      <h1 className="text-2xl font-semibold text-center mb-6">
        Log In
      </h1>

      <div className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full mt-6 bg-blue-600 text-black py-2 rounded hover:bg-blue-700 transition"
      >
        Sign In
      </button>

      <div className="mt-4 text-center text-sm">
        <Link className="text-green-600 hover:underline" to="/signup">
          Need an account? Sign up
        </Link>
      </div>
    </form>
  </div>
);

  
}

export default Auth;
