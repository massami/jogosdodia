/**
 * FIFA World Cup 2026 Live Matches Widget Engine
 * Handles real-time system clock, live API fetching, local schedule fallback,
 * responsive rendering, and interactive live game simulation.
 */

// Global Match State
let matches = [];
let isSimulationMode = false;
let updateIntervalId = null;
let clockIntervalId = null;
let simulationState = {
  activeGameId: "3", // Canada vs Bosnia & Herzegovina
  timeElapsed: 70, // Start simulation at 70'
  homeScore: 1,
  awayScore: 1,
  homeScorers: ["L. Millar 34'"],
  awayScorers: ["E. Džeko 42'"],
  possession: 52,
  shotsHome: 9,
  shotsAway: 7,
  foulsHome: 6,
  foulsAway: 8,
  events: [
    { time: "42'", desc: "Gol! Edin Džeko empata para a Bósnia com assistência de Krunić!" },
    { time: "34'", desc: "Gol! Liam Millar abre o placar para o Canadá após cruzamento de Davies!" },
    { time: "12'", desc: "Cartão Amarelo: Amar Dedić (Bósnia) por falta dura." }
  ]
};

// Team country code mapping for SVGs flags
const FLAG_SVGS = {
  "Mexico": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#006847"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#C8102E"/><circle cx="1.5" cy="1" r="0.12" fill="#8B5A2B"/><polygon points="1.45,0.95 1.55,0.95 1.5,1.05" fill="#006847"/></svg>`,
  "South Africa": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#C8102E"/><rect y="1" width="3" height="1" fill="#002395"/><polygon points="0,0 1.2,1 0,2" fill="#007A3D"/><polygon points="0,0 0.9,1 0,2" fill="#000000"/><polygon points="0,0 1.5,1 0,2" fill="none" stroke="#FFFFFF" stroke-width="0.15"/></svg>`,
  "South Korea": `<svg class="flag-icon" viewBox="0 0 30 20"><rect width="30" height="20" fill="white"/><circle cx="15" cy="10" r="4.5" fill="#cd2e3a"/><path d="M15,10 A4.5,4.5 0 0,0 15,14.5 A2.25,2.25 0 0,0 15,12.25 A2.25,2.25 0 0,1 15,10" fill="#0047a0"/><path d="M15,10 A4.5,4.5 0 0,1 15,5.5 A2.25,2.25 0 0,1 15,7.75 A2.25,2.25 0 0,0 15,10" fill="#cd2e3a"/><path d="M7,5 L9,3 M7.7,5.5 L9.7,3.5 M8.4,6 L10.4,4" stroke="black" stroke-width="0.8"/><path d="M21,16 L23,14 M21.7,16.5 L23.7,14.5 M22.4,17 L24.4,15" stroke="black" stroke-width="0.8"/><path d="M21,4 L23,6 M22.4,3 L24.4,5" stroke="black" stroke-width="0.8"/><path d="M21.7,4.5 L23.7,6.5 M7,14 L9,16 M7.7,14.5 L9.7,16.5" stroke="black" stroke-width="0.8"/></svg>`,
  "Czech Republic": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="white"/><rect y="1" width="3" height="1" fill="#D7141A"/><polygon points="0,0 1.5,1 0,2" fill="#11457E"/></svg>`,
  "Czechia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="white"/><rect y="1" width="3" height="1" fill="#D7141A"/><polygon points="0,0 1.5,1 0,2" fill="#11457E"/></svg>`,
  "Canada": `<svg class="flag-icon" viewBox="0 0 2 1"><rect width="2" height="1" fill="#FF0000"/><rect x="0.5" width="1" height="1" fill="#FFFFFF"/><path d="M 1 0.22 L 1.04 0.42 L 1.25 0.38 L 1.15 0.52 L 1.35 0.62 L 1.1 0.68 L 1.02 0.83 L 1 0.88 L 0.98 0.83 L 0.9 0.68 L 0.65 0.62 L 0.85 0.52 L 0.75 0.38 L 0.96 0.42 Z" fill="#FF0000"/></svg>`,
  "Bosnia and Herzegovina": `<svg class="flag-icon" viewBox="0 0 2 1"><rect width="2" height="1" fill="#002F6C"/><polygon points="0.5,0 1.5,0 1.5,1" fill="#FECB00"/><circle cx="0.55" cy="0.95" r="0.035" fill="white"/><circle cx="0.65" cy="0.8" r="0.035" fill="white"/><circle cx="0.75" cy="0.65" r="0.035" fill="white"/><circle cx="0.85" cy="0.5" r="0.035" fill="white"/><circle cx="0.95" cy="0.35" r="0.035" fill="white"/><circle cx="1.05" cy="0.2" r="0.035" fill="white"/><circle cx="1.15" cy="0.05" r="0.035" fill="white"/></svg>`,
  "United States": `<svg class="flag-icon" viewBox="0 0 19 10"><rect width="19" height="10" fill="#B22234"/><rect y="0.77" width="19" height="0.77" fill="#FFFFFF"/><rect y="2.3" width="19" height="0.77" fill="#FFFFFF"/><rect y="3.85" width="19" height="0.77" fill="#FFFFFF"/><rect y="5.38" width="19" height="0.77" fill="#FFFFFF"/><rect y="6.92" width="19" height="0.77" fill="#FFFFFF"/><rect y="8.46" width="19" height="0.77" fill="#FFFFFF"/><rect width="7.6" height="5.38" fill="#3C3B6E"/><circle cx="1.2" cy="0.9" r="0.15" fill="#FFFFFF"/><circle cx="2.5" cy="0.9" r="0.15" fill="#FFFFFF"/><circle cx="3.8" cy="0.9" r="0.15" fill="#FFFFFF"/><circle cx="5.1" cy="0.9" r="0.15" fill="#FFFFFF"/><circle cx="6.4" cy="0.9" r="0.15" fill="#FFFFFF"/><circle cx="1.8" cy="1.8" r="0.15" fill="#FFFFFF"/><circle cx="3.1" cy="1.8" r="0.15" fill="#FFFFFF"/><circle cx="4.4" cy="1.8" r="0.15" fill="#FFFFFF"/><circle cx="5.7" cy="1.8" r="0.15" fill="#FFFFFF"/><circle cx="1.2" cy="2.7" r="0.15" fill="#FFFFFF"/><circle cx="2.5" cy="2.7" r="0.15" fill="#FFFFFF"/><circle cx="3.8" cy="2.7" r="0.15" fill="#FFFFFF"/><circle cx="5.1" cy="2.7" r="0.15" fill="#FFFFFF"/><circle cx="6.4" cy="2.7" r="0.15" fill="#FFFFFF"/><circle cx="1.8" cy="3.6" r="0.15" fill="#FFFFFF"/><circle cx="3.1" cy="3.6" r="0.15" fill="#FFFFFF"/><circle cx="4.4" cy="3.6" r="0.15" fill="#FFFFFF"/><circle cx="5.7" cy="3.6" r="0.15" fill="#FFFFFF"/><circle cx="1.2" cy="4.5" r="0.15" fill="#FFFFFF"/><circle cx="2.5" cy="4.5" r="0.15" fill="#FFFFFF"/><circle cx="3.8" cy="4.5" r="0.15" fill="#FFFFFF"/><circle cx="5.1" cy="4.5" r="0.15" fill="#FFFFFF"/><circle cx="6.4" cy="4.5" r="0.15" fill="#FFFFFF"/></svg>`,
  "Paraguay": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#D1121A"/><rect y="0.67" width="3" height="0.67" fill="#FFFFFF"/><rect y="1.33" width="3" height="0.67" fill="#0038A8"/><circle cx="1.5" cy="1" r="0.18" fill="#FFFFFF" stroke="#0038A8" stroke-width="0.02"/><circle cx="1.5" cy="1" r="0.08" fill="#FECB00"/></svg>`
};

// Pre-configured matches schedule (June 12, 2026) as fallback / starting state
const LOCAL_SCHEDULE = [
  {
    id: "2",
    group: "A",
    home_team_name_en: "South Korea",
    away_team_name_en: "Czechia",
    home_score: 2,
    away_score: 1,
    home_scorers: ["Hwang In-beom 67'", "Oh Hyeon-gyu 80'"],
    away_scorers: ["L. Krejčí 59'"],
    finished: true,
    time_elapsed: "finished",
    kickoff_utc: "2026-06-12T02:00:00Z" // Played early June 12 UTC
  },
  {
    id: "3",
    group: "B",
    home_team_name_en: "Canada",
    away_team_name_en: "Bosnia and Herzegovina",
    home_score: 0,
    away_score: 0,
    home_scorers: [],
    away_scorers: [],
    finished: false,
    time_elapsed: "notstarted",
    kickoff_utc: "2026-06-12T19:00:00Z" // 15:00 Toronto / 16:00 User time
  },
  {
    id: "4",
    group: "D",
    home_team_name_en: "United States",
    away_team_name_en: "Paraguay",
    home_score: 0,
    away_score: 0,
    home_scorers: [],
    away_scorers: [],
    finished: false,
    time_elapsed: "notstarted",
    kickoff_utc: "2026-06-13T01:00:00Z" // 18:00 LA (June 12) / 22:00 User time (June 12)
  }
];

// Map of expanded card IDs to keep track across re-renders
let expandedCardIds = new Set();

/**
 * Initialize widget and event listeners
 */
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  setupEventListeners();
  loadMatchData();

  // Setup periodic refresh (every 60 seconds)
  updateIntervalId = setInterval(loadMatchData, 60000);
});

/**
 * Handle Clock and Date header
 */
function initClock() {
  const clockEl = document.getElementById("live-clock");
  const dateEl = document.getElementById("current-date");

  // Format header date
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // Fixed simulated date for the World Cup day: June 12, 2026
  dateEl.innerText = "12 de Junho, 2026";

  function tick() {
    const now = new Date();
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.innerText = `${hours}:${minutes}:${seconds}`;

    // Ticking the countdowns dynamically every second
    if (!isSimulationMode) {
      updateCountdowns();
    }
  }

  tick();
  clockIntervalId = setInterval(tick, 1000);
}

/**
 * Register controls event listeners
 */
function setupEventListeners() {
  const simToggle = document.getElementById("sim-mode-toggle");
  
  simToggle.addEventListener("change", (e) => {
    isSimulationMode = e.target.checked;
    
    if (isSimulationMode) {
      // Start Simulation Engine loop
      startSimulation();
    } else {
      // Revert to Real-time API
      stopSimulation();
    }
  });
}

/**
 * Parse scorers array from API (handling formatting variances)
 */
function parseScorers(scorersVal) {
  if (!scorersVal || scorersVal === "null" || scorersVal === "undefined") return [];
  if (Array.isArray(scorersVal)) return scorersVal;
  
  try {
    // If it's a JSON-like string, parse it
    if (typeof scorersVal === 'string') {
      // Normalize quote symbols and parse
      let clean = scorersVal.replace(/“/g, '"').replace(/”/g, '"');
      // Sometimes it looks like {"player 10'", "player 20'"} or ["player 10'"]
      if (clean.startsWith('{') && clean.endsWith('}')) {
        clean = '[' + clean.slice(1, -1) + ']';
      }
      return JSON.parse(clean);
    }
  } catch (err) {
    console.warn("Error parsing scorers string:", scorersVal, err);
  }
  
  // Return clean text lines if JSON parse failed
  if (typeof scorersVal === 'string') {
    return scorersVal.split(',').map(s => s.trim().replace(/['"{}]+/g, ''));
  }
  return [];
}

/**
 * Fetch World Cup Match Data from API with local fallback
 */
async function loadMatchData() {
  if (isSimulationMode) return; // Keep simulation values intact during simulation

  try {
    const response = await fetch("https://worldcup26.ir/get/games");
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    
    const data = await response.json();
    
    if (data && data.games) {
      // Filter games that are played on June 12, 2026 (local or UTC context)
      // Standardize games list
      const apiGames = data.games.filter(game => {
        // We match: Korea vs Czechia (id 2), Canada vs Bosnia (id 3), USA vs Paraguay (id 4)
        return game.id === "2" || game.id === "3" || game.id === "4";
      });

      if (apiGames.length > 0) {
        // Map API objects to unified structure
        matches = apiGames.map(game => {
          let kickoffUTC = LOCAL_SCHEDULE.find(s => s.id === game.id)?.kickoff_utc;
          
          return {
            id: game.id,
            group: game.group,
            home_team_name_en: game.home_team_name_en === "Korea Republic" ? "South Korea" : game.home_team_name_en,
            away_team_name_en: game.away_team_name_en,
            home_score: parseInt(game.home_score) || 0,
            away_score: parseInt(game.away_score) || 0,
            home_scorers: parseScorers(game.home_scorers),
            away_scorers: parseScorers(game.away_scorers),
            finished: game.finished === "TRUE" || game.time_elapsed === "finished",
            time_elapsed: game.time_elapsed,
            kickoff_utc: kickoffUTC,
            // Provide baseline stats for API matches
            possession: 50,
            shotsHome: game.id === "2" ? 11 : 0,
            shotsAway: game.id === "2" ? 8 : 0,
            foulsHome: game.id === "2" ? 9 : 0,
            foulsAway: game.id === "2" ? 10 : 0,
            events: game.id === "2" ? [
              { time: "80'", desc: "Gol! Oh Hyeon-gyu coloca a Coreia na frente!" },
              { time: "67'", desc: "Gol! Hwang In-beom empata a partida!" },
              { time: "59'", desc: "Gol! Ladislav Krejčí abre o placar para a Czechia!" }
            ] : []
          };
        });
        
        console.log("Match data loaded successfully from API");
        renderMatches();
        return;
      }
    }
  } catch (error) {
    console.warn("Live API fetch failed. Using pre-configured schedule fallback.", error);
  }

  // Fallback to local table structure
  // Build real-time state for fallback matches based on the current system time on June 12
  const now = new Date();
  
  matches = LOCAL_SCHEDULE.map(sched => {
    const kickoff = new Date(sched.kickoff_utc);
    let time_elapsed = sched.time_elapsed;
    let finished = sched.finished;
    let home_score = sched.home_score;
    let away_score = sched.away_score;
    let home_scorers = [...sched.home_scorers];
    let away_scorers = [...sched.away_scorers];
    let events = [];

    // Simulate match happening in real-time fallback if system clock overlaps kickoff
    const diffMs = now - kickoff;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes >= 0 && diffMinutes < 105) {
      // Game is happening live!
      finished = false;
      time_elapsed = diffMinutes > 45 ? `${Math.min(diffMinutes - 15, 90)}'` : `${diffMinutes}'`;
      if (diffMinutes > 45 && diffMinutes <= 60) time_elapsed = "HT";
      
      // Seed some scores based on elapsed minutes
      if (sched.id === "3" && diffMinutes > 30) {
        home_score = 1;
        home_scorers = ["J. David 28'"];
        events = [{ time: "28'", desc: "Gol! Jonathan David marca para o Canadá!" }];
      }
    } else if (diffMinutes >= 105) {
      // Game finished
      finished = true;
      time_elapsed = "finished";
      if (sched.id === "3") {
        home_score = 1;
        away_score = 1;
        home_scorers = ["J. David 28'"];
        away_scorers = ["E. Džeko 77'"];
        events = [
          { time: "77'", desc: "Gol! Edin Džeko empata para a Bósnia!" },
          { time: "28'", desc: "Gol! Jonathan David marca para o Canadá!" }
        ];
      }
    }

    return {
      ...sched,
      home_score,
      away_score,
      home_scorers,
      away_scorers,
      finished,
      time_elapsed,
      possession: 50,
      shotsHome: finished ? 12 : (time_elapsed !== "notstarted" ? 4 : 0),
      shotsAway: finished ? 10 : (time_elapsed !== "notstarted" ? 3 : 0),
      foulsHome: finished ? 8 : (time_elapsed !== "notstarted" ? 2 : 0),
      foulsAway: finished ? 9 : (time_elapsed !== "notstarted" ? 3 : 0),
      events: events.length > 0 ? events : (sched.id === "2" ? [
        { time: "80'", desc: "Gol! Oh Hyeon-gyu coloca a Coreia na frente!" },
        { time: "67'", desc: "Gol! Hwang In-beom empata a partida!" },
        { time: "59'", desc: "Gol! Ladislav Krejčí abre o placar para a Czechia!" }
      ] : [])
    };
  });

  renderMatches();
}

/**
 * Render match cards list
 */
function renderMatches() {
  const listEl = document.getElementById("matches-list");
  listEl.innerHTML = "";

  let anyLive = false;

  matches.forEach(match => {
    const isLive = match.time_elapsed !== "notstarted" && match.time_elapsed !== "finished" && !match.finished;
    if (isLive) anyLive = true;

    // Create Match Card element
    const card = document.createElement("div");
    card.className = `match-card ${isLive ? 'is-live' : ''} ${expandedCardIds.has(match.id) ? 'is-expanded' : ''}`;
    card.setAttribute("data-id", match.id);

    // Get Flag SVGs
    const homeFlag = FLAG_SVGS[match.home_team_name_en] || "";
    const awayFlag = FLAG_SVGS[match.away_team_name_en] || "";

    // Score layout
    let homeScoreHtml = "";
    let awayScoreHtml = "";
    let statusClass = "scheduled";
    let statusText = "Agendado";

    if (match.finished) {
      statusClass = "ft";
      statusText = "Fim";
      homeScoreHtml = `<span class="score">${match.home_score}</span>`;
      awayScoreHtml = `<span class="score">${match.away_score}</span>`;
    } else if (isLive) {
      statusClass = "live";
      statusText = match.time_elapsed === "HT" ? "Intervalo" : `Ao Vivo ${match.time_elapsed}`;
      homeScoreHtml = `<span class="score">${match.home_score}</span>`;
      awayScoreHtml = `<span class="score">${match.away_score}</span>`;
    } else {
      // Scheduled
      statusClass = "scheduled";
      // Format local kickoff time in user local time (e.g. 16:00 or 22:00)
      const date = new Date(match.kickoff_utc);
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      statusText = `${hours}:${mins}`;
      
      // Display 0 instead of - for scheduled matches
      homeScoreHtml = `<span class="score score-unplayed">0</span>`;
      awayScoreHtml = `<span class="score score-unplayed">0</span>`;
    }

    // Build scorers
    let scorersHtml = "";
    if (match.home_scorers.length > 0 || match.away_scorers.length > 0) {
      const homeScorersHtml = match.home_scorers.map(s => `<div class="scorer-item"><span class="soccer-ball">⚽</span> ${s}</div>`).join("");
      const awayScorersHtml = match.away_scorers.map(s => `<div class="scorer-item" style="justify-content: flex-end;">${s} <span class="soccer-ball">⚽</span></div>`).join("");
      scorersHtml = `
        <div class="scorers-list">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>${homeScorersHtml}</div>
            <div style="text-align: right;">${awayScorersHtml}</div>
          </div>
        </div>
      `;
    }

    // Build stats section
    const totalShots = match.shotsHome + match.shotsAway || 1;
    const pctShotsHome = Math.round((match.shotsHome / totalShots) * 100);
    const pctShotsAway = 100 - pctShotsHome;

    const statsHtml = `
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-labels">
            <span>${match.possession}%</span>
            <span class="stat-name">Posse de Bola</span>
            <span>${100 - match.possession}%</span>
          </div>
          <div class="stat-bar-container">
            <div class="stat-bar-home" style="width: ${match.possession}%;"></div>
            <div class="stat-bar-away" style="width: ${100 - match.possession}%;"></div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-labels">
            <span>${match.shotsHome}</span>
            <span class="stat-name">Finalizações</span>
            <span>${match.shotsAway}</span>
          </div>
          <div class="stat-bar-container">
            <div class="stat-bar-home" style="width: ${pctShotsHome}%;"></div>
            <div class="stat-bar-away" style="width: ${pctShotsAway}%;"></div>
          </div>
        </div>
      </div>
    `;

    // Build events timeline
    let timelineHtml = "";
    if (match.events && match.events.length > 0) {
      const eventItems = match.events.map(ev => `
        <div class="ticker-event">
          <span class="event-time">${ev.time}</span>
          <span class="event-desc">${ev.desc}</span>
        </div>
      `).join("");
      timelineHtml = `
        <div class="ticker-section">
          <div class="ticker-title">Principais Lances</div>
          <div class="ticker-events">${eventItems}</div>
        </div>
      `;
    }

    // Countdown row for scheduled matches
    let countdownHtml = "";
    if (!match.finished && !isLive) {
      countdownHtml = `
        <div class="countdown-row" id="countdown-${match.id}">
          <span>Início do jogo</span>
          <span class="countdown-timer">Carregando...</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-header">
        <span class="group-tag">Grupo ${match.group}</span>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="card-body">
        <div class="team-row">
          <div class="team-info">
            ${homeFlag}
            <span class="team-name">${match.home_team_name_en}</span>
          </div>
          ${homeScoreHtml}
        </div>
        <div class="team-row">
          <div class="team-info">
            ${awayFlag}
            <span class="team-name">${match.away_team_name_en}</span>
          </div>
          ${awayScoreHtml}
        </div>
        ${countdownHtml}
      </div>
      <div class="card-details">
        <div class="details-content">
          ${scorersHtml}
          ${statsHtml}
          ${timelineHtml}
        </div>
      </div>
    `;

    // Click handler to toggle card expansion
    card.addEventListener("click", () => {
      if (expandedCardIds.has(match.id)) {
        expandedCardIds.delete(match.id);
        card.classList.remove("is-expanded");
      } else {
        expandedCardIds.add(match.id);
        card.classList.add("is-expanded");
      }
    });

    listEl.appendChild(card);
  });

  // Display general global Live badge if any match is live
  const globalBadge = document.getElementById("global-live-badge");
  globalBadge.style.display = anyLive ? "inline-block" : "none";

  // Force tick once immediately to display countdown timers
  if (!isSimulationMode) {
    updateCountdowns();
  }
}

/**
 * Update countdown clocks for scheduled games
 */
function updateCountdowns() {
  matches.forEach(match => {
    const isLive = match.time_elapsed !== "notstarted" && match.time_elapsed !== "finished" && !match.finished;
    if (match.finished || isLive) return;

    const countdownEl = document.querySelector(`#countdown-${match.id} .countdown-timer`);
    if (!countdownEl) return;

    const now = new Date();
    const kickoff = new Date(match.kickoff_utc);
    const diffMs = kickoff - now;

    if (diffMs <= 0) {
      countdownEl.innerText = "Autorização iminente";
      // Trigger a data reload to verify if the match has started on server
      setTimeout(loadMatchData, 2000);
    } else {
      const diffHours = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      
      let timeText = "";
      if (diffHours > 0) {
        timeText = `em ${diffHours}h ${diffMins}m`;
      } else {
        timeText = `em ${diffMins}m ${diffSecs}s`;
      }
      countdownEl.innerText = timeText;
    }
  });
}

/**
 * Start Live Game Simulation Mode
 */
let simulationIntervalId = null;

function startSimulation() {
  // Override matches with simulation mock match
  console.log("Starting match simulation mode");
  
  // Set current simulation states
  simulationState = {
    activeGameId: "3", // Canada vs Bosnia & Herzegovina
    timeElapsed: 70, // starts at 70'
    homeScore: 1,
    awayScore: 1,
    homeScorers: ["L. Millar 34'"],
    awayScorers: ["E. Džeko 42'"],
    possession: 52,
    shotsHome: 9,
    shotsAway: 7,
    foulsHome: 6,
    foulsAway: 8,
    events: [
      { time: "42'", desc: "Gol! Edin Džeko empata para a Bósnia com assistência de Krunić!" },
      { time: "34'", desc: "Gol! Liam Millar abre o placar para o Canadá após cruzamento de Davies!" },
      { time: "12'", desc: "Cartão Amarelo: Amar Dedić (Bósnia) por falta dura." }
    ]
  };

  runSimulationStep();
  
  // Run simulation clock: tick game minute every 5 seconds (quick updates)
  simulationIntervalId = setInterval(() => {
    simulationState.timeElapsed += 1;
    
    // Simulate events occurring in the match
    let newEvent = null;
    
    if (simulationState.timeElapsed === 74) {
      simulationState.shotsHome += 1;
      newEvent = { time: "74'", desc: "Defesaça! Džeko cabeceia forte e St. Clair espalma para escanteio." };
    } else if (simulationState.timeElapsed === 78) {
      simulationState.homeScore += 1;
      simulationState.homeScorers.push("J. David 78'");
      simulationState.shotsHome += 1;
      newEvent = { time: "78'", desc: "Gol! Jonathan David finaliza de primeira no canto após passe de Eustáquio! Canadá na frente!" };
    } else if (simulationState.timeElapsed === 82) {
      simulationState.foulsAway += 1;
      newEvent = { time: "82'", desc: "Cartão Vermelho! Amar Dedić (Bósnia) recebe o segundo amarelo e é expulso!" };
    } else if (simulationState.timeElapsed === 86) {
      simulationState.possession = 57; // Canada controls ball with numerical advantage
      simulationState.shotsHome += 2;
      newEvent = { time: "86'", desc: "Pressão Canadense! Tajon Buchanan carimba o travessão em chute de fora da área!" };
    } else if (simulationState.timeElapsed === 90) {
      newEvent = { time: "90'", desc: "+4 minutos de acréscimo." };
    } else if (simulationState.timeElapsed >= 94) {
      simulationState.timeElapsed = 94; // Cap game time
      newEvent = { time: "FT", desc: "Apito Final! Fim de jogo em Toronto. Canadá 2, Bósnia & Herzegovina 1." };
      clearInterval(simulationIntervalId);
    }
    
    // Adjust possession slightly
    if (simulationState.timeElapsed < 94) {
      simulationState.possession += Math.floor(Math.random() * 3) - 1;
      simulationState.possession = Math.max(40, Math.min(60, simulationState.possession));
    }

    if (newEvent) {
      simulationState.events.unshift(newEvent);
    }

    runSimulationStep();
  }, 5000);
}

/**
 * Execute simulation step and update match arrays
 */
function runSimulationStep() {
  matches = LOCAL_SCHEDULE.map(sched => {
    if (sched.id === simulationState.activeGameId) {
      const isFinished = simulationState.timeElapsed === 94;
      return {
        ...sched,
        home_score: simulationState.homeScore,
        away_score: simulationState.awayScore,
        home_scorers: [...simulationState.homeScorers],
        away_scorers: [...simulationState.awayScorers],
        finished: isFinished,
        time_elapsed: isFinished ? "finished" : `${simulationState.timeElapsed}'`,
        possession: simulationState.possession,
        shotsHome: simulationState.shotsHome,
        shotsAway: simulationState.shotsAway,
        foulsHome: simulationState.foulsHome,
        foulsAway: simulationState.foulsAway,
        events: [...simulationState.events]
      };
    }
    return {
      ...sched,
      // Keep other games fixed
      possession: 50,
      shotsHome: sched.id === "2" ? 11 : 0,
      shotsAway: sched.id === "2" ? 8 : 0,
      foulsHome: sched.id === "2" ? 9 : 0,
      foulsAway: sched.id === "2" ? 10 : 0,
      events: sched.id === "2" ? [
        { time: "80'", desc: "Gol! Oh Hyeon-gyu coloca a Coreia na frente!" },
        { time: "67'", desc: "Gol! Hwang In-beom empata a partida!" },
        { time: "59'", desc: "Gol! Ladislav Krejčí abre o placar para a Czechia!" }
      ] : []
    };
  });

  renderMatches();
}

/**
 * Stop live simulation and revert to real date/API updates
 */
function stopSimulation() {
  console.log("Stopping match simulation mode");
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId);
    simulationIntervalId = null;
  }
  loadMatchData();
}
