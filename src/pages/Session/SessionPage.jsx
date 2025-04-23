import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sessions/sidebar";


export default function SessionPage() {

    return(
        <div className="flex w-full h-full justify-between">

            <Sidebar></Sidebar>
            
            <Outlet></Outlet>

            <Sidebar></Sidebar>

        </div>
    )
}