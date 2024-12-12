//dashboard page
import Navbar from "../../components/dashboard/navbar";
import { Link, Outlet } from 'react-router-dom';

export default function DashboardPage() {

    return (

        <div className="flex w-full ">
            
                <Navbar></Navbar>
                
                <Outlet></Outlet>
                

        </div>

    )
}