
"use client";
import React, { useContext, useState } from "react";
import { CommonDashboardContext } from "@/providers/StateContext";
import { PiSealWarningFill } from "react-icons/pi";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button"; 

const ConfirmLogout = () => {
  const context = useContext(CommonDashboardContext);
  const [loadingOut, setLoggingOut] = useState<boolean>(false);
  
  // Safely access context values
  const confirmLogout = context?.confirmLogout || false;
  const setConfirmLogout = context?.setConfirmLogout || (() => {});

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setLoggingOut(true);
    
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  const closeModal = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.stopPropagation();
    setConfirmLogout(false);
  };

  // Prevent modal content click from closing the modal
  const handleModalContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={closeModal}
      className={`${
        confirmLogout ? "flex" : "hidden"
      } fixed inset-0 z-[999999] items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-md`}
    >
      <div 
        onClick={handleModalContentClick}
        className="w-full max-w-md rounded-md border bg-white px-6 py-8 shadow-lg"
      >
        <div className="flex flex-col items-center gap-5">
          <PiSealWarningFill className="text-6xl text-red-500" />
          
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-black">
              About to leave your dashboard
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to sign out?
            </p>
          </div>
          
          <div className="flex w-full gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="flex-1 hover:bg-gray-100"
              disabled={loadingOut}
            >
              Stay on Page
            </Button>
            
            <Button
              onClick={handleSignOut}
              className="flex-1 bg-red-700 hover:bg-red-500"
              disabled={loadingOut}
            >
              {loadingOut ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing out...
                </span>
              ) : (
                "Sign Out"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogout;