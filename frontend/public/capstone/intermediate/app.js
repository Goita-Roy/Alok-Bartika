// App.js – EduCode Algorithm Chapter (Fully Interactive)
// Copy and paste this into your React project (e.g., create-react-app)
import React, { useState, useEffect } from 'react';

const LEVELS = [
  {
    id: 1,
    title: "🌅 Get Ready for School",
    desc: "Put the morning routine steps in the correct order.",
    steps: ["Wake up", "Brush teeth", "Eat breakfast", "Wear uniform", "Pack school bag", "Go to school"],
    hint: "What's the very first thing after opening your eyes?"
  },
  {
    id: 2,
    title: "🍜 Make Instant Noodles (Maggi)",
    desc: "Cook noodles in the right sequence.",
    steps: ["Boil water in a pan", "Add noodle cake", "Add tastemaker (masala)", "Stir well", "Cook for 2 minutes", "Serve in a bowl"],
    hint: "Water must be boiling before you add noodles!"
  },
  {
    id: 3,
    title: "📱 Set Up a New Mobile Phone",
    desc: "Activate your new phone correctly.",
    steps: ["Insert SIM card", "Charge the battery", "Press power button", "Select language", "Connect to Wi‑Fi", "Sign in to Google account"],
    hint: "No SIM or charge → phone won't start."
  }
];

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const funnyWrongMessages = [
  "🐢 Oops! That's not the next step. Try again!",
  "🍳 You can't add noodles before boiling water!",
  "🤔 Order matters! Check the hint.",
  "😅 Almost! But the sequence is wrong.",
  "📵 Imagine doing this in real life – that wouldn't work!",
  "💡 Not yet! Find the next logical step."
];

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [originalSteps, setOriginalSteps] = useState([]);
  const [availableSteps, setAvailableSteps] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsThisLevel, setPointsThisLevel] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  const loadLevel = (idx) => {
    const levelData = LEVELS[idx];
    setOriginalSteps(levelData.steps);
    setAvailableSteps(shuffleArray(levelData.steps));
    setNextIndex(0);
    setLevelCompleted(false);
    setMessage("");
    setMsgType("info");
    setShowHint(false);
    setPointsThisLevel(0);
    setAllCompleted(false);
  };

  useEffect(() => {
    if (levelIndex < LEVELS.length) loadLevel(levelIndex);
    else setAllCompleted(true);
  }, [levelIndex]);

  const handleStepClick = (clickedStep) => {
    if (levelCompleted) {
      setMessage("🎉 Level finished! Click 'Next Level' to continue.");
      setMsgType("info");
      return;
    }
    const correctStep = originalSteps[nextIndex];
    if (clickedStep === correctStep) {
      const stepPoints = 10;
      setTotalPoints(prev => prev + stepPoints);
      setPointsThisLevel(prev => prev + stepPoints);
      setMessage(`✅ Correct! +${stepPoints} points. "${clickedStep}" is right.`);
      setMsgType("success");

      const newAvailable = availableSteps.filter(step => step !== clickedStep);
      setAvailableSteps(newAvailable);
      const newNextIndex = nextIndex + 1;
      setNextIndex(newNextIndex);

      if (newNextIndex === originalSteps.length) {
        const bonus = 50;
        setTotalPoints(prev => prev + bonus);
        setPointsThisLevel(prev => prev + bonus);
        setLevelCompleted(true);
        setMessage(`🏆 LEVEL COMPLETE! +${bonus} bonus! 🏆`);
        setMsgType("success");
        if (levelIndex === LEVELS.length - 1) setAllCompleted(true);
      }
    } else {
      const randomMsg = funnyWrongMessages[Math.floor(Math.random() * funnyWrongMessages.length)];
      setMessage(randomMsg);
      setMsgType("error");
    }
  };

  const resetLevel = () => {
    if (levelCompleted) {
      setMessage("Level already done! Go next or replay from start.");
      return;
    }
    setTotalPoints(prev => prev - pointsThisLevel);
    loadLevel(levelIndex);
  };

  const goToNextLevel = () => {
    if (!levelCompleted && nextIndex !== originalSteps.length) {
      setMessage("⚠️ Finish the current level first!");
      setMsgType("error");
      return;
    }
    if (levelIndex + 1 < LEVELS.length) setLevelIndex(levelIndex + 1);
    else setAllCompleted(true);
  };

  const restartGame = () => {
    setLevelIndex(0);
    setTotalPoints(0);
    setAllCompleted(false);
    loadLevel(0);
  };

  const current = LEVELS[levelIndex];
  const progress = ((nextIndex) / originalSteps.length) * 100;

  return (
    <div className="app-container">
      <div className="content">
        <h1>🧠 EduCode: Algorithm Lab</h1>
        <p className="subhead">Class 6–8 • Step‑by‑step thinking • Order matters!</p>

        {allCompleted ? (
          <div className="completion">
            <div className="trophy">🏆🏅🎉</div>
            <h2>You are an Algorithm Master!</h2>
            <p>Total score: {totalPoints} points</p>
            <button onClick={restartGame} className="btn restart">Play Again 🔄</button>
          </div>
        ) : (
          <>
            <div className="game-header">
              <div className="level-badge">Level {levelIndex+1}/{LEVELS.length}</div>
              <div className="score">⭐ {totalPoints} pts</div>
            </div>

            <div className="level-card">
              <h2>{current.title}</h2>
              <p>{current.desc}</p>
              <div className="progress-bar"><div style={{ width: `${progress}%` }}></div></div>
              <p>✅ {nextIndex} / {originalSteps.length} steps done</p>
            </div>

            <div className="steps">
              <h3>📌 Click steps in CORRECT order:</h3>
              <div className="step-grid">
                {availableSteps.map((step, i) => (
                  <button key={i} className="step-btn" onClick={() => handleStepClick(step)}>{step}</button>
                ))}
              </div>
            </div>

            <div className={`message ${msgType}`}>{message || "👉 Click a step to start!"}</div>

            <div className="actions">
              <button className="btn hint" onClick={() => setShowHint(!showHint)}>💡 {showHint ? "Hide Hint" : "Show Hint"}</button>
              <button className="btn reset" onClick={resetLevel}>⟳ Reset Level</button>
              <button className="btn next" onClick={goToNextLevel}>➡ Next Level</button>
            </div>
            {showHint && <div className="hint">💭 Hint: {current.hint}</div>}

            <div className="real-life">
              <h4>🌍 Algorithm in Real Life</h4>
              <p><strong>Google Maps:</strong> Finds shortest route using step‑by‑step logic (location → destination → roads → fastest path).</p>
              <p><strong>Recipes:</strong> Cooking instructions are algorithms – wrong order = bad dish!</p>
            </div>
          </>
        )}
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', 'Poppins', system-ui; }
        body { background: linear-gradient(145deg, #1e2a3e 0%, #0f1724 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .app-container { max-width: 1200px; width: 100%; margin: 0 auto; }
        .content { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 48px; padding: 30px; box-shadow: 0 25px 45px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); }
        h1 { font-size: 2.2rem; color: #ffd966; text-align: center; margin-bottom: 8px; }
        .subhead { text-align: center; color: #cbd5e6; margin-bottom: 30px; }
        .game-header { display: flex; justify-content: space-between; background: #0f212e; padding: 12px 20px; border-radius: 60px; margin-bottom: 24px; }
        .level-badge { background: #facc15; color: #1e293b; font-weight: bold; padding: 4px 16px; border-radius: 40px; }
        .score { background: #2dd4bf; color: #0f1724; font-weight: bold; padding: 4px 16px; border-radius: 40px; }
        .level-card { background: #ffffffdd; backdrop-filter: blur(4px); border-radius: 32px; padding: 20px; margin-bottom: 24px; color: #0f1724; }
        .level-card h2 { font-size: 1.8rem; margin-bottom: 8px; }
        .progress-bar { background: #cbd5e1; border-radius: 20px; height: 12px; margin: 12px 0; overflow: hidden; }
        .progress-bar div { background: #10b981; height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 20px; }
        .steps h3 { color: #f1f5f9; margin-bottom: 16px; }
        .step-grid { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 20px; }
        .step-btn { background: #facc15; border: none; padding: 12px 24px; border-radius: 60px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.2s; color: #1e293b; box-shadow: 0 4px 0 #b45309; }
        .step-btn:hover { transform: translateY(-2px); background: #ffdf6b; }
        .step-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #b45309; }
        .message { background: #1e293b; border-radius: 40px; padding: 12px 20px; margin: 20px 0; font-weight: 500; text-align: center; }
        .message.success { background: #10b981; color: white; }
        .message.error { background: #ef4444; color: white; }
        .message.info { background: #3b82f6; color: white; }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin: 16px 0; }
        .btn { padding: 10px 22px; border: none; border-radius: 40px; font-weight: bold; cursor: pointer; transition: 0.1s; font-size: 0.9rem; }
        .hint { background: #fef9c3; color: #854d0e; padding: 12px; border-radius: 28px; margin-bottom: 20px; text-align: center; }
        .real-life { background: #0f172a; border-radius: 28px; padding: 18px; margin-top: 20px; border-left: 8px solid #facc15; }
        .real-life h4 { color: #facc15; margin-bottom: 10px; }
        .real-life p { color: #e2e8f0; margin-top: 8px; }
        .completion { text-align: center; background: #2dd4bf20; border-radius: 48px; padding: 40px; }
        .trophy { font-size: 4rem; margin-bottom: 16px; }
        .restart { background: #facc15; font-size: 1.2rem; margin-top: 20px; }
        @media (max-width: 680px) { .content { padding: 20px; } .step-btn { padding: 8px 16px; } }
      `}</style>
    </div>
  );
}