import '../styles/MarqueeMotd.css';

export default function Marquee() {
  return (
    <div className="breaking-news">
      <img
        className="breaking-logo"
        src="breaking-news.png"
        width="300"
        height="50"
        alt="Breaking News Logo"
      />

      {/* Hidden SVG filter definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="text-blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </svg>

      <div className="marquee-wrapper">
        {/* Apply the filter via CSS */}
        <div className="marquee-track" style={{ filter: "url(#text-blur)", color: "black" }}>
          🚨 Breaking News: DITHERBOY SUCKS ASS —
          🚨 Breaking News: DITHERBOY SUCKS ASS —
          🚨 Breaking News: DITHERBOY SUCKS ASS —
          🚨 Breaking News: DITHERBOY SUCKS ASS —
        </div>
      </div>
    </div>
  );
}