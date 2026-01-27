import { IconType } from "react-icons";
import { RiHome5Line, RiVerifiedBadgeLine } from "react-icons/ri";
import { HiOutlineChatBubbleLeftEllipsis, HiOutlineGiftTop, HiOutlineUserGroup } from "react-icons/hi2";
import { LiaSmsSolid } from "react-icons/lia";
import { LuMessageSquareText, LuSettings  } from "react-icons/lu";
import { TbClipboardText, TbCreditCard, TbUserEdit } from "react-icons/tb";


export interface AdminSideBarType {
    path: string;
    icon?: IconType;
    name: string;
    dynamicPath?: string;
  }


export const AdminSideBar: AdminSideBarType[] = [
    { path: '', name: 'Dashboard', icon: RiHome5Line },
  { path: 'clients', name: 'Clients', icon: HiOutlineUserGroup },
  { path: 'sms', name: 'SMS Verification', icon: LiaSmsSolid },
  { path: 'rewards', name: 'Rewards Campaign', icon: HiOutlineGiftTop  },
  { path: 'messages', name: 'Messages', icon: LuMessageSquareText  },
   { path: 'logs', name: 'Systems Log', icon: TbClipboardText },
  { path: 'billings', name: 'Billing & Subscription', icon: TbCreditCard },
  { path: 'settings', name: 'Settings', icon: LuSettings  },
  { path: 'support', name: 'Support Inbox', icon: HiOutlineChatBubbleLeftEllipsis }, 
   
   
  ];