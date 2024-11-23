//dashboard page
import Navbar from "../components/dashboard/navbar";
import Playericon from "../components/dashboard/playerIcon";
import Playerstats from "../components/dashboard/playerstats";

export default function dashboard() {

    return (

        <div className="flex flex-row w-100">

            <Navbar></Navbar>

            <div className="d-flex flex-column justify-self-center mt-3 w-25">
                <div className="border border-black p-2 text-center rounded mt-2">
                    <p>User Name</p>

                </div>
                <div className="mt-5">
                    <div className=" border border-dark">
                        <p className="text-center pt-3">User Stats</p>
                    </div>
                    <Playerstats></Playerstats>
                </div>
            </div>
            <div className="d-flex flex-column mt-3">
                
                    <Playericon></Playericon>
                

            </div>
        </div>

    )
}