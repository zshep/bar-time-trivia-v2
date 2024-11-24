//dashboard page
import Navbar from "../components/dashboard/navbar";
import Playericon from "../components/dashboard/playerIcon";
import Playerstats from "../components/dashboard/playerstats";

export default function dashboard() {

    return (

        <div className="flex w-full">
            
          
                <Navbar></Navbar>
           
            
            <div className="flex mx-auto mt-40">
                <div className="flex flex-col mx-4">
                    <div className="border border-black p-2 text-center rounded mt-3">
                        <p>User Name</p>
                    </div>
                    <Playericon></Playericon>
                </div>

                <div className="d-flex flex-column mx-4 mt-3">
                    
                    <div className=" border border-black p-2 rounded">
                        <p className="text-center">User Stats</p>
                    </div>
                    <Playerstats></Playerstats>
                </div>
            </div>

        </div>

    )
}