import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Link } from "react-router-dom";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (


        <div className="self-center mb-20 pb-10">

            <div>
                <p>Sign up today to create an account</p>

            </div>
            <div className="d-flex justify-content-center flex-column border border-black rounded m-2">
                <div className="">
                    <form>
                        <div className="d-flex flex-column justify-content-space-between mr-4 ml-2">
                            <div className="mb-2">
                                <input
                                    className="border mt-2 ml-2 text-center"
                                    id="email"
                                    type="email"
                                    name="email"
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
                                    name="username"
                                    placeholder="Enter Username"
                                    required
                                    autoFocus
                                />
                                <label className="ml-3 text-xs font-medium hidden" htmlFor="email">
                                    User Name
                                </label>

                            </div>
                            <div className="d-flex flex-row justify-content-space-evenly">
                                <label
                                    className="ml-3 text-xs font-medium hidden"
                                    htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="border ml-2 text-center"
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div className="d-flex flex-row justify-content-space-evenly mt-2">
                                <label
                                    className="ml-3 text-xs font-medium hidden"
                                    htmlFor="password2">
                                    Retype Password
                                </label>
                                <input
                                    className="border ml-2 text-center"
                                    id="password2"
                                    type="password"
                                    name="password2"
                                    placeholder="Renter password"
                                    required
                                    minLength={3}
                                />
                            </div>
                        </div>
                        <div className="d-flex justify-content-center mb-2 mt-4">
                            <button
                                type="submit"
                                className="btn btn-outline-success"
                                id="button"
                                name="loginBTN">
                                Sign Up
                            </button>
                            
                        </div>
                    </form>

                </div>

            </div>
            <div className="d-flex mt-2">
                                <Link
                                    className="text-green-500"
                                    to="/">
                                    Already have a log in? Log in!
                                </Link>
                            </div>
        </div>
    )
}