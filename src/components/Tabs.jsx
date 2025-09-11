import React, { useState } from "react";
import '../styles/Tabs.css';

export default function Tabs({ children, defaultActive = 0 }) {
  // initialize active tab from props
  const [active, setActive] = useState(defaultActive);

  return (
    <>
      <div className="tabs">
        {React.Children.map(children, (child, i) => (
          <div
            key={i}
            className={`tab ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            {child.props.label}
          </div>
        ))}
      </div>

      <div className="panel-border">
        <div className="panel">
          {React.Children.toArray(children)[active].props.children}
        </div>
      </div>
    </>
  );
}

// wrapper component
export function Tab({ children }) {
  return <>{children}</>;
}
