import { Outlet } from "react-router-dom";



export default function SessionPage() {

    return(
        <div className="flex w-full h-full justify-between">

           
            
            <Outlet></Outlet>

            

        </div>
    )
}