import '../styles/Windows.css';
export default function Window({ children, title, close }) {
  return (
    <div className="window">
      <div className="title-bar">

        <span className="title">{title}</span>
        <button className="close-btn" onClick={() => close()}>x</button>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
}
