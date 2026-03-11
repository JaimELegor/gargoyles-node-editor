import { createContext, useContext, useState, useEffect, useRef } from "react";

const ImageContext = createContext();

export function ImageProvider({ children }) {
  const [imgDataURL, setImgDataURL] = useState(() => {
    return sessionStorage.getItem("imgDataURL") || null;
  });
  const [monitorCanvas, setMonitorCanvas] = useState(null);
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [mainCanvas, setMainCanvas] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (imgDataURL) {
      sessionStorage.setItem("imgDataURL", imgDataURL);
    } else {
      sessionStorage.removeItem("imgDataURL");
    }
  }, [imgDataURL]);

  useEffect(() => {
    previewCanvasRef.current = previewCanvas;
  }, [previewCanvas]);

  return (
    <ImageContext.Provider value={{ 
      imgDataURL, setImgDataURL, 
      monitorCanvas, setMonitorCanvas, 
      previewCanvas, setPreviewCanvas,
      mainCanvas, setMainCanvas,
      canvasSize, setCanvasSize,
      previewCanvasRef
       }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  return useContext(ImageContext);
}
