import { Outlet } from "react-router-dom";
import sidebar from "../../components/sessions/sidebar";


export default function SessionPage() {

    return(
        <div className="flex w-full h-full">

            <sidebar></sidebar>
            
            <Outlet></Outlet>

            <sidebar></sidebar>

        </div>
    )
}