//dashboard page
import Navbar from "../components/dashboard/navbar";
import Playericon from "../components/dashboard/playerIcon";
import Playerstats from "../components/dashboard/playerstats";

export default function dashboard() {

    return (

        <div className="flex flex-row w-full">

            <Navbar></Navbar>

            <div className="flex flex-column">
                <div className="border border-black p-2 text-center rounded mt-2">
                    <p>User Name</p>

                </div>
                    <div className=" border border-dark">
                        <p className="text-center pt-3">User Stats</p>
                    </div>
                    <Playerstats></Playerstats>
                
            </div>

            <div className="d-flex flex-column mt-3">
                    <Playericon></Playericon>
            </div>
        </div>

    )
}