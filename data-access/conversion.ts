//import { format } from "timeago.js";


export const useConversion = () => {
  // const get the date
  function handleDate(time: string) {
    const fullTime = new Date(time);
    const formattedDate = fullTime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formattedDate;
  }

   function makeSubstring(link: string, amt: number) {
    const substring = link.substring(0, amt);
    if (link.length > amt) {
      const total = `${substring}...`;
      return total;
    } else {
      return link;
    }
  }
  // here we get time
  function handleTime(time: string) {
    const singleTime = new Date(time);
    const gottenTime = singleTime.toLocaleDateString("en-Us", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const showTime = gottenTime.split(",")[1]?.trim();
    return showTime;
  }
  // handle timeago dot js
  // function getTimeAgo(time: string) {
  //   const date = new Date(time);
  //   const timeAgo = format(date);
  //   return timeAgo;
  // }

  // Add this helper function outside your component
const formatMessageTime = (timestamp: string): string => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    // Today - show just time (e.g., "11:40 PM")
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (diffInDays < 7) {
    // Within last week - show day name (e.g., "Tuesday")
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  } else {
    // Older than a week - show date (e.g., "12/05/2023")
    return messageDate.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
  }
};

  
  
  

  
  
 
 


   
  return {
    //getTimeAgo,
    handleTime,
    handleDate,
    formatMessageTime,
    makeSubstring
   
  };
};


