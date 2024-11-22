export default function Signup() {


    return (


        <div>

            <div>
                <p>This be the sign up form</p>

            </div>
            <div className="d-flex justify-content-center flex-column border border-black rounded m-2">
                <div className="">
                    <form action={formAction}>
                        <div className="d-flex flex-column justify-content-space-between">
                            <div className="d-flex flex-row justify-content-evenly mb-2">
                                <label className="ml-3 text-xs font-medium" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="border ml-2"
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    required
                                    autoFocus

                                />
                            </div>
                            <div className="d-flex flex-row justify-content-evenly mb-2">
                                <label className="ml-3 text-xs font-medium" htmlFor="email">
                                    User Name
                                </label>
                                <input
                                    className="border ml-2"
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Enter usaername"
                                    required
                                    autoFocus

                                />
                            </div>
                            <div className="d-flex flex-row justify-content-space-evenly">
                                <label
                                    className="ml-3 text-xs font-medium"
                                    htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="border ml-2"
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
                                    className="ml-3 text-xs font-medium"
                                    htmlFor="password2">
                                    Retype Password
                                </label>
                                <input
                                    className="border ml-2"
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
        </div>
    )
}