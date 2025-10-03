// src/components/ImageUploader.jsx
import React, { useState, useRef } from "react";
import { useImage } from "../contexts/ImageContext";
import "../styles/ImageUploader.css"

export default function ImageUploader({ onImageLoad }) {
  const fileInputRef = useRef();
  const [opened, setOpened] = useState(false);
  const { canvasSize, imgDataURL } = useImage();
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
      className={ imgDataURL ? "overlay" : "overlay-static"}
      style={{
  width: imgDataURL ? `${canvasSize.width}px` : "600px",
  height: imgDataURL ? `${canvasSize.height}px` : "400px"
}}
      onClick={() => fileInputRef.current.click()}
    >
      <svg style={{ display: "none" }}>
        <filter id="text-blur">
          <feGaussianBlur stdDeviation="1.75" />
        </filter>
      </svg>
      <p className="overlay-uploader">CHOOSE AN IMAGE</p>

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

