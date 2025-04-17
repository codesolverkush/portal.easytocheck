import { useState, useEffect } from 'react';
import SupportPopup from '../component/forms/SupportPopup';

// Custom event name
export const OPEN_SUPPORT_POPUP_EVENT = 'openSupportPopup';

function SupportPopupProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Create a global event listener for opening the support popup
  useEffect(() => {
    const openSupportPopup = () => setIsOpen(true);
    window.addEventListener(OPEN_SUPPORT_POPUP_EVENT, openSupportPopup);
    
    return () => {
      window.removeEventListener(OPEN_SUPPORT_POPUP_EVENT, openSupportPopup);
    };
  }, []);

  return (
    <>
      {children}
      <SupportPopup isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

export default SupportPopupProvider;