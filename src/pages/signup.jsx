import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../app/server/api/firebase/firebaseConfig.js";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput.jsx";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }
    const usernameTrimmed = username.trim();
    const usernameLower = usernameTrimmed.toLowerCase();

    if (!/^[a-zA-Z0-9_]+$/.test(usernameTrimmed)) {
      setError(
        "Username can only contain letters, numbers, and underscores. No spaces.",
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: usernameTrimmed });

      const batch = writeBatch(db);

      const userRef = doc(db, "users", user.uid);
      const usernameRef = doc(db, "usernames", usernameLower);

      batch.set(usernameRef, {
        uid: user.uid,
      });

      batch.set(userRef, {
        username: usernameTrimmed,
        usernameLower,
        email: user.email,
        gamesCreated: 0,
        sessionsPlayed: 0,
        stats: {},
      });

      await batch.commit();

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Error during signup:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mb-20 pb-10">
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
                <label
                  className="ml-3 text-xs font-medium hidden"
                  htmlFor="email"
                >
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
                <label
                  className="ml-3 text-xs font-medium hidden"
                  htmlFor="username"
                >
                  User Name
                </label>
              </div>
              <div className="d-flex flex-row justify-content-space-evenly">
                <PasswordInput
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="d-flex flex-row justify-content-center mt-2">
                <PasswordInput
                  id="password2"
                  label="Re-enter Password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex justify-content-center mb-2 mt-4">
              <button
                type="submit"
                className="btn btn-outline-success"
                id="button"
                name="signupBTN"
              >
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
