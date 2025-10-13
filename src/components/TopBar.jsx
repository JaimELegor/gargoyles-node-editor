import '../styles/TopBar.css';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
export default function TopBar() {
    const [open, setOpen] = useState(false);
    return (
        <>

            <div className="topbar">
                <div className="menu-wrapper">
                    <div className="menu-button" id="appearanceBtn" onClick={() => setOpen(!open)}>Appearance</div>
                    {open && (
                        <ThemeToggle />
                )
            }
                </div>

                
            </div>

            
            
    </>
  );
}
