/**
 * Copa do Mundo FIFA 2026 — Widget de Resultados Ao Vivo
 * Fonte de dados: football-data.org API v4
 * Todos os horários exibidos em horário de Brasília (BRT).
 */

"use strict";

// ─── Configuração ───────────────────────────────────────────────────────────
const API_URL  = "https://api.football-data.org/v4/competitions/WC/matches";
const API_KEY  = "89a2622427a146388860dafa13768e32";
const TIMEZONE = "America/Sao_Paulo";
const REFRESH_MS = 60000;

// ─── Estado global ──────────────────────────────────────────────────────────
let matches = [];
let isLoading = false;
const expandedIds = new Set();

// ─── Códigos de país (FIFA 3 letras) ────────────────────────────────────────
const TEAM_CODES = {
  "Afghanistan":"AFG","Albania":"ALB","Algeria":"ALG","Angola":"ANG","Argentina":"ARG",
  "Armenia":"ARM","Australia":"AUS","Austria":"AUT","Azerbaijan":"AZE","Bahrain":"BHR",
  "Bangladesh":"BAN","Belgium":"BEL","Benin":"BEN","Bolivia":"BOL","Bosnia and Herzegovina":"BIH",
  "Botswana":"BOT","Brazil":"BRA","Bulgaria":"BUL","Burkina Faso":"BFA","Cameroon":"CMR",
  "Canada":"CAN","Chile":"CHI","China":"CHN","Colombia":"COL","Congo":"CGO","Costa Rica":"CRC",
  "Croatia":"CRO","Cuba":"CUB","Czechia":"CZE","Denmark":"DEN","Ecuador":"ECU","Egypt":"EGY",
  "El Salvador":"SLV","England":"ENG","Estonia":"EST","Ethiopia":"ETH","Finland":"FIN",
  "France":"FRA","Gabon":"GAB","Germany":"GER","Ghana":"GHA","Greece":"GRE","Guatemala":"GUA",
  "Guinea":"GUI","Haiti":"HAI","Honduras":"HON","Hungary":"HUN","Iceland":"ISL","India":"IND",
  "Indonesia":"IDN","Iran":"IRN","Iraq":"IRQ","Ireland":"IRL","Israel":"ISR","Italy":"ITA",
  "Ivory Coast":"CIV","Jamaica":"JAM","Japan":"JPN","Jordan":"JOR","Kazakhstan":"KAZ",
  "Kenya":"KEN","South Korea":"KOR","Kuwait":"KUW","Latvia":"LVA","Lebanon":"LIB","Libya":"LBA",
  "Lithuania":"LTU","Luxembourg":"LUX","Malaysia":"MAS","Mali":"MLI","Malta":"MLT","Mexico":"MEX",
  "Moldova":"MDA","Morocco":"MAR","Mozambique":"MOZ","Namibia":"NAM","Netherlands":"NED",
  "New Zealand":"NZL","Nicaragua":"NCA","Nigeria":"NGA","Norway":"NOR","Oman":"OMA","Pakistan":"PAK",
  "Panama":"PAN","Paraguay":"PAR","Peru":"PER","Philippines":"PHI","Poland":"POL","Portugal":"POR",
  "Qatar":"QAT","Romania":"ROU","Russia":"RUS","Saudi Arabia":"KSA","Scotland":"SCO","Senegal":"SEN",
  "Serbia":"SRB","Slovakia":"SVK","Slovenia":"SVN","South Africa":"RSA","Spain":"ESP","Sudan":"SDN",
  "Sweden":"SWE","Switzerland":"SUI","Syria":"SYR","Tanzania":"TAN","Thailand":"THA","Togo":"TOG",
  "Trinidad and Tobago":"TRI","Tunisia":"TUN","Turkey":"TUR","Uganda":"UGA","Ukraine":"UKR",
  "United Arab Emirates":"UAE","United States":"USA","Uruguay":"URU","Uzbekistan":"UZB",
  "Venezuela":"VEN","Vietnam":"VIE","Wales":"WAL","Zambia":"ZAM","Zimbabwe":"ZIM",
};

// Normaliza nomes vindos da football-data.org para os nomes usados no widget
const NAME_MAP = {
  "Korea Republic":"South Korea","Korea DPR":"North Korea","IR Iran":"Iran",
  "Côte d'Ivoire":"Ivory Coast","USA":"United States","Türkiye":"Turkey",
  "DR Congo":"Congo","Czech Republic":"Czechia",
};

// Rótulos de fase do torneio
const STAGE_LABELS = {
  "GROUP_STAGE":null,"LAST_32":"32-avos","LAST_16":"Oitavas de Final",
  "ROUND_OF_16":"Oitavas de Final","QUARTER_FINALS":"Quartas de Final",
  "SEMI_FINALS":"Semifinal","THIRD_PLACE":"3º Lugar","FINAL":"Final",
};

// ─── Bandeiras SVG ──────────────────────────────────────────────────────────
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

// ─── Helpers ────────────────────────────────────────────────────────────────

// Sigla de 3 letras do país
function teamCode(name) {
  return TEAM_CODES[name] || name.slice(0, 3).toUpperCase();
}

// Normaliza nome do time
function normalize(name) {
  return NAME_MAP[name] || name;
}

// Bandeira SVG (string vazia se não houver)
function flagSvg(name) {
  return FLAG_SVGS[name] || "";
}

// Rótulo da fase (ex: "Grupo C", "Quartas de Final")
function stageLabel(stage, group) {
  const label = STAGE_LABELS[stage];
  if (label) return label;
  if (group) return `Grupo ${group.replace("GROUP_", "")}`;
  return "Grupo";
}

// Formata um instante UTC ISO como horário de Brasília "HH:MM"
function toBRT(utcDate) {
  return new Date(utcDate).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit", timeZone: TIMEZONE,
  });
}

// Data de hoje em BRT no formato "YYYY-MM-DD"
function todayISOBrt() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return parts; // en-CA já retorna "YYYY-MM-DD"
}

// Data BRT (dd/mm/yyyy) de um instante UTC
function dateBRT(utcDate) {
  return new Date(utcDate).toLocaleDateString("pt-BR", {
    timeZone: TIMEZONE, day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Busca de dados ─────────────────────────────────────────────────────────

async function loadMatches() {
  if (isLoading) return;
  isLoading = true;

  try {
    const today = todayISOBrt();
    const url = `${API_URL}?dateFrom=${today}&dateTo=${today}`;
    const res = await fetch(url, { headers: { "X-Auth-Token": API_KEY } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const todayBR = dateBRT(new Date()); // dd/mm/yyyy de hoje em BRT

    matches = (data.matches || [])
      .map(parseMatch)
      // Garante que só aparecem jogos de hoje em BRT (a API pode trazer de UTC+1)
      .filter(m => dateBRT(m.kickoff) === todayBR)
      // Ordena por horário de início
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

    renderMatches();
    console.log(`football-data.org: ${matches.length} jogo(s) para ${today}`);
  } catch (err) {
    console.warn("Falha ao buscar dados:", err.message);
    if (matches.length === 0) renderEmpty("Não foi possível carregar os jogos.");
  } finally {
    isLoading = false;
  }
}

// Converte um match da API para o formato interno do widget
function parseMatch(m) {
  const finished = m.status === "FINISHED";
  const live     = m.status === "IN_PLAY" || m.status === "PAUSED";

  return {
    id:       String(m.id),
    home:     normalize(m.homeTeam.name || "A definir"),
    away:     normalize(m.awayTeam.name || "A definir"),
    homeScore: m.score?.fullTime?.home ?? 0,
    awayScore: m.score?.fullTime?.away ?? 0,
    finished,
    live,
    minute:   m.minute || null,
    halfTime: m.status === "PAUSED",
    kickoff:  m.utcDate,             // UTC ISO 8601 — usado direto
    stage:    m.stage,
    group:    m.group,
  };
}

// ─── Renderização ───────────────────────────────────────────────────────────

const listEl = () => document.getElementById("matches-list");

function renderEmpty(msg) {
  listEl().innerHTML = `<div class="loading-state"><p>${msg}</p></div>`;
  document.getElementById("global-live-badge").style.display = "none";
}

function renderMatches() {
  const el = listEl();

  if (matches.length === 0) {
    renderEmpty("Nenhum jogo hoje.");
    return;
  }

  el.innerHTML = "";
  let anyLive = false;

  for (const m of matches) {
    if (m.live) anyLive = true;
    el.appendChild(buildCard(m));
  }

  document.getElementById("global-live-badge").style.display = anyLive ? "inline-block" : "none";
  updateCountdowns();
}

function buildCard(m) {
  const card = document.createElement("div");
  const nationClass =
    (m.home === "Brazil" || m.away === "Brazil") ? "card-brazil" :
    (m.home === "Japan"  || m.away === "Japan")  ? "card-japan"  : "";

  card.className = [
    "match-card",
    m.live ? "is-live" : "",
    m.finished ? "is-finished" : "",
    expandedIds.has(m.id) ? "is-expanded" : "",
    nationClass,
  ].filter(Boolean).join(" ");
  card.dataset.id = m.id;

  // Badge de status (canto superior direito)
  let badgeClass, badgeText;
  if (m.finished) {
    badgeClass = "ft";
    badgeText  = `${toBRT(m.kickoff)} · Fim`;
  } else if (m.live) {
    badgeClass = "live";
    badgeText  = m.halfTime ? "Intervalo" : (m.minute ? `${m.minute}'` : "Ao Vivo");
  } else {
    badgeClass = "scheduled";
    badgeText  = toBRT(m.kickoff);
  }

  const homeAbbr = teamCode(m.home);
  const awayAbbr = teamCode(m.away);
  const homeFlag = flagSvg(m.home);
  const awayFlag = flagSvg(m.away);

  // Placar (ou "x" para jogos agendados)
  const scoreHtml = (m.finished || m.live)
    ? `<span class="compact-score">${m.homeScore} x ${m.awayScore}</span>`
    : `<span class="compact-score compact-score--scheduled">x</span>`;

  // Countdown só para jogos agendados
  const countdownHtml = (!m.finished && !m.live)
    ? `<div class="countdown-row" id="cd-${m.id}">
         <span>Início do jogo</span>
         <span class="countdown-timer">—</span>
       </div>`
    : "";

  card.innerHTML = `
    <div class="card-header">
      <span class="group-tag">${stageLabel(m.stage, m.group)}</span>
      <span class="status-badge ${badgeClass}">${badgeText}</span>
    </div>
    <div class="card-compact">
      <div class="compact-row">
        ${homeFlag}
        <span class="compact-abbr">${homeAbbr}</span>
        ${scoreHtml}
        <span class="compact-abbr">${awayAbbr}</span>
        ${awayFlag}
      </div>
      ${countdownHtml}
    </div>
  `;

  card.addEventListener("click", () => {
    if (expandedIds.has(m.id)) expandedIds.delete(m.id);
    else expandedIds.add(m.id);
    card.classList.toggle("is-expanded");
  });

  return card;
}

// ─── Contagem regressiva ────────────────────────────────────────────────────

function updateCountdowns() {
  for (const m of matches) {
    if (m.finished || m.live) continue;

    const el = document.querySelector(`#cd-${m.id} .countdown-timer`);
    if (!el) continue;

    const diff = new Date(m.kickoff) - new Date();

    if (diff <= 0) {
      el.textContent = "Começando...";
      continue;
    }

    const h = Math.floor(diff / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = h > 0 ? `em ${h}h ${min}m` : `em ${min}m ${s}s`;
  }
}

// ─── Relógio do cabeçalho ───────────────────────────────────────────────────

function initClock() {
  const clockEl = document.getElementById("live-clock");
  const dateEl  = document.getElementById("current-date");

  function tick() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: TIMEZONE,
    });
    dateEl.textContent = now.toLocaleDateString("pt-BR", {
      day: "numeric", month: "long", year: "numeric", timeZone: TIMEZONE,
    });
    updateCountdowns();
  }

  tick();
  setInterval(tick, 1000);
}

// ─── Inicialização ──────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  loadMatches();

  let lastDate = todayISOBrt();
  setInterval(() => {
    const today = todayISOBrt();
    if (today !== lastDate) {
      lastDate = today;
      location.reload(); // virou outro dia — recarrega tudo
    } else {
      loadMatches();
    }
  }, REFRESH_MS);
});
