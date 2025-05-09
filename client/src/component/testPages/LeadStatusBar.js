import { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Bookmark,
  Trophy,
  Ban
} from 'lucide-react';

export default function LeadStatusBar({leadStatusOptions, setLeadStatusOptions}) {
  const [activeStatus, setActiveStatus] = useState("Contact in Future");
  const scrollContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  
  // Extended list of lead statuses (more than 8)
//   const leadStatusOptions = [
//     "Fresh Lead",
//     "Contact in Future",
//     "Contacted",
//     "Follow Up",
//     "Junk Lead",
//     "Lost Lead",
//     "Not Contacted",
//     "Qualified",
//     "Not Qualified",
//     "Meeting Scheduled",
//     "Contract Sent",
//     "Negotiation"
//   ];

  const handleClick = (status) => {
    setActiveStatus(status);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      // Dynamic scroll amount based on the container width
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount 
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      // Update scroll buttons after animation completes
      setTimeout(checkScrollPosition, 300);
    }
  };

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Show left scroll button if we've scrolled at least 10px
      setShowLeftScroll(scrollLeft > 10);
      // Show right scroll button if there's at least 10px more to scroll
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  const getIconForStatus = (status) => {
    switch(status) {
      case "Contacted": return <CheckCircle className="w-4 h-4" />;
      case "Not Contacted": return <XCircle className="w-4 h-4" />;
      case "Junk Lead": return <AlertTriangle className="w-4 h-4" />;
      case "Not Qualified": return <AlertCircle className="w-4 h-4" />;
      case "Fresh Lead": return <Bookmark className="w-4 h-4" />;
      case "Contact in Future": return <Clock className="w-4 h-4" />;
      case "Qualified": return <Trophy className="w-4 h-4" />;
      case "Lost Lead": return <Ban className="w-4 h-4" />;
      case "Follow Up": return <Clock className="w-4 h-4" />;
      case "Meeting Scheduled": return <CheckCircle className="w-4 h-4" />;
      case "Contract Sent": return <CheckCircle className="w-4 h-4" />;
      case "Negotiation": return <CheckCircle className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getColorForStatus = (status) => {
    switch(status) {
      case "Contacted": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-green-400 to-emerald-600" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-green-600",
        iconColor: activeStatus === status ? "text-white" : "text-green-500",
        hoverBg: "hover:bg-green-50",
        shadow: "shadow-green-100"
      };
      case "Not Contacted": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-gray-500 to-slate-700" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-gray-600",
        iconColor: activeStatus === status ? "text-white" : "text-gray-500",
        hoverBg: "hover:bg-gray-50",
        shadow: "shadow-gray-100"
      };
      case "Junk Lead": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-red-400 to-rose-600" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-red-600",
        iconColor: activeStatus === status ? "text-white" : "text-red-500",
        hoverBg: "hover:bg-red-50",
        shadow: "shadow-red-100"
      };
      case "Not Qualified": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-orange-400 to-amber-600" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-orange-600",
        iconColor: activeStatus === status ? "text-white" : "text-orange-500",
        hoverBg: "hover:bg-orange-50",
        shadow: "shadow-orange-100"
      };
      case "Fresh Lead": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-blue-400 to-indigo-600" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-blue-600",
        iconColor: activeStatus === status ? "text-white" : "text-blue-500",
        hoverBg: "hover:bg-blue-50",
        shadow: "shadow-blue-100"
      };
      case "Qualified": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-purple-400 to-purple-700" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-purple-600",
        iconColor: activeStatus === status ? "text-white" : "text-purple-500",
        hoverBg: "hover:bg-purple-50",
        shadow: "shadow-purple-100"
      };
      case "Contract Sent": return {
        bg: activeStatus === status ? "bg-gradient-to-br from-teal-400 to-teal-600" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-teal-600",
        iconColor: activeStatus === status ? "text-white" : "text-teal-500",
        hoverBg: "hover:bg-teal-50",
        shadow: "shadow-teal-100"
      };
      default: return {
        bg: activeStatus === status ? "bg-gradient-to-br from-blue-400 to-blue-600" : "bg-white", 
        text: activeStatus === status ? "text-white" : "text-blue-600",
        iconColor: activeStatus === status ? "text-white" : "text-blue-500",
        hoverBg: "hover:bg-blue-50",
        shadow: "shadow-blue-100"
      };
    }
  };

  return (
    <div className="p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden relative">
        {/* Left scroll button */}
        {showLeftScroll && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-r-full p-1 shadow-md border border-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}
        
        {/* Right scroll button */}
        {showRightScroll && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-l-full p-1 shadow-md border border-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        )}
        
        {/* Scrollable container with touch support */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide py-2 px-1 relative scroll-smooth touch-pan-x" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' // Enable momentum scrolling on iOS
          }}
          onScroll={checkScrollPosition}
        >
          <div className="inline-flex gap-2 px-2">
            {leadStatusOptions.map((status) => {
              const colors = getColorForStatus(status);
              return (
                <button
                  key={status}
                  onClick={() => handleClick(status)}
                  className={`relative flex items-center justify-center whitespace-nowrap min-w-max px-4 py-3 text-sm font-medium transition-all duration-300 ease-out rounded-lg shadow-sm ${colors.bg} ${colors.text} ${activeStatus !== status ? colors.hoverBg : ''} hover:shadow-md ${colors.shadow} hover:transform hover:scale-105 active:scale-95`}
                  role="option"
                  aria-selected={activeStatus === status}
                >
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>
                  <span className={`mr-2 ${colors.iconColor}`}>
                    {getIconForStatus(status)}
                  </span>
                  <span className="font-semibold">{status}</span>
                  {activeStatus === status && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Fade effects for scroll indication */}
        <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none transition-opacity duration-300 ${showLeftScroll ? 'opacity-60' : 'opacity-0'}`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none transition-opacity duration-300 ${showRightScroll ? 'opacity-60' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
}