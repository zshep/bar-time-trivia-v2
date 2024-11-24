//dashboard page
import Navbar from "../../components/dashboard/navbar";

import { Link, Outlet } from 'react-router-dom';

export default function dashboard() {

    return (

        <div className="flex w-full">
            
          
                <Navbar></Navbar>

                <div>
                    <Outlet></Outlet>
                </div>
           
            
            

        </div>

    )
}