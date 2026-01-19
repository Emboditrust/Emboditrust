"use client";
import React, { useContext } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaPowerOff } from "react-icons/fa";
import { CommonDashboardContext } from "@/providers/StateContext";
import { AdminSideBarComponent } from "./SidebarNav";
import { useSession } from "next-auth/react";
import { useConversion } from "@/data-access/conversion";
import Link from "next/link";
import { TbLogout2 } from "react-icons/tb";

const Sidebar = ({ dashboard }: { dashboard: string }) => {
  const { setConfirmLogout } = useContext(CommonDashboardContext);
 
  const { data: session } = useSession();
  const { makeSubstring } = useConversion();
  const user = session?.user;

  // Get initials from full name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    const initials = names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("");
    return initials.toUpperCase();
  };

  // manipulating the path values
  const path = usePathname().split("/");
  let findpath: string;
  if (path.length === 2) {
    findpath = "";
  } else {
    findpath = path[2];
  }

  return (
    <div className="flex flex-col w-[240px] gap-6 py-2 px-4 bg-white border-r border-gray-300">
      {/* the logo */}
      <div className="">
        <Link href="/" className="flex items-center">
          <div className="text-[16px] font-header  font-bold text-[#80CBE8]">
            Emboditrust
           
          </div>
        </Link>
      </div>

      {/* the side bar menu */}
      {dashboard === "admin" && <AdminSideBarComponent findpath={findpath} />}

      {/* then the last part for log out */}
      <div className="w-full h-[120px] ml-6  mt-16 flex items-end  relative">
        <div className="w-3/5 h-[120px]  text-black  transform -translate-x-1/2 bg-white absolute gap-1 -translate-y-1/2 flex flex-col  shadow-sm">
          {/* <span className="font-semibold text-gray-900">{getInitials(user?.name)}</span> */}
          {/* <p className="text-[10px] font-bold text-gray-700">
            {session?.user.name && makeSubstring(session?.user.name, 8)}
          </p> */}
        </div>
        <div
          onClick={() => setConfirmLogout(true)}
          className="text-gray-900  mb-6 flex gap-1 items-center text-[15px] cursor-pointer  transition-colors"
        >
           <TbLogout2  className="w-5 h-5" />
          <p>Logout</p>
         
        </div>
      </div>
    </div>
  );
};

export default Sidebar;