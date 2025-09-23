import { createContext, useContext, useState } from "react";

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [activeMode, setActiveMode] = useState(null);
  return (
    <ModeContext.Provider value={{ activeMode, setActiveMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}