//dashboard page
import Navbar from "../../components/dashboard/navbar";
import DashboardInfo from "./Dashboardinfo";

import { Link, Outlet } from 'react-router-dom';

export default function dashboard() {

    return (

        <div className="flex w-full">
            
          
                <Navbar></Navbar>

                <div className="flex justify-center">
                    <Outlet></Outlet>
                    

                </div>
           
            
            

        </div>

    )
}