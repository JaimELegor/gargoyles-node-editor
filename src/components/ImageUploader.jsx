// src/components/ImageUploader.jsx
import React, { useState, useRef } from "react";
import { useImage } from "../contexts/ImageContext";

export default function ImageUploader({ onImageLoad }) {
  const fileInputRef = useRef();
  const [opened, setOpened] = useState(false);
  const { canvasSize } = useImage();
  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageLoad(event.target.result); // base64 string
        setOpened(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={opened ? "overlay" : "overlay-static"}
      style={{
  width: opened ? `${canvasSize.width}px` : "600px",
  height: opened ? `${canvasSize.height}px` : "400px"
}}
      onClick={() => fileInputRef.current.click()}
    >
      <svg style={{ display: "none" }}>
        <filter id="text-blur">
          <feGaussianBlur stdDeviation="1.75" />
        </filter>
      </svg>
      <p style={{ filter: "url(#text-blur)", color: "white", textAlign: "center" }}>CHOOSE AN IMAGE</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

