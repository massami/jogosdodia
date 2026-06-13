/**
 * FIFA World Cup 2026 Live Matches Widget Engine
 * Handles real-time system clock, live API fetching, local schedule fallback,
 * responsive rendering and match card interactions.
 */

// Global Match State
let matches = [];
let updateIntervalId = null;
let clockIntervalId = null;

// Official FIFA 3-letter country codes
const TEAM_CODES = {
  "Afghanistan": "AFG", "Albania": "ALB", "Algeria": "ALG", "Angola": "ANG",
  "Argentina": "ARG", "Armenia": "ARM", "Australia": "AUS", "Austria": "AUT",
  "Azerbaijan": "AZE", "Bahrain": "BHR", "Bangladesh": "BAN", "Belgium": "BEL",
  "Benin": "BEN", "Bolivia": "BOL", "Bosnia and Herzegovina": "BIH",
  "Botswana": "BOT", "Brazil": "BRA", "Bulgaria": "BUL", "Burkina Faso": "BFA",
  "Cameroon": "CMR", "Canada": "CAN", "Chile": "CHI", "China": "CHN",
  "Colombia": "COL", "Congo": "CGO", "Costa Rica": "CRC", "Croatia": "CRO",
  "Cuba": "CUB", "Czechia": "CZE", "Czech Republic": "CZE", "Denmark": "DEN",
  "Ecuador": "ECU", "Egypt": "EGY", "El Salvador": "SLV", "England": "ENG",
  "Estonia": "EST", "Ethiopia": "ETH", "Finland": "FIN", "France": "FRA",
  "Gabon": "GAB", "Germany": "GER", "Ghana": "GHA", "Greece": "GRE",
  "Guatemala": "GUA", "Guinea": "GUI", "Haiti": "HAI", "Honduras": "HON",
  "Hungary": "HUN", "Iceland": "ISL", "India": "IND", "Indonesia": "IDN",
  "Iran": "IRN", "Iraq": "IRQ", "Ireland": "IRL", "Israel": "ISR",
  "Italy": "ITA", "Ivory Coast": "CIV", "Jamaica": "JAM", "Japan": "JPN",
  "Jordan": "JOR", "Kazakhstan": "KAZ", "Kenya": "KEN", "Korea Republic": "KOR",
  "South Korea": "KOR", "Kuwait": "KUW", "Latvia": "LVA", "Lebanon": "LIB",
  "Libya": "LBA", "Lithuania": "LTU", "Luxembourg": "LUX", "Malaysia": "MAS",
  "Mali": "MLI", "Malta": "MLT", "Mexico": "MEX", "Moldova": "MDA",
  "Morocco": "MAR", "Mozambique": "MOZ", "Namibia": "NAM", "Netherlands": "NED",
  "New Zealand": "NZL", "Nicaragua": "NCA", "Nigeria": "NGA", "Norway": "NOR",
  "Oman": "OMA", "Pakistan": "PAK", "Panama": "PAN", "Paraguay": "PAR",
  "Peru": "PER", "Philippines": "PHI", "Poland": "POL", "Portugal": "POR",
  "Qatar": "QAT", "Romania": "ROU", "Russia": "RUS", "Saudi Arabia": "KSA",
  "Scotland": "SCO", "Senegal": "SEN", "Serbia": "SRB", "Slovakia": "SVK",
  "Slovenia": "SVN", "South Africa": "RSA", "Spain": "ESP", "Sudan": "SDN",
  "Sweden": "SWE", "Switzerland": "SUI", "Syria": "SYR", "Tanzania": "TAN",
  "Thailand": "THA", "Togo": "TOG", "Trinidad and Tobago": "TRI",
  "Tunisia": "TUN", "Turkey": "TUR", "Uganda": "UGA", "Ukraine": "UKR",
  "United Arab Emirates": "UAE", "United States": "USA", "Uruguay": "URU",
  "Uzbekistan": "UZB", "Venezuela": "VEN", "Vietnam": "VIE", "Wales": "WAL",
  "Zambia": "ZAM", "Zimbabwe": "ZIM",
};

function getTeamCode(name) {
  return TEAM_CODES[name] || name.slice(0, 3).toUpperCase();
}

const PHASE_LABELS = {
  "group": null,
  "r32":   "Oitavas de Final",
  "r16":   "Oitavas de Final",
  "qf":    "Quartas de Final",
  "sf":    "Semifinal",
  "third": "3º Lugar",
  "final": "Final",
};

function getPhaseLabel(type, group) {
  const label = PHASE_LABELS[type];
  if (label) return label;
  return group ? `Grupo ${group}` : "Grupo";
}

// Team country code mapping for SVGs flags
const FLAG_SVGS = {
  // --- CONCACAF ---
  "United States": `<svg class="flag-icon" viewBox="0 0 19 10"><rect width="19" height="10" fill="#B22234"/><rect y="0.77" width="19" height="0.77" fill="#FFF"/><rect y="2.3" width="19" height="0.77" fill="#FFF"/><rect y="3.85" width="19" height="0.77" fill="#FFF"/><rect y="5.38" width="19" height="0.77" fill="#FFF"/><rect y="6.92" width="19" height="0.77" fill="#FFF"/><rect y="8.46" width="19" height="0.77" fill="#FFF"/><rect width="7.6" height="5.38" fill="#3C3B6E"/><circle cx="1.2" cy="0.9" r="0.15" fill="#FFF"/><circle cx="2.5" cy="0.9" r="0.15" fill="#FFF"/><circle cx="3.8" cy="0.9" r="0.15" fill="#FFF"/><circle cx="5.1" cy="0.9" r="0.15" fill="#FFF"/><circle cx="6.4" cy="0.9" r="0.15" fill="#FFF"/><circle cx="1.8" cy="1.8" r="0.15" fill="#FFF"/><circle cx="3.1" cy="1.8" r="0.15" fill="#FFF"/><circle cx="4.4" cy="1.8" r="0.15" fill="#FFF"/><circle cx="5.7" cy="1.8" r="0.15" fill="#FFF"/><circle cx="1.2" cy="2.7" r="0.15" fill="#FFF"/><circle cx="2.5" cy="2.7" r="0.15" fill="#FFF"/><circle cx="3.8" cy="2.7" r="0.15" fill="#FFF"/><circle cx="5.1" cy="2.7" r="0.15" fill="#FFF"/><circle cx="6.4" cy="2.7" r="0.15" fill="#FFF"/><circle cx="1.8" cy="3.6" r="0.15" fill="#FFF"/><circle cx="3.1" cy="3.6" r="0.15" fill="#FFF"/><circle cx="4.4" cy="3.6" r="0.15" fill="#FFF"/><circle cx="5.7" cy="3.6" r="0.15" fill="#FFF"/><circle cx="1.2" cy="4.5" r="0.15" fill="#FFF"/><circle cx="2.5" cy="4.5" r="0.15" fill="#FFF"/><circle cx="3.8" cy="4.5" r="0.15" fill="#FFF"/><circle cx="5.1" cy="4.5" r="0.15" fill="#FFF"/><circle cx="6.4" cy="4.5" r="0.15" fill="#FFF"/></svg>`,
  "Mexico": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#006847"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#C8102E"/><circle cx="1.5" cy="1" r="0.15" fill="#8B5A2B"/></svg>`,
  "Canada": `<svg class="flag-icon" viewBox="0 0 2 1"><rect width="2" height="1" fill="#FF0000"/><rect x="0.5" width="1" height="1" fill="#FFF"/><path d="M1,0.22 L1.04,0.42 L1.25,0.38 L1.15,0.52 L1.35,0.62 L1.1,0.68 L1.02,0.83 L1,0.88 L0.98,0.83 L0.9,0.68 L0.65,0.62 L0.85,0.52 L0.75,0.38 L0.96,0.42 Z" fill="#FF0000"/></svg>`,
  "Panama": `<svg class="flag-icon" viewBox="0 0 4 2"><rect width="2" height="1" fill="#FFF"/><rect x="2" width="2" height="1" fill="#D21034"/><rect y="1" width="2" height="1" fill="#005293"/><rect x="2" y="1" width="2" height="1" fill="#FFF"/><circle cx="1" cy="0.5" r="0.25" fill="#005293"/><circle cx="3" cy="1.5" r="0.25" fill="#D21034"/></svg>`,
  "Honduras": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#0073CF"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#0073CF"/><circle cx="0.9" cy="1" r="0.07" fill="#0073CF"/><circle cx="1.5" cy="1" r="0.07" fill="#0073CF"/><circle cx="2.1" cy="1" r="0.07" fill="#0073CF"/><circle cx="1.2" cy="0.75" r="0.07" fill="#0073CF"/><circle cx="1.8" cy="0.75" r="0.07" fill="#0073CF"/></svg>`,
  "Jamaica": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#000"/><polygon points="0,0 1.5,1 0,2" fill="#00A651"/><polygon points="3,0 1.5,1 3,2" fill="#00A651"/><polygon points="0,0 3,0 1.5,1" fill="#FCD116"/><polygon points="0,2 3,2 1.5,1" fill="#FCD116"/></svg>`,
  "Costa Rica": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.4" fill="#002B7F"/><rect y="0.4" width="3" height="0.27" fill="#FFF"/><rect y="0.67" width="3" height="0.67" fill="#CE1126"/><rect y="1.33" width="3" height="0.27" fill="#FFF"/><rect y="1.6" width="3" height="0.4" fill="#002B7F"/></svg>`,
  "Haiti": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#00209F"/><rect y="1" width="3" height="1" fill="#D21034"/><rect x="1.2" y="0.72" width="0.6" height="0.56" fill="#FFF"/><circle cx="1.5" cy="1" r="0.12" fill="#006233"/></svg>`,
  // --- CONMEBOL ---
  "Argentina": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#74ACDF"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#74ACDF"/><circle cx="1.5" cy="1" r="0.2" fill="#F6B40E"/><circle cx="1.5" cy="1" r="0.1" fill="#F6B40E" opacity="0.6"/></svg>`,
  "Brazil": `<svg class="flag-icon" viewBox="0 0 10 7"><rect width="10" height="7" fill="#009739"/><polygon points="5,0.7 9.3,3.5 5,6.3 0.7,3.5" fill="#FEDF00"/><circle cx="5" cy="3.5" r="1.5" fill="#002776"/><rect x="3.5" y="3.38" width="3" height="0.24" fill="#FFF" transform="rotate(-10,5,3.5)"/></svg>`,
  "Colombia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.8" fill="#FCD116"/><rect y="0.8" width="3" height="0.6" fill="#003087"/><rect y="1.4" width="3" height="0.6" fill="#CE1126"/></svg>`,
  "Uruguay": `<svg class="flag-icon" viewBox="0 0 6 4"><rect width="6" height="4" fill="#FFF"/><rect y="0.44" width="6" height="0.44" fill="#5EB6E4"/><rect y="1.33" width="6" height="0.44" fill="#5EB6E4"/><rect y="2.22" width="6" height="0.44" fill="#5EB6E4"/><rect y="3.11" width="6" height="0.44" fill="#5EB6E4"/><rect width="2.4" height="2.22" fill="#FFF"/><circle cx="1.2" cy="1.11" r="0.55" fill="#F6B40E"/></svg>`,
  "Ecuador": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.8" fill="#FFD100"/><rect y="0.8" width="3" height="0.6" fill="#003580"/><rect y="1.4" width="3" height="0.6" fill="#CC0001"/></svg>`,
  "Venezuela": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#CF142B"/><rect y="0.67" width="3" height="0.67" fill="#FFD100"/><rect y="1.33" width="3" height="0.67" fill="#003DA5"/><circle cx="1.5" cy="1" r="0.05" fill="#FFF"/><circle cx="1.35" cy="0.88" r="0.05" fill="#FFF"/><circle cx="1.65" cy="0.88" r="0.05" fill="#FFF"/><circle cx="1.2" cy="1" r="0.05" fill="#FFF"/><circle cx="1.8" cy="1" r="0.05" fill="#FFF"/><circle cx="1.35" cy="1.12" r="0.05" fill="#FFF"/><circle cx="1.65" cy="1.12" r="0.05" fill="#FFF"/></svg>`,
  "Paraguay": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#D1121A"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#0038A8"/><circle cx="1.5" cy="1" r="0.18" fill="#FFF" stroke="#0038A8" stroke-width="0.03"/><circle cx="1.5" cy="1" r="0.08" fill="#FECB00"/></svg>`,
  "Chile": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#D52B1E"/><rect y="1" width="3" height="1" fill="#FFF"/><rect width="1" height="1" fill="#003DA5"/><polygon points="0.5,0.15 0.57,0.38 0.78,0.38 0.62,0.52 0.68,0.75 0.5,0.61 0.32,0.75 0.38,0.52 0.22,0.38 0.43,0.38" fill="#FFF"/></svg>`,
  "Peru": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#D91023"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#D91023"/></svg>`,
  "Bolivia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#D00000"/><rect y="0.67" width="3" height="0.67" fill="#FFD100"/><rect y="1.33" width="3" height="0.67" fill="#007A33"/></svg>`,
  // --- UEFA ---
  "France": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>`,
  "England": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFF"/><rect x="1.3" width="0.4" height="2" fill="#CF142B"/><rect y="0.8" width="3" height="0.4" fill="#CF142B"/></svg>`,
  "Germany": `<svg class="flag-icon" viewBox="0 0 5 3"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#DD0000"/><rect y="2" width="5" height="1" fill="#FFCC00"/></svg>`,
  "Spain": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.5" fill="#AA151B"/><rect y="0.5" width="3" height="1" fill="#F1BF00"/><rect y="1.5" width="3" height="0.5" fill="#AA151B"/><rect x="0.9" y="0.55" width="0.08" height="0.9" fill="#AA151B"/></svg>`,
  "Portugal": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1.2" height="2" fill="#006600"/><rect x="1.2" width="1.8" height="2" fill="#FF0000"/><circle cx="1.2" cy="1" r="0.3" fill="#FFD700" stroke="#003399" stroke-width="0.05"/></svg>`,
  "Netherlands": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#AE1C28"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#21468B"/></svg>`,
  "Belgium": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#000"/><rect x="1" width="1" height="2" fill="#FAE042"/><rect x="2" width="1" height="2" fill="#EF3340"/></svg>`,
  "Italy": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#CE2B37"/></svg>`,
  "Switzerland": `<svg class="flag-icon" viewBox="0 0 1 1"><rect width="1" height="1" fill="#D52B1E"/><rect x="0.4" y="0.2" width="0.2" height="0.6" fill="#FFF"/><rect x="0.2" y="0.4" width="0.6" height="0.2" fill="#FFF"/></svg>`,
  "Austria": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#ED2939"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#ED2939"/></svg>`,
  "Croatia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#FF0000"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#0000FF"/><rect x="1.2" y="0.3" width="0.6" height="0.6" fill="#FFF" stroke="#FF0000" stroke-width="0.04"/><rect x="1.2" y="0.3" width="0.2" height="0.2" fill="#FF0000"/><rect x="1.4" y="0.3" width="0.2" height="0.2" fill="#FFF"/><rect x="1.6" y="0.3" width="0.2" height="0.2" fill="#FF0000"/><rect x="1.2" y="0.5" width="0.2" height="0.2" fill="#FFF"/><rect x="1.4" y="0.5" width="0.2" height="0.2" fill="#FF0000"/><rect x="1.6" y="0.5" width="0.2" height="0.2" fill="#FFF"/></svg>`,
  "Denmark": `<svg class="flag-icon" viewBox="0 0 37 28"><rect width="37" height="28" fill="#C60C30"/><rect x="12" width="4" height="28" fill="#FFF"/><rect y="12" width="37" height="4" fill="#FFF"/></svg>`,
  "Turkey": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#E30A17"/><circle cx="1.1" cy="1" r="0.45" fill="#FFF"/><circle cx="1.25" cy="1" r="0.36" fill="#E30A17"/><polygon points="1.75,0.85 1.75,1.15 1.55,1" fill="#FFF"/></svg>`,
  "Scotland": `<svg class="flag-icon" viewBox="0 0 5 3"><rect width="5" height="3" fill="#0065BF"/><line x1="0" y1="0" x2="5" y2="3" stroke="#FFF" stroke-width="0.55"/><line x1="5" y1="0" x2="0" y2="3" stroke="#FFF" stroke-width="0.55"/></svg>`,
  "Czech Republic": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#FFF"/><rect y="1" width="3" height="1" fill="#D7141A"/><polygon points="0,0 1.5,1 0,2" fill="#11457E"/></svg>`,
  "Czechia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#FFF"/><rect y="1" width="3" height="1" fill="#D7141A"/><polygon points="0,0 1.5,1 0,2" fill="#11457E"/></svg>`,
  "Serbia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#C6363C"/><rect y="0.67" width="3" height="0.67" fill="#0C4076"/><rect y="1.33" width="3" height="0.67" fill="#FFF"/></svg>`,
  "Hungary": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#CE2939"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#477050"/></svg>`,
  "Romania": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#002B7F"/><rect x="1" width="1" height="2" fill="#FCD116"/><rect x="2" width="1" height="2" fill="#CE1126"/></svg>`,
  "Slovakia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#FFF"/><rect y="0.67" width="3" height="0.67" fill="#003DA5"/><rect y="1.33" width="3" height="0.67" fill="#CE1126"/><circle cx="0.8" cy="1" r="0.3" fill="#FFF"/><rect x="0.65" y="0.72" width="0.3" height="0.15" fill="#CE1126"/><rect x="0.65" y="0.87" width="0.3" height="0.15" fill="#003DA5"/><rect x="0.65" y="1.02" width="0.3" height="0.15" fill="#CE1126"/></svg>`,
  "Ukraine": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#005BBB"/><rect y="1" width="3" height="1" fill="#FFD500"/></svg>`,
  "Bosnia and Herzegovina": `<svg class="flag-icon" viewBox="0 0 2 1"><rect width="2" height="1" fill="#002F6C"/><polygon points="0.5,0 1.5,0 1.5,1" fill="#FECB00"/><circle cx="0.55" cy="0.95" r="0.04" fill="#FFF"/><circle cx="0.65" cy="0.8" r="0.04" fill="#FFF"/><circle cx="0.75" cy="0.65" r="0.04" fill="#FFF"/><circle cx="0.85" cy="0.5" r="0.04" fill="#FFF"/><circle cx="0.95" cy="0.35" r="0.04" fill="#FFF"/><circle cx="1.05" cy="0.2" r="0.04" fill="#FFF"/><circle cx="1.15" cy="0.05" r="0.04" fill="#FFF"/></svg>`,
  "Slovenia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#FFF"/><rect y="0.67" width="3" height="0.67" fill="#003DA5"/><rect y="1.33" width="3" height="0.67" fill="#CE1126"/><circle cx="0.7" cy="0.8" r="0.25" fill="#003DA5" stroke="#FFF" stroke-width="0.05"/></svg>`,
  "Albania": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#E41E20"/><text x="1.5" y="1.25" text-anchor="middle" font-size="1" fill="#000000">🦅</text></svg>`,
  "Wales": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#FFF"/><rect y="1" width="3" height="1" fill="#00AB39"/><ellipse cx="1.5" cy="1" rx="0.5" ry="0.6" fill="#CE1126"/></svg>`,
  "Greece": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.44" fill="#0D5EAF"/><rect y="0.44" width="3" height="0.22" fill="#FFF"/><rect y="0.67" width="3" height="0.44" fill="#0D5EAF"/><rect y="1.11" width="3" height="0.22" fill="#FFF"/><rect y="1.33" width="3" height="0.44" fill="#0D5EAF"/><rect y="1.78" width="3" height="0.22" fill="#FFF"/><rect width="1.2" height="0.89" fill="#0D5EAF"/><rect x="0.48" width="0.24" height="0.89" fill="#FFF"/><rect y="0.33" width="1.2" height="0.22" fill="#FFF"/></svg>`,
  // --- AFC ---
  "South Korea": `<svg class="flag-icon" viewBox="0 0 30 20"><rect width="30" height="20" fill="#FFF"/><circle cx="15" cy="10" r="4.5" fill="#cd2e3a"/><path d="M15,10 A4.5,4.5 0,0,0 15,14.5 A2.25,2.25 0,0,0 15,12.25 A2.25,2.25 0,0,1 15,10" fill="#0047a0"/><path d="M15,10 A4.5,4.5 0,0,1 15,5.5 A2.25,2.25 0,0,1 15,7.75 A2.25,2.25 0,0,0 15,10" fill="#cd2e3a"/><path d="M7,5 L9,3 M7.7,5.5 L9.7,3.5 M8.4,6 L10.4,4" stroke="black" stroke-width="0.8"/><path d="M21,16 L23,14 M21.7,16.5 L23.7,14.5 M22.4,17 L24.4,15" stroke="black" stroke-width="0.8"/><path d="M21,4 L23,6 M22.4,3 L24.4,5 M21.7,4.5 L23.7,6.5 M7,14 L9,16 M7.7,14.5 L9.7,16.5" stroke="black" stroke-width="0.8"/></svg>`,
  "Korea Republic": `<svg class="flag-icon" viewBox="0 0 30 20"><rect width="30" height="20" fill="#FFF"/><circle cx="15" cy="10" r="4.5" fill="#cd2e3a"/><path d="M15,10 A4.5,4.5 0,0,0 15,14.5 A2.25,2.25 0,0,0 15,12.25 A2.25,2.25 0,0,1 15,10" fill="#0047a0"/><path d="M15,10 A4.5,4.5 0,0,1 15,5.5 A2.25,2.25 0,0,1 15,7.75 A2.25,2.25 0,0,0 15,10" fill="#cd2e3a"/><path d="M7,5 L9,3 M7.7,5.5 L9.7,3.5 M8.4,6 L10.4,4" stroke="black" stroke-width="0.8"/><path d="M21,16 L23,14 M21.7,16.5 L23.7,14.5 M22.4,17 L24.4,15" stroke="black" stroke-width="0.8"/><path d="M21,4 L23,6 M22.4,3 L24.4,5 M21.7,4.5 L23.7,6.5 M7,14 L9,16 M7.7,14.5 L9.7,16.5" stroke="black" stroke-width="0.8"/></svg>`,
  "Japan": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFF"/><circle cx="1.5" cy="1" r="0.6" fill="#BC002D"/></svg>`,
  "Iran": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#239F40"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#DA0000"/><circle cx="1.5" cy="1" r="0.18" fill="#DA0000" opacity="0.7"/></svg>`,
  "Australia": `<svg class="flag-icon" viewBox="0 0 4 2"><rect width="4" height="2" fill="#00008B"/><rect width="1.5" height="0.75" fill="#00008B"/><line x1="0" y1="0" x2="1.5" y2="0.75" stroke="#FFF" stroke-width="0.22"/><line x1="1.5" y1="0" x2="0" y2="0.75" stroke="#FFF" stroke-width="0.22"/><line x1="0" y1="0" x2="1.5" y2="0.75" stroke="#CC0000" stroke-width="0.12"/><line x1="1.5" y1="0" x2="0" y2="0.75" stroke="#CC0000" stroke-width="0.12"/><rect x="0.6" y="0" width="0.3" height="0.75" fill="#FFF"/><rect y="0.225" width="1.5" height="0.3" fill="#FFF"/><rect x="0.675" y="0" width="0.15" height="0.75" fill="#CC0000"/><rect y="0.3" width="1.5" height="0.15" fill="#CC0000"/><circle cx="2.7" cy="1.5" r="0.12" fill="#FFF"/><circle cx="3.5" cy="0.5" r="0.06" fill="#FFF"/><circle cx="3.1" cy="0.8" r="0.06" fill="#FFF"/><circle cx="3.6" cy="1.1" r="0.06" fill="#FFF"/><circle cx="3.2" cy="1.4" r="0.06" fill="#FFF"/><circle cx="3.5" cy="1.7" r="0.04" fill="#FFF"/></svg>`,
  "Qatar": `<svg class="flag-icon" viewBox="0 0 11 5"><rect width="11" height="5" fill="#8A1538"/><polygon points="0,0 2.5,0 3,0.28 2.5,0.56 3,0.83 2.5,1.11 3,1.39 2.5,1.67 3,1.94 2.5,2.22 3,2.5 2.5,2.78 3,3.06 2.5,3.33 3,3.61 2.5,3.89 3,4.17 2.5,4.44 3,4.72 2.5,5 0,5" fill="#FFF"/></svg>`,
  "Saudi Arabia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#006C35"/><rect y="0.85" width="3" height="0.3" fill="#FFF" opacity="0.15"/><text x="1.5" y="1.15" text-anchor="middle" font-size="0.55" fill="#FFF">لا إله إلا الله</text></svg>`,
  "Uzbekistan": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.62" fill="#1EB2A6"/><rect y="0.62" width="3" height="0.1" fill="#FFF"/><rect y="0.72" width="3" height="0.54" fill="#CE1126"/><rect y="1.26" width="3" height="0.1" fill="#FFF"/><rect y="1.36" width="3" height="0.64" fill="#1EB2A6"/><circle cx="0.5" cy="0.31" r="0.2" fill="#FFF"/><circle cx="0.57" cy="0.31" r="0.15" fill="#1EB2A6"/></svg>`,
  "Jordan": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#007A3D"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#000"/><polygon points="0,0 1.2,1 0,2" fill="#CE1126"/><circle cx="0.55" cy="1" r="0.12" fill="#FFF"/></svg>`,
  "Iraq": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#CE1126"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#000"/><text x="1.5" y="1.1" text-anchor="middle" font-size="0.45" fill="#007A3D">الله أكبر</text></svg>`,
  "China PR": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#DE2910"/><circle cx="0.5" cy="0.4" r="0.22" fill="#FFDE00"/><circle cx="0.5" cy="0.4" r="0.16" fill="#DE2910"/><circle cx="1" cy="0.2" r="0.08" fill="#FFDE00"/><circle cx="1.15" cy="0.4" r="0.08" fill="#FFDE00"/><circle cx="1" cy="0.6" r="0.08" fill="#FFDE00"/><circle cx="0.85" cy="0.75" r="0.08" fill="#FFDE00"/></svg>`,
  "New Zealand": `<svg class="flag-icon" viewBox="0 0 4 2"><rect width="4" height="2" fill="#00247D"/><rect width="1.5" height="0.75" fill="#00247D"/><line x1="0" y1="0" x2="1.5" y2="0.75" stroke="#FFF" stroke-width="0.22"/><line x1="1.5" y1="0" x2="0" y2="0.75" stroke="#FFF" stroke-width="0.22"/><line x1="0" y1="0" x2="1.5" y2="0.75" stroke="#CC0000" stroke-width="0.12"/><line x1="1.5" y1="0" x2="0" y2="0.75" stroke="#CC0000" stroke-width="0.12"/><rect x="0.6" y="0" width="0.3" height="0.75" fill="#FFF"/><rect y="0.225" width="1.5" height="0.3" fill="#FFF"/><rect x="0.675" y="0" width="0.15" height="0.75" fill="#CC0000"/><rect y="0.3" width="1.5" height="0.15" fill="#CC0000"/><circle cx="2.5" cy="0.35" r="0.09" fill="#CC0000" stroke="#FFF" stroke-width="0.04"/><circle cx="3.2" cy="0.6" r="0.09" fill="#CC0000" stroke="#FFF" stroke-width="0.04"/><circle cx="2.8" cy="1.1" r="0.09" fill="#CC0000" stroke="#FFF" stroke-width="0.04"/><circle cx="3.5" cy="0.95" r="0.09" fill="#CC0000" stroke="#FFF" stroke-width="0.04"/></svg>`,
  // --- CAF ---
  "Morocco": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#C1272D"/><polygon points="1.5,0.65 1.62,1.07 1.28,0.82 1.72,0.82 1.38,1.07" fill="none" stroke="#006233" stroke-width="0.07"/></svg>`,
  "Senegal": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#00853F"/><rect x="1" width="1" height="2" fill="#FDEF42"/><rect x="2" width="1" height="2" fill="#E31B23"/><polygon points="1.5,0.6 1.56,0.88 1.72,0.72 1.58,0.93 1.8,0.93 1.61,1.05 1.68,1.3 1.5,1.17 1.32,1.3 1.39,1.05 1.2,0.93 1.42,0.93 1.28,0.72 1.44,0.88" fill="#00853F"/></svg>`,
  "Egypt": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#CE1126"/><rect y="0.67" width="3" height="0.67" fill="#FFF"/><rect y="1.33" width="3" height="0.67" fill="#000"/><circle cx="1.5" cy="1" r="0.2" fill="#C09300" opacity="0.7"/></svg>`,
  "Nigeria": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#008751"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#008751"/></svg>`,
  "Cameroon": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#007A5E"/><rect x="1" width="1" height="2" fill="#CE1126"/><rect x="2" width="1" height="2" fill="#FCD116"/><polygon points="1.5,0.62 1.56,0.82 1.73,0.82 1.6,0.93 1.65,1.13 1.5,1.02 1.35,1.13 1.4,0.93 1.27,0.82 1.44,0.82" fill="#FCD116"/></svg>`,
  "South Africa": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#E03C31"/><rect y="1" width="3" height="1" fill="#002395"/><polygon points="0,0 1.2,1 0,2" fill="#007A4D"/><polygon points="0,0 0.88,1 0,2" fill="#000"/><polygon points="0,0 1.5,1 0,2" fill="none" stroke="#FFF" stroke-width="0.18"/><rect y="0.85" width="3" height="0.3" fill="#FFF"/><rect y="0.9" width="3" height="0.2" fill="#FFB81C"/></svg>`,
  "Ivory Coast": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#F77F00"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#009A44"/></svg>`,
  "Côte d'Ivoire": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#F77F00"/><rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#009A44"/></svg>`,
  "Ghana": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#006B3F"/><rect y="0.67" width="3" height="0.67" fill="#FCD116"/><rect y="1.33" width="3" height="0.67" fill="#EF3340"/><polygon points="1.5,0.62 1.56,0.82 1.73,0.82 1.6,0.93 1.65,1.13 1.5,1.02 1.35,1.13 1.4,0.93 1.27,0.82 1.44,0.82" fill="#000"/></svg>`,
  "Algeria": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1.5" height="2" fill="#006233"/><rect x="1.5" width="1.5" height="2" fill="#FFF"/><circle cx="1.4" cy="1" r="0.35" fill="#FFF"/><circle cx="1.55" cy="1" r="0.35" fill="#D21034"/><polygon points="1.55,0.7 1.62,0.87 1.78,0.87 1.65,0.97 1.7,1.14 1.55,1.04 1.4,1.14 1.45,0.97 1.32,0.87 1.48,0.87" fill="#FFF"/></svg>`,
  "Tunisia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#E70013"/><circle cx="1.5" cy="1" r="0.5" fill="#FFF"/><circle cx="1.5" cy="1" r="0.35" fill="#E70013"/><circle cx="1.45" cy="0.93" r="0.28" fill="#FFF"/><circle cx="1.58" cy="0.93" r="0.28" fill="#E70013"/><polygon points="1.75,0.82 1.8,0.97 1.93,0.97 1.82,1.05 1.86,1.2 1.75,1.12 1.64,1.2 1.68,1.05 1.57,0.97 1.7,0.97" fill="#FFF" transform="scale(0.5) translate(1.5,1)"/></svg>`,
  "Mali": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#14B53A"/><rect x="1" width="1" height="2" fill="#FCD116"/><rect x="2" width="1" height="2" fill="#CE1126"/></svg>`,
  "Tanzania": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#1EB53A"/><rect y="1.2" width="3" height="0.8" fill="#00A3DD"/><polygon points="0,2 3,0 3,0.4 0.5,2" fill="#000" stroke="#FCD116" stroke-width="0.1"/></svg>`,
  "Kenya": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.67" fill="#006600"/><rect y="0.67" width="3" height="0.67" fill="#CE1126"/><rect y="1.33" width="3" height="0.67" fill="#000"/><rect y="0.82" width="3" height="0.37" fill="#FFF"/></svg>`,
  "Uganda": `<svg class="flag-icon" viewBox="0 0 6 4"><rect width="2" height="4" fill="#000"/><rect x="2" width="2" height="4" fill="#FCD116"/><rect x="4" width="2" height="4" fill="#DE3008"/><circle cx="3" cy="2" r="0.8" fill="#FFF"/></svg>`,
  "Zambia": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#198A00"/><rect x="2.1" y="0" width="0.3" height="2" fill="#EF7D00"/><rect x="2.4" y="0" width="0.3" height="2" fill="#000"/><rect x="2.7" y="0" width="0.3" height="2" fill="#DE2010"/><circle cx="2.4" cy="0.5" r="0.2" fill="#EF7D00"/></svg>`,
  "Congo DR": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="2" fill="#007FFF"/><line x1="0" y1="2" x2="3" y2="0" stroke="#F7D618" stroke-width="0.3"/><circle cx="0.25" cy="1.75" r="0.3" fill="#CE1126"/></svg>`,
  "Comoros": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="0.5" fill="#3A75C4"/><rect y="0.5" width="3" height="0.5" fill="#FFF"/><rect y="1" width="3" height="0.5" fill="#CE1126"/><rect y="1.5" width="3" height="0.5" fill="#3D9B35"/><polygon points="0,0 1,1 0,2" fill="#3D9B35"/></svg>`,
  "Benin": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="1" height="2" fill="#008751"/><rect x="1" width="2" height="1" fill="#FCD116"/><rect x="1" y="1" width="2" height="1" fill="#E8112D"/></svg>`,
  "Angola": `<svg class="flag-icon" viewBox="0 0 3 2"><rect width="3" height="1" fill="#CC0000"/><rect y="1" width="3" height="1" fill="#000"/><circle cx="1.5" cy="1" r="0.2" fill="#FFD100"/></svg>`,
}

// Known correct kickoff times in UTC, keyed by "HomeTeam|AwayTeam"
// Use this to override timezone computation errors from the API
const KICKOFF_UTC = {
  // Rodada 1
  "Mexico|South Africa":              "2026-06-11T19:00:00Z", // 16:00 BRT
  "South Korea|Czechia":              "2026-06-12T02:00:00Z", // 23:00 BRT Jun 11
  "Canada|Bosnia and Herzegovina":    "2026-06-12T19:00:00Z", // 16:00 BRT
  "Portugal|Algeria":                 "2026-06-12T22:00:00Z", // 19:00 BRT
  "Uruguay|Iraq":                     "2026-06-13T01:00:00Z", // 22:00 BRT Jun 12
  "United States|Paraguay":           "2026-06-13T04:00:00Z", // 01:00 BRT Jun 13
  "Qatar|Switzerland":                "2026-06-13T19:00:00Z", // 16:00 BRT
  "Spain|Iceland":                    "2026-06-13T22:00:00Z", // 19:00 BRT
  "Brazil|Morocco":                   "2026-06-13T22:00:00Z", // 19:00 BRT
  "Haiti|Scotland":                   "2026-06-14T01:00:00Z", // 22:00 BRT Jun 13
  "Australia|Turkey":                 "2026-06-14T04:00:00Z", // 01:00 BRT Jun 14
  "Germany|Saudi Arabia":             "2026-06-14T19:00:00Z", // 16:00 BRT
  "Argentina|Kenya":                  "2026-06-14T22:00:00Z", // 19:00 BRT
  "Croatia|China":                    "2026-06-15T01:00:00Z", // 22:00 BRT Jun 14
  "France|Egypt":                     "2026-06-15T04:00:00Z", // 01:00 BRT Jun 15
  "Netherlands|Senegal":              "2026-06-15T19:00:00Z", // 16:00 BRT
  "England|India":                    "2026-06-15T22:00:00Z", // 19:00 BRT
  "Colombia|Slovenia":                "2026-06-16T01:00:00Z", // 22:00 BRT Jun 15
  "Italy|Ecuador":                    "2026-06-16T04:00:00Z", // 01:00 BRT Jun 16
  "New Zealand|Congo":                "2026-06-16T19:00:00Z", // 16:00 BRT
  "Belgium|Guatemala":                "2026-06-16T22:00:00Z", // 19:00 BRT
  "Nigeria|Venezuela":                "2026-06-17T01:00:00Z", // 22:00 BRT Jun 16
  "Japan|Ivory Coast":                "2026-06-17T04:00:00Z", // 01:00 BRT Jun 17
  "Iran|Panama":                      "2026-06-17T19:00:00Z", // 16:00 BRT
  "Portugal|Czechia":                 "2026-06-17T22:00:00Z", // 19:00 BRT
  "Angola|Mexico":                    "2026-06-18T01:00:00Z", // 22:00 BRT Jun 17
  // Rodada 2
  "South Africa|South Korea":         "2026-06-18T04:00:00Z", // 01:00 BRT Jun 18
  "Bosnia and Herzegovina|Qatar":     "2026-06-18T19:00:00Z", // 16:00 BRT
  "Morocco|Haiti":                    "2026-06-18T22:00:00Z", // 19:00 BRT
  "Scotland|Brazil":                  "2026-06-19T01:00:00Z", // 22:00 BRT Jun 18
  "Paraguay|Australia":               "2026-06-19T04:00:00Z", // 01:00 BRT Jun 19
  "Turkey|United States":             "2026-06-19T19:00:00Z", // 16:00 BRT
  "Iceland|Germany":                  "2026-06-19T22:00:00Z", // 19:00 BRT
  "Saudi Arabia|Spain":               "2026-06-20T01:00:00Z", // 22:00 BRT Jun 19
  "Kenya|Croatia":                    "2026-06-20T04:00:00Z", // 01:00 BRT Jun 20
  "China|Argentina":                  "2026-06-20T19:00:00Z", // 16:00 BRT
  "Egypt|Netherlands":                "2026-06-20T22:00:00Z", // 19:00 BRT
  "Senegal|France":                   "2026-06-21T01:00:00Z", // 22:00 BRT Jun 20
  "India|Colombia":                   "2026-06-21T04:00:00Z", // 01:00 BRT Jun 21
  "Slovenia|England":                 "2026-06-21T19:00:00Z", // 16:00 BRT
  "Ecuador|New Zealand":              "2026-06-21T22:00:00Z", // 19:00 BRT
  "Congo|Italy":                      "2026-06-22T01:00:00Z", // 22:00 BRT Jun 21
  "Guatemala|Nigeria":                "2026-06-22T04:00:00Z", // 01:00 BRT Jun 22
  "Venezuela|Belgium":                "2026-06-22T19:00:00Z", // 16:00 BRT
  "Ivory Coast|Iran":                 "2026-06-22T22:00:00Z", // 19:00 BRT
  "Panama|Japan":                     "2026-06-23T01:00:00Z", // 22:00 BRT Jun 22
  "Czechia|Angola":                   "2026-06-23T04:00:00Z", // 01:00 BRT Jun 23
  "Mexico|Portugal":                  "2026-06-23T19:00:00Z", // 16:00 BRT
  // Rodada 3
  "Mexico|South Korea":               "2026-06-26T04:00:00Z", // 01:00 BRT Jun 26
  "South Africa|Czechia":             "2026-06-26T04:00:00Z", // 01:00 BRT Jun 26
  "Canada|Qatar":                     "2026-06-26T22:00:00Z", // 19:00 BRT
  "Bosnia and Herzegovina|Switzerland":"2026-06-26T22:00:00Z",// 19:00 BRT
  "Brazil|Haiti":                     "2026-06-27T02:00:00Z", // 23:00 BRT Jun 26
  "Morocco|Scotland":                 "2026-06-27T02:00:00Z", // 23:00 BRT Jun 26
  "United States|Australia":          "2026-06-27T22:00:00Z", // 19:00 BRT
  "Paraguay|Turkey":                  "2026-06-27T22:00:00Z", // 19:00 BRT
  "Spain|Germany":                    "2026-06-28T02:00:00Z", // 23:00 BRT Jun 27
  "Iceland|Saudi Arabia":             "2026-06-28T02:00:00Z", // 23:00 BRT Jun 27
  "Argentina|Croatia":                "2026-06-28T22:00:00Z", // 19:00 BRT
  "Kenya|China":                      "2026-06-28T22:00:00Z", // 19:00 BRT
  "France|Netherlands":               "2026-06-29T02:00:00Z", // 23:00 BRT Jun 28
  "Egypt|Senegal":                    "2026-06-29T02:00:00Z", // 23:00 BRT Jun 28
  "England|Colombia":                 "2026-06-29T22:00:00Z", // 19:00 BRT
  "Slovenia|India":                   "2026-06-29T22:00:00Z", // 19:00 BRT
  "Italy|New Zealand":                "2026-06-30T02:00:00Z", // 23:00 BRT Jun 29
  "Ecuador|Congo":                    "2026-06-30T02:00:00Z", // 23:00 BRT Jun 29
  "Belgium|Nigeria":                  "2026-06-30T22:00:00Z", // 19:00 BRT
  "Venezuela|Guatemala":              "2026-06-30T22:00:00Z", // 19:00 BRT
  "Japan|Iran":                       "2026-07-01T02:00:00Z", // 23:00 BRT Jun 30
  "Ivory Coast|Panama":               "2026-07-01T02:00:00Z", // 23:00 BRT Jun 30
  "Angola|Portugal":                  "2026-07-01T22:00:00Z", // 19:00 BRT
  "Mexico|Czechia":                   "2026-07-01T22:00:00Z", // 19:00 BRT
};

function resolveKickoffUtc(homeTeam, awayTeam, localDateStr, stadiumId) {
  const key = `${homeTeam}|${awayTeam}`;
  if (KICKOFF_UTC[key]) return KICKOFF_UTC[key];
  return getKickoffUtc(localDateStr, stadiumId);
}

// FIFA 2026 stadium timezone map (IANA timezone strings — handles DST automaticamente)
// EUA:
//   EDT (UTC-4): MetLife(1), Gillette(2), Lincoln Financial(3), Hard Rock(8), BMO Field(14)
//   CDT (UTC-5): NRG(9), AT&T(10), CITYPARK(11), Arrowhead(13)
//   PDT (UTC-7): Levi's(15), SoFi(16)
// Canadá:
//   PDT (UTC-7): BC Place(12)
//   EDT (UTC-4): BMO Field(14)
// México:
//   CDT (UTC-5): Azteca(4), BBVA(5), Akron(6), Universitario(7)
const STADIUM_TIMEZONES = {
  "1":  "America/New_York",     // MetLife Stadium – East Rutherford, NJ
  "2":  "America/New_York",     // Gillette Stadium – Foxborough, MA
  "3":  "America/New_York",     // Lincoln Financial – Philadelphia, PA
  "4":  "America/Mexico_City",  // Estadio Azteca – Cidade do México
  "5":  "America/Monterrey",    // Estadio BBVA – Monterrey
  "6":  "America/Mexico_City",  // Estadio Akron – Guadalajara
  "7":  "America/Monterrey",    // Estadio Universitario – Monterrey
  "8":  "America/New_York",     // Hard Rock Stadium – Miami, FL
  "9":  "America/Chicago",      // NRG Stadium – Houston, TX
  "10": "America/Chicago",      // AT&T Stadium – Arlington, TX
  "11": "America/Chicago",      // CITYPARK – St. Louis, MO
  "12": "America/Vancouver",    // BC Place – Vancouver, BC
  "13": "America/Chicago",      // Arrowhead Stadium – Kansas City, MO
  "14": "America/Toronto",      // BMO Field – Toronto, ON
  "15": "America/Los_Angeles",  // Levi's Stadium – Santa Clara, CA
  "16": "America/Los_Angeles",  // SoFi Stadium – Inglewood, CA
};

// Helper to compute UTC kickoff time from venue local time and stadium ID.
// Uses Intl.DateTimeFormat to resolve the exact UTC offset (DST-safe).
function getKickoffUtc(localDateStr, stadiumId) {
  const parts     = localDateStr.split(" ");
  const dateParts = parts[0].split("/");
  const timeParts = parts[1].split(":");

  const month   = parseInt(dateParts[0]) - 1;
  const day     = parseInt(dateParts[1]);
  const year    = parseInt(dateParts[2]);
  const hours   = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);

  const tz = STADIUM_TIMEZONES[String(stadiumId)] || "America/New_York";

  // Calcula o offset real do fuso no horário alvo via Intl (lida com DST)
  function wallClockAtUtc(ms) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    const p = {};
    fmt.formatToParts(new Date(ms)).forEach(pt => {
      if (pt.type !== 'literal') p[pt.type] = parseInt(pt.value);
    });
    return Date.UTC(p.year, p.month - 1, p.day, p.hour === 24 ? 0 : p.hour, p.minute, p.second);
  }

  // targetWall: o horário local do estádio expresso como ms UTC (ingênuo, sem offset)
  const targetWall  = Date.UTC(year, month, day, hours, minutes, 0);
  // Aproximação: offset ≈ wallClock(targetWall) − targetWall
  const approxOffset = wallClockAtUtc(targetWall) - targetWall;
  const approxUtc    = targetWall - approxOffset;
  // Refina com o offset real no UTC aproximado
  const realOffset   = wallClockAtUtc(approxUtc) - approxUtc;
  const utcMs        = targetWall - realOffset;

  return new Date(utcMs).toISOString();
}

// Central helper: formata qualquer ISO UTC como horário de Brasília (HH:MM)
function toBRT(kickoffUtc) {
  return new Date(kickoffUtc).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

// Tabela completa oficial FIFA 2026 — todos os jogos da fase de grupos (48 jogos)
// local_date = horário local do estádio; stadium_id → STADIUM_TIMEZONES → BRT
const LOCAL_SCHEDULE = [

  // ── RODADA 1 ──────────────────────────────────────────────────────────────

  // Jun 11
  { id:"1",  group:"A", type:"group", home_team_name_en:"Mexico",                  away_team_name_en:"South Africa",          home_score:2, away_score:0, home_scorers:["J. Quiñones 9'","R. Jiménez 67'"], away_scorers:[], finished:true,  time_elapsed:"finished",    local_date:"06/11/2026 15:00", stadium_id:"1"  },
  { id:"2",  group:"A", type:"group", home_team_name_en:"South Korea",             away_team_name_en:"Czechia",               home_score:2, away_score:1, home_scorers:["Hwang In-beom 67'","Oh Hyeon-gyu 80'"], away_scorers:["L. Krejčí 59'"], finished:true, time_elapsed:"finished", local_date:"06/11/2026 22:00", stadium_id:"2" },
  // Jun 12
  { id:"3",  group:"B", type:"group", home_team_name_en:"Canada",                  away_team_name_en:"Bosnia and Herzegovina",home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/12/2026 12:00", stadium_id:"12" },
  { id:"4",  group:"B", type:"group", home_team_name_en:"Portugal",                away_team_name_en:"Algeria",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/12/2026 15:00", stadium_id:"3"  },
  { id:"5",  group:"C", type:"group", home_team_name_en:"Uruguay",                 away_team_name_en:"Iraq",                  home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/12/2026 18:00", stadium_id:"4"  },
  { id:"6",  group:"D", type:"group", home_team_name_en:"United States",           away_team_name_en:"Paraguay",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/12/2026 21:00", stadium_id:"16" },
  // Jun 13
  { id:"7",  group:"B", type:"group", home_team_name_en:"Qatar",                   away_team_name_en:"Switzerland",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/13/2026 12:00", stadium_id:"15" },
  { id:"8",  group:"E", type:"group", home_team_name_en:"Spain",                   away_team_name_en:"Iceland",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/13/2026 15:00", stadium_id:"5"  },
  { id:"9",  group:"C", type:"group", home_team_name_en:"Brazil",                  away_team_name_en:"Morocco",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/13/2026 17:00", stadium_id:"11" },
  { id:"10", group:"C", type:"group", home_team_name_en:"Haiti",                   away_team_name_en:"Scotland",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/13/2026 20:00", stadium_id:"9"  },
  { id:"11", group:"D", type:"group", home_team_name_en:"Australia",               away_team_name_en:"Turkey",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/13/2026 23:00", stadium_id:"13" },
  // Jun 14
  { id:"12", group:"E", type:"group", home_team_name_en:"Germany",                 away_team_name_en:"Saudi Arabia",          home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/14/2026 12:00", stadium_id:"6"  },
  { id:"13", group:"F", type:"group", home_team_name_en:"Argentina",               away_team_name_en:"Kenya",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/14/2026 15:00", stadium_id:"14" },
  { id:"14", group:"F", type:"group", home_team_name_en:"Croatia",                 away_team_name_en:"China",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/14/2026 18:00", stadium_id:"7"  },
  { id:"15", group:"G", type:"group", home_team_name_en:"France",                  away_team_name_en:"Egypt",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/14/2026 21:00", stadium_id:"8"  },
  // Jun 15
  { id:"16", group:"G", type:"group", home_team_name_en:"Netherlands",             away_team_name_en:"Senegal",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/15/2026 12:00", stadium_id:"10" },
  { id:"17", group:"H", type:"group", home_team_name_en:"England",                 away_team_name_en:"India",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/15/2026 15:00", stadium_id:"1"  },
  { id:"18", group:"H", type:"group", home_team_name_en:"Colombia",                away_team_name_en:"Slovenia",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/15/2026 18:00", stadium_id:"2"  },
  { id:"19", group:"I", type:"group", home_team_name_en:"Italy",                   away_team_name_en:"Ecuador",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/15/2026 21:00", stadium_id:"3"  },
  // Jun 16
  { id:"20", group:"I", type:"group", home_team_name_en:"New Zealand",             away_team_name_en:"Congo",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/16/2026 12:00", stadium_id:"4"  },
  { id:"21", group:"J", type:"group", home_team_name_en:"Belgium",                 away_team_name_en:"Guatemala",             home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/16/2026 15:00", stadium_id:"5"  },
  { id:"22", group:"J", type:"group", home_team_name_en:"Nigeria",                 away_team_name_en:"Venezuela",             home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/16/2026 18:00", stadium_id:"6"  },
  { id:"23", group:"K", type:"group", home_team_name_en:"Japan",                   away_team_name_en:"Ivory Coast",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/16/2026 21:00", stadium_id:"7"  },
  // Jun 17
  { id:"24", group:"K", type:"group", home_team_name_en:"Iran",                    away_team_name_en:"Panama",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/17/2026 12:00", stadium_id:"8"  },
  { id:"25", group:"L", type:"group", home_team_name_en:"Portugal",                away_team_name_en:"Czechia",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/17/2026 15:00", stadium_id:"9"  },
  { id:"26", group:"L", type:"group", home_team_name_en:"Angola",                  away_team_name_en:"Mexico",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/17/2026 18:00", stadium_id:"10" },

  // ── RODADA 2 ──────────────────────────────────────────────────────────────

  { id:"27", group:"A", type:"group", home_team_name_en:"South Africa",            away_team_name_en:"South Korea",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/17/2026 21:00", stadium_id:"11" },
  { id:"28", group:"B", type:"group", home_team_name_en:"Bosnia and Herzegovina",  away_team_name_en:"Qatar",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/18/2026 12:00", stadium_id:"12" },
  { id:"29", group:"C", type:"group", home_team_name_en:"Morocco",                 away_team_name_en:"Haiti",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/18/2026 15:00", stadium_id:"13" },
  { id:"30", group:"C", type:"group", home_team_name_en:"Scotland",                away_team_name_en:"Brazil",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/18/2026 18:00", stadium_id:"14" },
  { id:"31", group:"D", type:"group", home_team_name_en:"Paraguay",                away_team_name_en:"Australia",             home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/18/2026 21:00", stadium_id:"15" },
  { id:"32", group:"D", type:"group", home_team_name_en:"Turkey",                  away_team_name_en:"United States",         home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/19/2026 12:00", stadium_id:"16" },
  { id:"33", group:"E", type:"group", home_team_name_en:"Iceland",                 away_team_name_en:"Germany",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/19/2026 15:00", stadium_id:"1"  },
  { id:"34", group:"E", type:"group", home_team_name_en:"Saudi Arabia",            away_team_name_en:"Spain",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/19/2026 18:00", stadium_id:"2"  },
  { id:"35", group:"F", type:"group", home_team_name_en:"Kenya",                   away_team_name_en:"Croatia",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/19/2026 21:00", stadium_id:"3"  },
  { id:"36", group:"F", type:"group", home_team_name_en:"China",                   away_team_name_en:"Argentina",             home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/20/2026 12:00", stadium_id:"4"  },
  { id:"37", group:"G", type:"group", home_team_name_en:"Egypt",                   away_team_name_en:"Netherlands",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/20/2026 15:00", stadium_id:"5"  },
  { id:"38", group:"G", type:"group", home_team_name_en:"Senegal",                 away_team_name_en:"France",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/20/2026 18:00", stadium_id:"6"  },
  { id:"39", group:"H", type:"group", home_team_name_en:"India",                   away_team_name_en:"Colombia",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/20/2026 21:00", stadium_id:"7"  },
  { id:"40", group:"H", type:"group", home_team_name_en:"Slovenia",                away_team_name_en:"England",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/21/2026 12:00", stadium_id:"8"  },
  { id:"41", group:"I", type:"group", home_team_name_en:"Ecuador",                 away_team_name_en:"New Zealand",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/21/2026 15:00", stadium_id:"9"  },
  { id:"42", group:"I", type:"group", home_team_name_en:"Congo",                   away_team_name_en:"Italy",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/21/2026 18:00", stadium_id:"10" },
  { id:"43", group:"J", type:"group", home_team_name_en:"Guatemala",               away_team_name_en:"Nigeria",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/21/2026 21:00", stadium_id:"11" },
  { id:"44", group:"J", type:"group", home_team_name_en:"Venezuela",               away_team_name_en:"Belgium",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/22/2026 12:00", stadium_id:"12" },
  { id:"45", group:"K", type:"group", home_team_name_en:"Ivory Coast",             away_team_name_en:"Iran",                  home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/22/2026 15:00", stadium_id:"13" },
  { id:"46", group:"K", type:"group", home_team_name_en:"Panama",                  away_team_name_en:"Japan",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/22/2026 18:00", stadium_id:"14" },
  { id:"47", group:"L", type:"group", home_team_name_en:"Czechia",                 away_team_name_en:"Angola",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/22/2026 21:00", stadium_id:"15" },
  { id:"48", group:"L", type:"group", home_team_name_en:"Mexico",                  away_team_name_en:"Portugal",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/23/2026 12:00", stadium_id:"16" },

  // ── RODADA 3 (simultâneos por grupo) ──────────────────────────────────────

  { id:"49", group:"A", type:"group", home_team_name_en:"Mexico",                  away_team_name_en:"South Korea",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/25/2026 21:00", stadium_id:"15" },
  { id:"50", group:"A", type:"group", home_team_name_en:"South Africa",            away_team_name_en:"Czechia",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/25/2026 21:00", stadium_id:"16" },
  { id:"51", group:"B", type:"group", home_team_name_en:"Canada",                  away_team_name_en:"Qatar",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/26/2026 17:00", stadium_id:"1"  },
  { id:"52", group:"B", type:"group", home_team_name_en:"Bosnia and Herzegovina",  away_team_name_en:"Switzerland",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/26/2026 17:00", stadium_id:"2"  },
  { id:"53", group:"C", type:"group", home_team_name_en:"Brazil",                  away_team_name_en:"Haiti",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/26/2026 21:00", stadium_id:"3"  },
  { id:"54", group:"C", type:"group", home_team_name_en:"Morocco",                 away_team_name_en:"Scotland",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/26/2026 21:00", stadium_id:"4"  },
  { id:"55", group:"D", type:"group", home_team_name_en:"United States",           away_team_name_en:"Australia",             home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/27/2026 17:00", stadium_id:"5"  },
  { id:"56", group:"D", type:"group", home_team_name_en:"Paraguay",                away_team_name_en:"Turkey",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/27/2026 17:00", stadium_id:"6"  },
  { id:"57", group:"E", type:"group", home_team_name_en:"Spain",                   away_team_name_en:"Germany",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/27/2026 21:00", stadium_id:"7"  },
  { id:"58", group:"E", type:"group", home_team_name_en:"Iceland",                 away_team_name_en:"Saudi Arabia",          home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/27/2026 21:00", stadium_id:"8"  },
  { id:"59", group:"F", type:"group", home_team_name_en:"Argentina",               away_team_name_en:"Croatia",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/28/2026 17:00", stadium_id:"9"  },
  { id:"60", group:"F", type:"group", home_team_name_en:"Kenya",                   away_team_name_en:"China",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/28/2026 17:00", stadium_id:"10" },
  { id:"61", group:"G", type:"group", home_team_name_en:"France",                  away_team_name_en:"Netherlands",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/28/2026 21:00", stadium_id:"11" },
  { id:"62", group:"G", type:"group", home_team_name_en:"Egypt",                   away_team_name_en:"Senegal",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/28/2026 21:00", stadium_id:"12" },
  { id:"63", group:"H", type:"group", home_team_name_en:"England",                 away_team_name_en:"Colombia",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/29/2026 17:00", stadium_id:"13" },
  { id:"64", group:"H", type:"group", home_team_name_en:"Slovenia",                away_team_name_en:"India",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/29/2026 17:00", stadium_id:"14" },
  { id:"65", group:"I", type:"group", home_team_name_en:"Italy",                   away_team_name_en:"New Zealand",           home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/29/2026 21:00", stadium_id:"15" },
  { id:"66", group:"I", type:"group", home_team_name_en:"Ecuador",                 away_team_name_en:"Congo",                 home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/29/2026 21:00", stadium_id:"16" },
  { id:"67", group:"J", type:"group", home_team_name_en:"Belgium",                 away_team_name_en:"Nigeria",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/30/2026 17:00", stadium_id:"1"  },
  { id:"68", group:"J", type:"group", home_team_name_en:"Venezuela",               away_team_name_en:"Guatemala",             home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/30/2026 17:00", stadium_id:"2"  },
  { id:"69", group:"K", type:"group", home_team_name_en:"Japan",                   away_team_name_en:"Iran",                  home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/30/2026 21:00", stadium_id:"3"  },
  { id:"70", group:"K", type:"group", home_team_name_en:"Ivory Coast",             away_team_name_en:"Panama",                home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"06/30/2026 21:00", stadium_id:"4"  },
  { id:"71", group:"L", type:"group", home_team_name_en:"Angola",                  away_team_name_en:"Portugal",              home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"07/01/2026 17:00", stadium_id:"5"  },
  { id:"72", group:"L", type:"group", home_team_name_en:"Mexico",                  away_team_name_en:"Czechia",               home_score:0, away_score:0, home_scorers:[], away_scorers:[], finished:false, time_elapsed:"notstarted", local_date:"07/01/2026 17:00", stadium_id:"6"  },

];

// Generate realistic mock games if API is offline and we have no pre-configured schedule for the day
function generateMockGamesForDate(todayStr, now) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  const kickoff1 = new Date(year, month, day, 16, 0, 0);
  const kickoff2 = new Date(year, month, day, 22, 0, 0);
  
  const games = [
    {
      id: "mock-1",
      group: "E",
      home_team_name_en: "Germany",
      away_team_name_en: "Japan",
      home_score: 0,
      away_score: 0,
      home_scorers: [],
      away_scorers: [],
      finished: false,
      time_elapsed: "notstarted",
      kickoff_utc: kickoff1.toISOString(),
      possession: 50,
      shotsHome: 0,
      shotsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      events: []
    },
    {
      id: "mock-2",
      group: "F",
      home_team_name_en: "Sweden",
      away_team_name_en: "Paraguay",
      home_score: 0,
      away_score: 0,
      home_scorers: [],
      away_scorers: [],
      finished: false,
      time_elapsed: "notstarted",
      kickoff_utc: kickoff2.toISOString(),
      possession: 50,
      shotsHome: 0,
      shotsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      events: []
    }
  ];

  games.forEach(g => {
    const kickoff = new Date(g.kickoff_utc);
    const diffMs = now - kickoff;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes >= 0 && diffMinutes < 105) {
      g.finished = false;
      g.time_elapsed = diffMinutes > 45 ? `${Math.min(diffMinutes - 15, 90)}'` : `${diffMinutes}'`;
      if (diffMinutes > 45 && diffMinutes <= 60) g.time_elapsed = "HT";
      g.possession = 54;
      g.shotsHome = Math.floor(diffMinutes / 10);
      g.shotsAway = Math.floor(diffMinutes / 12);
    } else if (diffMinutes >= 105) {
      g.finished = true;
      g.time_elapsed = "finished";
      g.home_score = 2;
      g.away_score = 1;
      g.home_scorers = ["Scorer A 12'", "Scorer B 76'"];
      g.away_scorers = ["Scorer C 44'"];
      g.possession = 52;
      g.shotsHome = 14;
      g.shotsAway = 9;
      g.events = [
        { time: "76'", desc: "Gol! Alemanha desempata!" },
        { time: "44'", desc: "Gol! Japão empata a partida!" },
        { time: "12'", desc: "Gol! Alemanha abre o placar!" }
      ];
    }
  });

  return games;
}

// Map of expanded card IDs to keep track across re-renders
let expandedCardIds = new Set();

/**
 * Initialize widget and event listeners
 */
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  loadMatchData();

  let lastLoadedDate = new Date().toDateString();

  // Setup periodic refresh (every 60 seconds)
  updateIntervalId = setInterval(() => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastLoadedDate) {
      lastLoadedDate = currentDate;
      location.reload();
    } else {
      loadMatchData();
    }
  }, 60000);
});

/**
 * Handle Clock and Date header
 */
function initClock() {
  const clockEl = document.getElementById("live-clock");
  const dateEl = document.getElementById("current-date");

  // Format header date
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };

  function tick() {
    const now = new Date();
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.innerText = `${hours}:${minutes}:${seconds}`;

    // Update date header dynamically
    dateEl.innerText = now.toLocaleDateString('pt-BR', dateOptions);

    updateCountdowns();
  }

  tick();
  clockIntervalId = setInterval(tick, 1000);
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
  // Get current system date in MM/DD/YYYY format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${month}/${day}/${year}`;

  // Always start with LOCAL_SCHEDULE as the base for today's games
  const localGames = LOCAL_SCHEDULE.filter(sched => sched.local_date.startsWith(todayStr));
  let loadedMatches = localGames.map(sched => {
    const kickoffUTC = resolveKickoffUtc(sched.home_team_name_en, sched.away_team_name_en, sched.local_date, sched.stadium_id);
    return {
      ...sched,
      kickoff_utc: kickoffUTC,
      possession: 50,
      shotsHome: 0,
      shotsAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      events: []
    };
  });

  try {
    const response = await fetch("https://worldcup26.ir/get/games");
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const data = await response.json();

    if (data && data.games) {
      // Log para debug — ver o que a API retorna
      console.log(`API retornou ${data.games.length} jogos total. todayStr=${todayStr}`);
      console.log('Amostra API:', data.games.slice(0,3).map(g => ({id:g.id, home:g.home_team_name_en, away:g.away_team_name_en, date:g.local_date})));

      const apiGames = data.games.filter(game => {
        return game.local_date && game.local_date.startsWith(todayStr);
      });

      console.log(`Jogos filtrados para hoje (${todayStr}):`, apiGames.length);

      // Overlay API data on top of local schedule.
      // IMPORTANTE: kickoff_utc e id vêm sempre do LOCAL_SCHEDULE (fonte de verdade).
      // A API só contribui com placar, status e eventos ao vivo.
      apiGames.forEach(game => {
        const homeName = game.home_team_name_en === "Korea Republic" ? "South Korea" : game.home_team_name_en;
        const awayName = game.away_team_name_en;

        // Busca o jogo local por id ou por nomes dos times
        const localIdx = loadedMatches.findIndex(m => m.id === game.id) !== -1
          ? loadedMatches.findIndex(m => m.id === game.id)
          : loadedMatches.findIndex(m => m.home_team_name_en === homeName && m.away_team_name_en === awayName);

        if (localIdx !== -1) {
          // Atualiza apenas placar e status — preserva id e kickoff_utc locais
          const local = loadedMatches[localIdx];
          loadedMatches[localIdx] = {
            ...local,
            home_score:   parseInt(game.home_score) || 0,
            away_score:   parseInt(game.away_score) || 0,
            home_scorers: parseScorers(game.home_scorers),
            away_scorers: parseScorers(game.away_scorers),
            finished:     game.finished === "TRUE" || game.time_elapsed === "finished",
            time_elapsed: game.time_elapsed,
            type:         game.type || local.type || "group",
          };
        }
        // Se não achou no LOCAL_SCHEDULE, ignora — não adiciona duplicatas da API
      });

      console.log(`Merged ${apiGames.length} API games with ${localGames.length} local games for ${todayStr}`);
    }
  } catch (error) {
    console.warn("Live API fetch failed. Using pre-configured schedule fallback.", error);
  }

  if (loadedMatches.length === 0) {
    loadedMatches = generateMockGamesForDate(todayStr, now);
    console.log(`Generated ${loadedMatches.length} mock demo games for ${todayStr}`);
  }

  // Deduplica por home+away — garante que nunca apareçam dois cartões do mesmo jogo
  const seen = new Set();
  loadedMatches = loadedMatches.filter(m => {
    const key = `${m.home_team_name_en}|${m.away_team_name_en}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  matches = loadedMatches;
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
    const isBrazilGame = match.home_team_name_en === "Brazil" || match.away_team_name_en === "Brazil";
    const isJapanGame = match.home_team_name_en === "Japan" || match.away_team_name_en === "Japan";
    const nationClass = isBrazilGame ? "card-brazil" : isJapanGame ? "card-japan" : "";
    card.className = `match-card ${isLive ? 'is-live' : ''} ${match.finished ? 'is-finished' : ''} ${expandedCardIds.has(match.id) ? 'is-expanded' : ''} ${nationClass}`;
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
      statusText = match.time_elapsed === "HT" ? "Intervalo" : "Ao Vivo";
      homeScoreHtml = `<span class="score">${match.home_score}</span>`;
      awayScoreHtml = `<span class="score">${match.away_score}</span>`;
    } else {
      // Scheduled — exibe horário de Brasília (BRT)
      statusClass = "scheduled";
      statusText = toBRT(match.kickoff_utc);
      
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

    if (match.finished) {
      const homeAbbr = getTeamCode(match.home_team_name_en);
      const awayAbbr = getTeamCode(match.away_team_name_en);
      const brTime = toBRT(match.kickoff_utc);
      card.innerHTML = `
        <div class="card-header">
          <span class="group-tag">${getPhaseLabel(match.type, match.group)}</span>
          <span class="status-badge ft">${brTime} · Fim</span>
        </div>
        <div class="card-compact">
          <div class="compact-row">
            ${homeFlag}
            <span class="compact-abbr">${homeAbbr}</span>
            <span class="compact-score">${match.home_score} x ${match.away_score}</span>
            <span class="compact-abbr">${awayAbbr}</span>
            ${awayFlag}
          </div>
        </div>
      `;
    } else if (!isLive) {
      const homeAbbr = getTeamCode(match.home_team_name_en);
      const awayAbbr = getTeamCode(match.away_team_name_en);
      card.innerHTML = `
        <div class="card-header">
          <span class="group-tag">${getPhaseLabel(match.type, match.group)}</span>
          <span class="status-badge scheduled">${statusText}</span>
        </div>
        <div class="card-compact">
          <div class="compact-row">
            ${homeFlag}
            <span class="compact-abbr">${homeAbbr}</span>
            <span class="compact-score compact-score--scheduled">x</span>
            <span class="compact-abbr">${awayAbbr}</span>
            ${awayFlag}
          </div>
          ${countdownHtml}
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="card-header">
          <span class="group-tag">${getPhaseLabel(match.type, match.group)}</span>
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
        </div>
        <div class="card-details">
          <div class="details-content">
            ${scorersHtml}
            ${statsHtml}
            ${timelineHtml}
          </div>
        </div>
      `;
    }

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

  updateCountdowns();
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

