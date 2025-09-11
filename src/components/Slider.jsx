import React, { useState } from "react";
import '../styles/Slider.css';

export default function Slider({ label, value, onChange, min, max, step }) {

  return (
    <>
      <div className="slider">
        <p>{label || "Value"}: {value}</p>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </>
  );
}

