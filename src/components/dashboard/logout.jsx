import { signOut } from "firebase/auth";
import { auth } from "../../../app/server/api/firebase/firebaseConfig";
import { LogOut as LogOutIcon } from "lucide-react";

export default function Logout({ collapsed = false }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={[
        "w-full flex items-center justify-center gap-2 rounded-md",
        "bg-gray-900 text-white text-sm py-2",
        "hover:bg-gray-800 transition",
        collapsed ? "px-2" : "px-3",
      ].join(" ")}
    >
      {/* icon */}
      <LogOutIcon className="h-5 w-5" />
      {!collapsed && <span>Log out</span>}
    </button>
  );
}
