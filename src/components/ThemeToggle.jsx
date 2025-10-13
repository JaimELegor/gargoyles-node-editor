import { useTheme } from "../contexts/ThemeContext";
import "../styles/ThemeToggle.css";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown theme-dropdown">
      <div 
        className="dropdown-item"
        onClick={() => setTheme("neon")}
      >
        Neon
      </div>
      <div 
        className="dropdown-item"
        onClick={() => setTheme("light")}
      >
        Light
      </div>
      <div 
        className="dropdown-item"
        onClick={() => setTheme("dark")}
      >
        Dark
      </div>
    </div>
  );
}