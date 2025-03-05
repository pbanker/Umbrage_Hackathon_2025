import React from "react";
import { Outlet } from "react-router-dom";
import { Sidenav } from "../../components/Sidenav";

const DashboardPage: React.FC = () => {
  return (
    <div className="flex">
      <Sidenav />
      <div className="flex min-h-screen w-full h-full bg-sky-100">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;
