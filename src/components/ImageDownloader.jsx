import { useImage } from "../contexts/ImageContext";


function DownloadButton({ filename = "download.png" }) {
  const { mainCanvas } = useImage();
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = mainCanvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  };

  return (
    <button disabled={!mainCanvas} onClick={handleDownload}>
      Download Image
    </button>
  );
}

export default DownloadButton;