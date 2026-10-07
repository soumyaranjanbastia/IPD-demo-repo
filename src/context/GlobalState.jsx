import useStore from '../store/useStore';

export const useGlobal = () => useStore();

// Dummy provider for compatibility with App.jsx
export const GlobalProvider = ({ children }) => {
  return <>{children}</>;
};
