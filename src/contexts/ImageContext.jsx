import { createContext, useContext, useState } from "react";

const ImageContext = createContext();

export function ImageProvider({ children }) {
  const [imgDataURL, setImgDataURL] = useState(null);
  const [monitorCanvas, setMonitorCanvas] = useState(null);
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [mainCanvas, setMainCanvas] = useState(null);

  return (
    <ImageContext.Provider value={{ 
      imgDataURL, setImgDataURL, 
      monitorCanvas, setMonitorCanvas, 
      previewCanvas, setPreviewCanvas,
      mainCanvas, setMainCanvas
       }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  return useContext(ImageContext);
}
