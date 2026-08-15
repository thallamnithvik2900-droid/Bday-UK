"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHOTOS = [
  "/photos/photo1.jpg",
  "/photos/photo2.jpg",
  "/photos/photo3.jpg",
  "/photos/photo4.jpg",
].reverse();

const CONFIG = {
  herName: "Somyaaaaaaaaa",
  secretCode: "020",
  letter:
    "You deserve all the happiness, laughter and beautiful memories this year can bring. I made this little surprise just for you, because you are someone worth celebrating every single day. Happy Birthday ❤️",
};

export default function Home() {
  const [screen, setScreen] = useState(0);
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [popped, setPopped] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  const balloons = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const go = (n) => setScreen(n);

  const unlock = () => {
    if (code === CONFIG.secretCode) {
      setWrong(false);
      go(2);
    } else {
      setWrong(true);
    }
  };

  const press = (n) => {
    if (n === "back") return setCode((v) => v.slice(0, -1));
    if (n === "ok") return unlock();
    if (code.length < 3) setCode((v) => v + n);
  };

  useEffect(() => {
    const fn = (e) => {
      if (screen !== 1) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") press("back");
      if (e.key === "Enter") press("ok");
    };
    addEventListener("keydown", fn);
    return () => removeEventListener("keydown", fn);
  }, [screen, code]);

  useEffect(() => {
    if (audioRef.current) {
      if (musicOn) {
        audioRef.current.play().catch(() => { });
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicOn]);
  useEffect(() => {
    if (!revealed && screen === 5) {
      setTimeout(() => {
        const canvas = document.querySelector(".scratch-canvas");
        if (canvas) {
          const ctx = canvas.getContext("2d");
          const cover = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          cover.addColorStop(0, "#ffb4c6");
          cover.addColorStop(0.32, "#d94f78");
          cover.addColorStop(0.62, "#f58aa5");
          cover.addColorStop(1, "#9d294f");
          ctx.fillStyle = cover;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // A subtle foil texture makes the cover look like a real scratch card.
          for (let i = 0; i < 850; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.16})`;
            ctx.fillRect(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              1 + Math.random() * 3,
              1 + Math.random() * 3
            );
          }

          ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
          ctx.lineWidth = 2;
          ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
          ctx.fillStyle = "#fff7f9";
          ctx.textAlign = "center";
          ctx.font = "700 16px DM Sans, sans-serif";
          ctx.fillText("SCRATCH HERE", canvas.width / 2, canvas.height / 2 - 4);
          ctx.font = "13px DM Sans, sans-serif";
          ctx.fillText("A little surprise is waiting for you", canvas.width / 2, canvas.height / 2 + 26);

          let isDrawing = false;

          const checkReveal = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let transparent = 0;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] === 0) transparent++;
            }
            if (transparent > data.length / 4 * 0.35) {
              setRevealed(true);
            }
          };

          const scratch = (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            let x, y;

            if (e.touches) {
              x = e.touches[0].clientX - rect.left;
              y = e.touches[0].clientY - rect.top;
            } else {
              x = e.clientX - rect.left;
              y = e.clientY - rect.top;
            }

            ctx.clearRect(x - 25, y - 25, 50, 50);
            checkReveal();
          };

          canvas.addEventListener("mousedown", () => (isDrawing = true));
          canvas.addEventListener("mouseup", () => (isDrawing = false));
          canvas.addEventListener("mousemove", scratch);
          canvas.addEventListener("touchstart", (e) => { isDrawing = true; e.preventDefault(); });
          canvas.addEventListener("touchend", () => (isDrawing = false));
          canvas.addEventListener("touchmove", (e) => { scratch(e); e.preventDefault(); });

          return () => {
            canvas.removeEventListener("mousedown", () => { });
            canvas.removeEventListener("mouseup", () => { });
            canvas.removeEventListener("mousemove", scratch);
            canvas.removeEventListener("touchstart", () => { });
            canvas.removeEventListener("touchend", () => { });
            canvas.removeEventListener("touchmove", scratch);
          };
        }
      }, 100);
    }
  }, [revealed, screen]);
  return (
    <main className="stage">
      <Particles />

      <audio
        ref={audioRef}
        src="/music/birthday.mp3"
        loop
        preload="auto"
      />

      <button className="music" onClick={() => setMusicOn(!musicOn)}>
        {musicOn ? "♫" : "♪"}
      </button>

      <AnimatePresence mode="wait">
        {screen === 0 && (
          <Page key="0">
            <div className="tiny">A LITTLE SOMETHING FOR YOU</div>
            <h1>Hey {CONFIG.herName}...</h1>
            <p className="sub">I made something special for your birthday.</p>

            <motion.button
              className="gift-box"
              whileHover={{ y: -7, rotate: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => go(1)}
            >
              <div className="gift-lid"><span>♡</span></div>
              <div className="gift-body"><i /><b /></div>
            </motion.button>

            <button className="pink-btn" onClick={() => go(1)}>
              OPEN YOUR SURPRISE <span>→</span>
            </button>
          </Page>
        )}

        {screen === 1 && (
          <Page key="1">
            <div className="lock">♡</div>
            <div className="tiny">ONLY YOU CAN ENTER</div>
            <h2>A tiny secret...</h2>
            <p className="sub">Enter the three-digit code.</p>

            <div className="dots">
              {[0, 1, 2].map((i) => (
                <span key={i} className={code.length > i ? "filled" : ""} />
              ))}
            </div>

            <div className="keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✓"].map((n) => (
                <button key={n} onClick={() => press(n === "⌫" ? "back" : n === "✓" ? "ok" : String(n))}>
                  {n}
                </button>
              ))}
            </div>
            {wrong && <div className="wrong">Not that one... try again ❤️</div>}
          </Page>
        )}

        {screen === 2 && (
          <Page key="2">
            <div className="tiny">TODAY IS ALL ABOUT YOU</div>
            <h1 className="birthday">Happy Birthday<br /><em>{CONFIG.herName}</em> ❤️</h1>

            <div className="cake">
              <div className="candle"><span>✦</span></div>
              <div className="icing" />
              <div className="cake-base" />
              <div className="plate" />
            </div>

            <p className="sub">May your day be as beautiful as your smile.</p>
            <button className="pink-btn" onClick={() => go(3)}>KEEP GOING ✨</button>
          </Page>
        )}

        {screen === 3 && (
          <Page key="3">
            <div className="tiny">A LITTLE GAME</div>
            <h2>Pop the balloons 🎈</h2>
            <p className="sub">Pop every balloon to unlock the next surprise.</p>
            <div className="count">{popped.length} / 12</div>

            <div className="balloons">
              {balloons.map((i) =>
                popped.includes(i) ? null : (
                  <motion.button
                    key={i}
                    className="balloon"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 1.35, opacity: 0 }}
                    onClick={() => setPopped((p) => [...p, i])}
                  >
                    <span>♥</span>
                  </motion.button>
                )
              )}
            </div>

            {popped.length === 12 && (
              <button className="pink-btn" onClick={() => go(4)}>YOU DID IT →</button>
            )}
          </Page>
        )}

        {screen === 4 && (
          <Page key="4">
            <div className="tiny">OUR MEMORIES</div>
            <h2>A little piece of us 🧩</h2>
            <p className="sub">Tap the cards and reveal the memories.</p>

            <div className="photo-grid">
              {PHOTOS.map((src, i) => (
                <motion.button
                  key={src}
                  className="photo-card"
                  whileHover={{ y: -6 }}
                  onClick={() => setPhotoIndex(i)}
                >
                  <img src={src} alt={`Memory ${i + 1}`} onError={(e) => e.currentTarget.classList.add("missing")} />
                  <span>{i + 1}</span>
                </motion.button>
              ))}
            </div>

            <div className="photo-viewer">
              <div className="photo-placeholder">
                <img
                  src={PHOTOS[photoIndex]}
                  alt="Selected memory"
                />
              </div>
            </div>

            <button
              type="button"
              className="pink-btn screen-four-next"
              onClick={() => {
                setRevealed(false);
                go(5);
              }}
            >
              ONE MORE SURPRISE →
            </button>
          </Page>
        )}

        {screen === 5 && (
          <Page key="5">
            <div className="tiny">JUST FOR YOU</div>
            <h2>There is a message hidden here...</h2>
            <p className="sub">Scratch the card to reveal your message.</p>

            <div className="scratch-card-container">
              <div className="scratch-content">
                <p>{CONFIG.letter}</p>
              </div>
              {!revealed && (
                <button
                  type="button"
                  className="scratch-cover"
                  onClick={() => setRevealed(true)}
                  aria-label="Reveal your hidden birthday message"
                >
                  <span className="scratch-cover-icon">✦</span>
                  <strong>TAP TO REVEAL</strong>
                  <small>Your surprise is hidden inside</small>
                </button>
              )}
            </div>

            {revealed && <button className="pink-btn" onClick={() => go(6)}>READ THE LETTER 💌</button>}
            {!revealed && <p style={{ fontSize: '12px', color: '#cba9b3', marginTop: '10px' }}>Tap the cover to open your surprise</p>}
          </Page>
        )}

        {screen === 6 && (
          <Page key="6">
            <div className="letter">
              <div className="tiny">A LETTER FOR YOU</div>
              <h2>Happy Birthday ❤️</h2>
              <div className="rule" />
              <p>{CONFIG.letter}</p>
              <p className="hand">With lots of love,<br />from me ❤️</p>
            </div>
            <button className="outline-btn" onClick={() => go(0)}>START AGAIN ↻</button>
          </Page>
        )}
      </AnimatePresence>
    </main>
  );
}

function Page({ children }) {
  return (
    <motion.section
      className="page"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -28 }}
      transition={{ duration: .45, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

function Particles() {
  return (
    <div className="particles" aria-hidden>
      {Array.from({ length: 35 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 29) % 100}%`, animationDelay: `${(i % 9) * -1.4}s`, animationDuration: `${6 + (i % 6)}s` }} />
      ))}
    </div>
  );
}
