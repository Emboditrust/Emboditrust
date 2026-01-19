"use client";
import { CommonDashboardContext } from "@/providers/StateContext";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";
import { GiHamburgerMenu } from "react-icons/gi";

const MobileNav = () => {
  const { setShowSideBar } = useContext(CommonDashboardContext);
  
  const handleSideBar = () => {
    setShowSideBar(true);
  };

  return (
    <div className="sm:hidden w-full justify-between fixed top-0 left-0 h-[70px] px-4 bg-white border-b border-gray-300 mb-10 flex items-center z-50">
      <div className="">
        <Link href="/" className="flex items-center">
          <div className="text-2xl font-bold text-black">
           <div>
                     <div className=" font-header  font-bold text-[#80CBE8]">
                       Emboditrust
                      
                     </div>
                   </div>
          </div>
        </Link>
      </div>
      
      <GiHamburgerMenu
        className="text-[30px] cursor-pointer text-gray-700 hover:text-black transition-colors"
        onClick={handleSideBar}
      />
    </div>
  );
};

export default MobileNav;