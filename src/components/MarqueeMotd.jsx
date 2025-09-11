import '../styles/MarqueeMotd.css';
export default function Marquee(){
    return(
        <div className="breaking-news">
              <img className="breaking-logo" src="breaking-news.png" width="300px" height="50px" />
              <div className="marquee-wrapper">
                <svg style={{ display: "none" }}>
                  <filter id="text-blur">
                    <feGaussianBlur stdDeviation="2" />
                  </filter>
                </svg>
                <div className="marquee-track">
                  🚨 Breaking News: DITHERBOY SUCKS ASS —
                  🚨 Breaking News: DITHERBOY SUCKS ASS —
                  🚨 Breaking News: DITHERBOY SUCKS ASS —
                  🚨 Breaking News: DITHERBOY SUCKS ASS —
                </div>
              </div>
            </div>
    );
}