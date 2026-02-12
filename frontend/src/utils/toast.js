import { toast as reactToast } from 'react-toastify';

// Default toast options matching Profile page style
const defaultOptions = {
  autoClose: 1500,
  position: 'top-center',
  pauseOnHover: false,
  theme: 'dark'
};

// Custom toast wrapper with consistent styling
export const toast = {
  success: (message, options = {}) => 
    reactToast.success(message, { ...defaultOptions, ...options }),
  
  error: (message, options = {}) => 
    reactToast.error(message, { ...defaultOptions, ...options }),
  
  info: (message, options = {}) => 
    reactToast.info(message, { ...defaultOptions, ...options }),
  
  warning: (message, options = {}) => 
    reactToast.warning(message, { ...defaultOptions, ...options }),
  
  // For any other toast methods
  dismiss: reactToast.dismiss,
  promise: reactToast.promise
};

export default toast;
