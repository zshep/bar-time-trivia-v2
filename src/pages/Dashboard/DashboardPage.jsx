//dashboard page
import Navbar from "../../components/dashboard/navbar";
import { Outlet } from 'react-router-dom';

export default function DashboardPage() {

    return (

       <div className="min-h-screen w-full flex bg-gray-50">
      <Navbar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>

    )
}