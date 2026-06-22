import { Outlet } from "react-router-dom";
import MemberSidebar from "../components/MemberSidebar";

export default function MemberLayout() {
  return (
    <div>
      <div id="app-container" className="flex min-h-screen bg-gray-50">
        <MemberSidebar />
        <div id="main-content" className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
