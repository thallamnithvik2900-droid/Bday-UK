"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHOTOS = [
  "/photos/photo1.jpeg",
  "/photos/photo2.jpeg",
  "/photos/photo3.jpeg",
  "/photos/photo4.jpeg",
].reverse();

const CONFIG = {
  herName: "Uday Kiran",
  secretCode: "1319",
  dateOfBirth: new Date(2006, 8, 13),
  letter:
    "Life is always more fun, more honest, and more memorable with a friend like you around. Thanks for every laugh, every random conversation, and every moment you have made brighter. On your birthday, I hope you get the happiness, adventures, and ridiculous amount of cake you deserve. Keep being the wonderfully unforgettable person you are. I am lucky to call you my friend. Cheers to another brilliant year together ✨",
};

const CODE_LENGTH = CONFIG.secretCode.length;

// Sliding puzzle initialization - empty space is represented as null
function generateSolvablePuzzle() {
  const puzzle = [0, 1, 2, 3, 4, 5, 6, 7, null];
  for (let i = 0; i < 100; i++) {
    const emptyIdx = puzzle.indexOf(null);
    const row = Math.floor(emptyIdx / 3);
    const col = emptyIdx % 3;
    const adjacent = [];
    if (row > 0) adjacent.push(emptyIdx - 3);
    if (row < 2) adjacent.push(emptyIdx + 3);
    if (col > 0) adjacent.push(emptyIdx - 1);
    if (col < 2) adjacent.push(emptyIdx + 1);
    const swapIdx = adjacent[Math.floor(Math.random() * adjacent.length)];
    [puzzle[emptyIdx], puzzle[swapIdx]] = [puzzle[swapIdx], puzzle[emptyIdx]];
  }
  return puzzle;
}

const INITIAL_PUZZLE = generateSolvablePuzzle();

const WISHES = [
  "May your year be packed with wins and inside jokes ✨",
  "You deserve the best birthday snack in town 🎂",
  "May every big plan and silly idea find you 🌟",
  "Keep being the wonderfully chaotic you 🎉",
  "Here’s to another year of laughs and adventures 🥂",
];
const BALLOON_COLORS = ["#c78cff, #8a4eda", "#90f18b, #3cbf66", "#ffb1c4, #ed5b83", "#ffe88d, #efae35", "#ff9fca, #e34077"];

export default function Home() {
  const [screen, setScreen] = useState(0);
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [popped, setPopped] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [puzzleTiles, setPuzzleTiles] = useState(INITIAL_PUZZLE);
  const [showAutoSolve, setShowAutoSolve] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const audioRef = useRef(null);

  const balloons = useMemo(() => Array.from({ length: WISHES.length }, (_, i) => i), []);
  const birthdayStats = useMemo(() => getBirthdayStats(CONFIG.dateOfBirth, now), [now]);

  // Check if puzzle is solved
  const puzzleSolved = useMemo(() => {
    return puzzleTiles.every((tile, idx) => idx === 8 ? tile === null : tile === idx);
  }, [puzzleTiles]);

  const go = (n) => setScreen(n);
  const solvePuzzle = () => setPuzzleTiles([0, 1, 2, 3, 4, 5, 6, 7, null]);

  // Sliding puzzle: drag adjacent tile to move it into empty space
  const handlePuzzleDrag = (index, info) => {
    const emptyIdx = puzzleTiles.indexOf(null);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;

    // Check if adjacent (horizontally or vertically)
    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (!isAdjacent) return;

    // Check drag direction and distance
    const { offset } = info;
    const threshold = 25;

    // Determine which direction to move
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      // Vertical drag
      if (row < emptyRow && offset.y > threshold) {
        // Dragged down toward empty space below
        const newTiles = [...puzzleTiles];
        [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
        setPuzzleTiles(newTiles);
      } else if (row > emptyRow && offset.y < -threshold) {
        // Dragged up toward empty space above
        const newTiles = [...puzzleTiles];
        [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
        setPuzzleTiles(newTiles);
      }
    } else {
      // Horizontal drag
      if (col < emptyCol && offset.x > threshold) {
        // Dragged right toward empty space
        const newTiles = [...puzzleTiles];
        [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
        setPuzzleTiles(newTiles);
      } else if (col > emptyCol && offset.x < -threshold) {
        // Dragged left toward empty space
        const newTiles = [...puzzleTiles];
        [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
        setPuzzleTiles(newTiles);
      }
    }
  };

  const popBalloon = (index) => {
    if (popped.includes(index)) return;
    setWishMessage(WISHES[popped.length]);
    setPopped((items) => [...items, index]);
  };

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
    if (code.length < CODE_LENGTH) setCode((v) => v + n);
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
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (screen !== 4 || puzzleSolved) {
      setShowAutoSolve(false);
      return;
    }

    const timer = setTimeout(() => setShowAutoSolve(true), 10_000);
    return () => clearTimeout(timer);
  }, [screen, puzzleSolved]);
  useEffect(() => {
    if (!revealed && screen === 7) {
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
            <div className="tiny">A LITTLE BIRTHDAY SURPRISE FOR MY FRIEND</div>
            <h1>Hey {CONFIG.herName}...</h1>
            <p className="sub">I made something special for my favorite birthday buddy.</p>

            <motion.button
              className="gift-box"
              whileHover={{ y: -7, rotate: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => go(1)}
            >
              <div className="gift-lid"><span>✦</span></div>
              <div className="gift-body"><i /><b /></div>
            </motion.button>

            <button className="pink-btn" onClick={() => go(1)}>
              OPEN YOUR SURPRISE <span>→</span>
            </button>
          </Page>
        )}

        {screen === 1 && (
          <Page key="1">
            <div className="lock">🔐</div>
            <div className="tiny">ONLY MY FRIEND CAN ENTER</div>
            <h2>Best friend access...</h2>
            <p className="sub">Enter the secret code only my best friend would know.</p>
            <div className="friend-badge" aria-label="Best friend access">
              <span>✦</span> BEST FRIEND ACCESS <span>✦</span>
            </div>

            <div className="dots">
              {Array.from({ length: CODE_LENGTH }, (_, i) => i).map((i) => (
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
            {wrong && <div className="wrong">Nope, bestie... try again 🎯</div>}
          </Page>
        )}

        {screen === 2 && (
          <Page key="2" className="birthday-reveal">
            <div className="curtain curtain-left" aria-hidden="true" />
            <div className="curtain curtain-right" aria-hidden="true" />
            <div className="curtain-swag" aria-hidden="true" />
            <div className="reveal-content">
              <div className="tiny">THE SPOTLIGHT IS ALL YOURS</div>
              <p className="reveal-kicker">POV: IT&apos;S YOUR BIRTHDAY</p>
              <h1 className="birthday">Happy Birthday<br /><em>{CONFIG.herName}</em> 🎉</h1>
              <div className="cake">
                <div className="candle"><span>✦</span></div>
                <div className="icing" />
                <div className="cake-base" />
                <div className="plate" />
              </div>
              <p className="sub">May your day be as fun, bright, and unforgettable as you are.</p>
              <button className="pink-btn" onClick={() => go(3)}>START THE FRIENDSHIP FEST ✨</button>
            </div>
          </Page>
        )}

        {screen === 3 && (
          <Page key="3" className="birthday-clock">
            <div className="clock-ribbon ribbon-one" aria-hidden="true" />
            <div className="clock-ribbon ribbon-two" aria-hidden="true" />
            <div className="clock-content">
              <div className="tiny">A DAY WORTH CELEBRATING</div>
              <h2>Happy Birthday<br /><em>{CONFIG.herName}</em> 🌟</h2>
              <p className="born-on">Born on 13 September 2007</p>
              <p className="clock-intro">The world, and my friend group, has been brighter for</p>
              <div className="birthday-stats" aria-label="Time since birth">
                {Object.entries(birthdayStats).map(([label, value]) => (
                  <div key={label}>
                    <strong>{value.toLocaleString()}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="celebration-cake" aria-label="Birthday cake">
                <span className="flame flame-one">✦</span>
                <span className="flame flame-two">✦</span>
                <div className="cake-top" />
                <div className="cake-middle" />
                <div className="cake-bottom" />
                <div className="cake-plate" />
              </div>
              <p className="blow-note">MAKE A WISH AND BLOW THE CANDLES ✨</p>
              <button className="pink-btn" onClick={() => go(4)}>UNLOCK THE FRIENDSHIP FUN →</button>
            </div>
          </Page>
        )}

        {screen === 4 && (
          <Page key="4" className="photo-puzzle-page">
            <div className="tiny">A SPECIAL FRIENDSHIP MEMORY</div>
            <h2>Piece Together the Fun 🧩</h2>
            <p className="sub">Drag the pieces into place to reveal one of our memories.</p>
            <div className="puzzle-reference">
              <img src="/photos/photo1.jpeg" alt="Reference for the completed photo puzzle" />
              <span>REFERENCE PHOTO</span>
            </div>
            <div className="puzzle-progress">
              {puzzleTiles.filter((piece) => piece !== null).length} / 8 PIECES SOLVED
            </div>
            <p className="puzzle-hint">
              {puzzleSolved ? "✓ Puzzle Complete!" : "Drag pieces toward the empty space"}
            </p>
            <div className="photo-puzzle" aria-label="Photo tile puzzle">
              {puzzleTiles.map((piece, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={`puzzle-tile ${piece === null ? "empty" : ""}`}
                  style={piece !== null ? { backgroundPosition: `${(piece % 3) * 50}% ${Math.floor(piece / 3) * 50}%` } : {}}
                  drag={piece !== null}
                  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(event, info) => handlePuzzleDrag(index, info)}
                  whileDrag={{ scale: 1.05, zIndex: 10 }}
                  animate={{ opacity: piece !== null ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  aria-label={piece !== null ? `Puzzle piece ${piece + 1}` : "Empty space"}
                />
              ))}
            </div>
            {puzzleSolved ? (
              <button className="pink-btn" onClick={() => go(5)}>MEMORY UNLOCKED →</button>
            ) : (
              <div className="puzzle-actions">
                <button
                  type="button"
                  className="puzzle-reset"
                  onClick={() => setPuzzleTiles(generateSolvablePuzzle())}
                >
                  RESET PUZZLE
                </button>
                {showAutoSolve && (
                  <button type="button" className="puzzle-solve" onClick={solvePuzzle}>
                    AUTO-SOLVE PUZZLE
                  </button>
                )}
              </div>
            )}
          </Page>
        )}

        {screen === 5 && (
          <Page key="5" className="wish-page">
            <div className="tiny">A LITTLE WISH FROM YOUR FRIEND</div>
            <h2>Pop the Birthday Wishes 🎈</h2>
            <p className="sub">Tap each balloon for a tiny wish from your birthday crew.</p>
            <AnimatePresence mode="wait">
              {wishMessage && (
                <motion.p
                  key={wishMessage}
                  className="wish-message"
                  initial={{ opacity: 0, y: 12, scale: .92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {wishMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="balloons wish-balloons">
              {balloons.map((i) =>
                popped.includes(i) ? null : (
                  <motion.button
                    key={i}
                    className="balloon"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 1.35, opacity: 0 }}
                    onClick={() => popBalloon(i)}
                    style={{ background: `radial-gradient(circle at 30% 25%, #fff8, ${BALLOON_COLORS[i]})` }}
                  >
                    <span>♥</span>
                  </motion.button>
                )
              )}
            </div>
            <div className="count">POPPED {popped.length} / {balloons.length}</div>

            {popped.length === balloons.length && (
              <button className="pink-btn" onClick={() => go(6)}>YOU DID IT →</button>
            )}
          </Page>
        )}

        {screen === 6 && (
          <Page key="6">
            <div className="tiny">OUR FRIENDSHIP ARCHIVE</div>
            <h2>A little piece of our chaos 🧩</h2>
            <p className="sub">Tap the cards to revisit some of our best memories.</p>

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
                go(7);
              }}
            >
              ONE MORE SURPRISE →
            </button>
          </Page>
        )}

        {screen === 7 && (
          <Page key="7">
            <div className="tiny">JUST FOR MY FAVORITE FRIEND</div>
            <h2>There is a message hidden here...</h2>
            <p className="sub">Scratch the card to reveal a birthday note from your friend.</p>

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

            {revealed && <button className="pink-btn" onClick={() => go(8)}>READ THE LETTER 💌</button>}
            {!revealed && <p style={{ fontSize: '12px', color: '#cba9b3', marginTop: '10px' }}>Tap the cover to open your surprise</p>}
          </Page>
        )}

        {screen === 8 && (
          <Page key="8">
            <div className="letter">
              <div className="tiny">A NOTE FROM YOUR FRIEND</div>
              <h2>Happy Birthday ✨</h2>
              <div className="rule" />
              <p>{CONFIG.letter}</p>
              <p className="hand">Your friend for all the adventures,<br />always 🎉</p>
            </div>
            <button className="outline-btn" onClick={() => go(0)}>START AGAIN ↻</button>
          </Page>
        )}
      </AnimatePresence>
    </main>
  );
}

function getBirthdayStats(dateOfBirth, now) {
  let years = now.getFullYear() - dateOfBirth.getFullYear();
  const birthdayThisYear = new Date(now.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
  if (now < birthdayThisYear) years--;

  const elapsed = Math.max(0, now.getTime() - dateOfBirth.getTime());
  const totalMinutes = Math.floor(elapsed / 60_000);
  return {
    years,
    days: Math.floor(elapsed / 86_400_000),
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
  };
}

function Page({ children, className = "" }) {
  return (
    <motion.section
      className={`page ${className}`}
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
