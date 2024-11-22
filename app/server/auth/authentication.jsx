import { useState } from "react";
import { auth } from "../api/firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

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

      <div className="flex content-start">
        <label className="mr-4" htmlFor="email">Email:</label>
        <input
          className="border mb-8"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex content-start">
        <label htmlFor="password">Password:</label>
        <input
          name="password"
          className="border mb-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="mt-4" onClick={signIn}>Sign In</button>
    </div>
  );
}

export default Auth;
