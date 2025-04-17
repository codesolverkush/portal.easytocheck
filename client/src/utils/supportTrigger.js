import { OPEN_SUPPORT_POPUP_EVENT } from '../wrapper/PopupProvider';

// Function that can be imported and used anywhere to trigger the support popup
export const openSupportPopup = () => {
  window.dispatchEvent(new Event(OPEN_SUPPORT_POPUP_EVENT));
};