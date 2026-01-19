"use client";
import Link from "next/link";
import { CommonDashboardContext } from "@/providers/StateContext";
import { useContext } from "react";
import { AdminSideBar, AdminSideBarType } from "@/constants/adminSidebar";

interface Isidebar {
  findpath: string;
  currentChatId?: string;
}

export const AdminSideBarComponent = ({ findpath, currentChatId }: Isidebar) => {
  const { setShowSideBar } = useContext(CommonDashboardContext);

  const getHref = (item: AdminSideBarType) => {
    if (item.dynamicPath && currentChatId) {
      return `/admin-dashboard/${item.dynamicPath.replace('[chatId]', currentChatId)}`;
    }
    return `/admin/${item.path}`;
  };

  const isActive = (item: AdminSideBarType) => {
    if (item.dynamicPath) {
      return findpath.includes('chat');
    }
    return findpath === item.path;
  };

  return (
    <div className="flex flex-col space-y-1">
      {AdminSideBar.map((item) => (
        <Link
          onClick={() => setShowSideBar(false)}
          href={getHref(item)}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
            isActive(item)
              ? "bg-[#80CBE8] bg-opacity-10 text-[#80CBE8] font-semibold border border-[#80CBE8]"
              : "text-gray-800 hover:text-black font-medium hover:bg-gray-100 border border-transparent"
          }`}
          key={item.path}
        >
          <div className="text-[20px]">{item.icon && <item.icon />}</div>
          <p>{item.name}</p>
        </Link>
      ))}
    </div>
  );
};