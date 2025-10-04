import { createContext, useContext, useState, useEffect } from "react";

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [activeMode, setActiveMode] = useState(null);
  const [cpuFlag, setCPUFlag] = useState(true);
  useEffect(() => {
  }, [cpuFlag]);
  return (
    <ModeContext.Provider value={{ activeMode, setActiveMode, cpuFlag, setCPUFlag }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}