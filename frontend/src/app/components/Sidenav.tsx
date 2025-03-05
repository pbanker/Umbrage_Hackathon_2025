import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export const Sidenav: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [itemSelected, setItemSelected] = useState("Dashboard");

  const options = useMemo(
    () => [
      {
        icon: "/icons/layout-dashboard.svg",
        text: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: "/icons/message-circle.svg",
        text: "Chat",
        path: "/dashboard/chat",
      },
      {
        icon: "/icons/file-text.svg",
        text: "PPTX Repository",
        path: "/dashboard/pptx",
      },
      {
        icon: "/icons/settings.svg",
        text: "Settings",
        path: "/dashboard/settings",
      },
    ],
    []
  );

  useEffect(() => {
    const path = window.location.pathname;
    const option = options.find((option) => option.path === path);
    if (option) {
      setItemSelected(option.text);
    }
  }, [options]);

  return (
    <div
      className={`flex flex-col min-h-screen h-full shrink-0 grow-0 ${
        collapsed ? "w-20" : "w-50"
      } bg-white text-gray-700`}
    >
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between p-4">
          <span className="text-xl font-bold">
            {collapsed ? "U" : "Umbrage"}
          </span>
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
        <nav className="flex flex-col flex-grow">
          {options.map((option) => (
            <SideNavItem
              key={option.text}
              icon={option.icon}
              text={option.text}
              path={option.path}
              collapsed={collapsed}
              itemSelected={itemSelected}
              setItemSelected={setItemSelected}
            />
          ))}
        </nav>
      </div>
      <div className="flex gap-2.5 p-4 hover:text-blue-700 cursor-pointer">
        <img src="/icons/log-out.svg" alt="" />
        <span className={collapsed ? "hidden" : "block"}>Logout</span>
      </div>
    </div>
  );
};

type SideNavItemProps = {
  icon: string;
  text: string;
  path: string;
  collapsed: boolean;
  itemSelected?: string;
  setItemSelected: (text: string) => void;
};

const SideNavItem = ({
  icon,
  text,
  collapsed,
  path,
  itemSelected,
  setItemSelected,
}: SideNavItemProps) => {
  return (
    <Link
      to={path}
      onClick={() => setItemSelected(text)}
      className={`flex gap-2.5 p-4 hover:text-blue-700 ${
        itemSelected === text ? "border-l-4 border-l-blue-700" : "border-l-0"
      }`}
    >
      <img src={icon} alt="" />
      <span className={collapsed ? "hidden" : "block"}>{text}</span>
    </Link>
  );
};
