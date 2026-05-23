'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ── AIRPORT DATABASE ──────────────────────────────────────────────────────────
const AIRPORTS = {
  // Portugal
  OPO: { city: 'Porto',             country: 'Portugal',          flag: '🇵🇹' },
  LIS: { city: 'Lisboa',            country: 'Portugal',          flag: '🇵🇹' },
  FAO: { city: 'Faro',              country: 'Portugal',          flag: '🇵🇹' },
  FNC: { city: 'Funchal (Madeira)', country: 'Portugal',          flag: '🇵🇹' },
  PDL: { city: 'Ponta Delgada',     country: 'Portugal (Açores)', flag: '🇵🇹' },
  HOR: { city: 'Horta',             country: 'Portugal (Açores)', flag: '🇵🇹' },
  TER: { city: 'Terceira',          country: 'Portugal (Açores)', flag: '🇵🇹' },
  // Spain
  BCN: { city: 'Barcelona',              country: 'Espanha', flag: '🇪🇸' },
  MAD: { city: 'Madrid',                 country: 'Espanha', flag: '🇪🇸' },
  AGP: { city: 'Málaga',                 country: 'Espanha', flag: '🇪🇸' },
  ALC: { city: 'Alicante',               country: 'Espanha', flag: '🇪🇸' },
  PMI: { city: 'Palma de Maiorca',       country: 'Espanha', flag: '🇪🇸' },
  IBZ: { city: 'Ibiza',                  country: 'Espanha', flag: '🇪🇸' },
  SVQ: { city: 'Sevilha',               country: 'Espanha', flag: '🇪🇸' },
  VLC: { city: 'Valência',              country: 'Espanha', flag: '🇪🇸' },
  BIO: { city: 'Bilbau',                country: 'Espanha', flag: '🇪🇸' },
  SCQ: { city: 'Santiago de Compostela', country: 'Espanha', flag: '🇪🇸' },
  TFN: { city: 'Tenerife Norte',        country: 'Espanha', flag: '🇪🇸' },
  TFS: { city: 'Tenerife Sul',          country: 'Espanha', flag: '🇪🇸' },
  LPA: { city: 'Gran Canaria',          country: 'Espanha', flag: '🇪🇸' },
  ACE: { city: 'Lanzarote',             country: 'Espanha', flag: '🇪🇸' },
  FUE: { city: 'Fuerteventura',         country: 'Espanha', flag: '🇪🇸' },
  // UK
  LHR: { city: 'Londres Heathrow', country: 'Reino Unido', flag: '🇬🇧' },
  LGW: { city: 'Londres Gatwick',  country: 'Reino Unido', flag: '🇬🇧' },
  STN: { city: 'Londres Stansted', country: 'Reino Unido', flag: '🇬🇧' },
  LTN: { city: 'Londres Luton',    country: 'Reino Unido', flag: '🇬🇧' },
  MAN: { city: 'Manchester',       country: 'Reino Unido', flag: '🇬🇧' },
  EDI: { city: 'Edimburgo',        country: 'Reino Unido', flag: '🇬🇧' },
  BHX: { city: 'Birmingham',       country: 'Reino Unido', flag: '🇬🇧' },
  GLA: { city: 'Glasgow',          country: 'Reino Unido', flag: '🇬🇧' },
  BRS: { city: 'Bristol',          country: 'Reino Unido', flag: '🇬🇧' },
  // France
  CDG: { city: 'Paris Charles de Gaulle', country: 'França', flag: '🇫🇷' },
  ORY: { city: 'Paris Orly',             country: 'França', flag: '🇫🇷' },
  NCE: { city: 'Nice',                   country: 'França', flag: '🇫🇷' },
  MRS: { city: 'Marselha',              country: 'França', flag: '🇫🇷' },
  LYS: { city: 'Lyon',                   country: 'França', flag: '🇫🇷' },
  BOD: { city: 'Bordéus',               country: 'França', flag: '🇫🇷' },
  TLS: { city: 'Toulouse',               country: 'França', flag: '🇫🇷' },
  NTE: { city: 'Nantes',                 country: 'França', flag: '🇫🇷' },
  // Italy
  FCO: { city: 'Roma Fiumicino', country: 'Itália', flag: '🇮🇹' },
  CIA: { city: 'Roma Ciampino',  country: 'Itália', flag: '🇮🇹' },
  MXP: { city: 'Milão Malpensa', country: 'Itália', flag: '🇮🇹' },
  BGY: { city: 'Bérgamo',        country: 'Itália', flag: '🇮🇹' },
  VCE: { city: 'Veneza',         country: 'Itália', flag: '🇮🇹' },
  NAP: { city: 'Nápoles',        country: 'Itália', flag: '🇮🇹' },
  PSA: { city: 'Pisa',           country: 'Itália', flag: '🇮🇹' },
  FLR: { city: 'Florença',       country: 'Itália', flag: '🇮🇹' },
  BRI: { city: 'Bari',           country: 'Itália', flag: '🇮🇹' },
  PMO: { city: 'Palermo',        country: 'Itália', flag: '🇮🇹' },
  CTA: { city: 'Catânia',        country: 'Itália', flag: '🇮🇹' },
  // Germany
  FRA: { city: 'Frankfurt',   country: 'Alemanha', flag: '🇩🇪' },
  MUC: { city: 'Munique',     country: 'Alemanha', flag: '🇩🇪' },
  BER: { city: 'Berlim',      country: 'Alemanha', flag: '🇩🇪' },
  HAM: { city: 'Hamburgo',    country: 'Alemanha', flag: '🇩🇪' },
  DUS: { city: 'Düsseldorf',  country: 'Alemanha', flag: '🇩🇪' },
  CGN: { city: 'Colónia',     country: 'Alemanha', flag: '🇩🇪' },
  STR: { city: 'Estugarda',   country: 'Alemanha', flag: '🇩🇪' },
  NUE: { city: 'Nuremberga',  country: 'Alemanha', flag: '🇩🇪' },
  // Netherlands
  AMS: { city: 'Amsterdão',  country: 'Holanda', flag: '🇳🇱' },
  EIN: { city: 'Eindhoven',  country: 'Holanda', flag: '🇳🇱' },
  RTM: { city: 'Roterdão',   country: 'Holanda', flag: '🇳🇱' },
  // Belgium
  BRU: { city: 'Bruxelas',         country: 'Bélgica', flag: '🇧🇪' },
  CRL: { city: 'Bruxelas Charleroi', country: 'Bélgica', flag: '🇧🇪' },
  // Switzerland
  ZRH: { city: 'Zurique', country: 'Suíça', flag: '🇨🇭' },
  GVA: { city: 'Genebra', country: 'Suíça', flag: '🇨🇭' },
  BSL: { city: 'Basileia', country: 'Suíça', flag: '🇨🇭' },
  // Austria
  VIE: { city: 'Viena',      country: 'Áustria', flag: '🇦🇹' },
  SZG: { city: 'Salzburgo',  country: 'Áustria', flag: '🇦🇹' },
  INN: { city: 'Innsbruck',  country: 'Áustria', flag: '🇦🇹' },
  // Greece
  ATH: { city: 'Atenas',             country: 'Grécia', flag: '🇬🇷' },
  SKG: { city: 'Tessalónica',        country: 'Grécia', flag: '🇬🇷' },
  HER: { city: 'Heraklion (Creta)',   country: 'Grécia', flag: '🇬🇷' },
  RHO: { city: 'Rodes',              country: 'Grécia', flag: '🇬🇷' },
  CFU: { city: 'Corfu',              country: 'Grécia', flag: '🇬🇷' },
  ZTH: { city: 'Zakynthos',          country: 'Grécia', flag: '🇬🇷' },
  KGS: { city: 'Kos',                country: 'Grécia', flag: '🇬🇷' },
  JMK: { city: 'Mykonos',            country: 'Grécia', flag: '🇬🇷' },
  JTR: { city: 'Santorini',          country: 'Grécia', flag: '🇬🇷' },
  // Czech Republic
  PRG: { city: 'Praga', country: 'República Checa', flag: '🇨🇿' },
  // Hungary
  BUD: { city: 'Budapeste', country: 'Hungria', flag: '🇭🇺' },
  // Poland
  WAW: { city: 'Varsóvia', country: 'Polónia', flag: '🇵🇱' },
  KRK: { city: 'Cracóvia', country: 'Polónia', flag: '🇵🇱' },
  GDN: { city: 'Gdansk',   country: 'Polónia', flag: '🇵🇱' },
  // Croatia
  DBV: { city: 'Dubrovnik', country: 'Croácia', flag: '🇭🇷' },
  SPU: { city: 'Split',     country: 'Croácia', flag: '🇭🇷' },
  ZAG: { city: 'Zagreb',    country: 'Croácia', flag: '🇭🇷' },
  // Turkey
  IST: { city: 'Istambul',        country: 'Turquia', flag: '🇹🇷' },
  SAW: { city: 'Istambul Sabiha', country: 'Turquia', flag: '🇹🇷' },
  AYT: { city: 'Antalya',         country: 'Turquia', flag: '🇹🇷' },
  ADB: { city: 'Izmir',           country: 'Turquia', flag: '🇹🇷' },
  BJV: { city: 'Bodrum',          country: 'Turquia', flag: '🇹🇷' },
  DLM: { city: 'Dalaman',         country: 'Turquia', flag: '🇹🇷' },
  // Ireland
  DUB: { city: 'Dublin', country: 'Irlanda', flag: '🇮🇪' },
  ORK: { city: 'Cork',   country: 'Irlanda', flag: '🇮🇪' },
  // Scandinavia
  CPH: { city: 'Copenhague', country: 'Dinamarca', flag: '🇩🇰' },
  ARN: { city: 'Estocolmo',  country: 'Suécia',    flag: '🇸🇪' },
  GOT: { city: 'Gotemburgo', country: 'Suécia',    flag: '🇸🇪' },
  OSL: { city: 'Oslo',       country: 'Noruega',   flag: '🇳🇴' },
  BGO: { city: 'Bergen',     country: 'Noruega',   flag: '🇳🇴' },
  HEL: { city: 'Helsínquia', country: 'Finlândia', flag: '🇫🇮' },
  KEF: { city: 'Reiquiavique', country: 'Islândia', flag: '🇮🇸' },
  // Eastern Europe
  OTP: { city: 'Bucareste',   country: 'Roménia',         flag: '🇷🇴' },
  CLJ: { city: 'Cluj-Napoca', country: 'Roménia',         flag: '🇷🇴' },
  SOF: { city: 'Sófia',       country: 'Bulgária',        flag: '🇧🇬' },
  BOJ: { city: 'Burgas',      country: 'Bulgária',        flag: '🇧🇬' },
  VAR: { city: 'Varna',       country: 'Bulgária',        flag: '🇧🇬' },
  BEG: { city: 'Belgrado',    country: 'Sérvia',          flag: '🇷🇸' },
  BTS: { city: 'Bratislava',  country: 'Eslováquia',      flag: '🇸🇰' },
  LJU: { city: 'Liubliana',   country: 'Eslovénia',       flag: '🇸🇮' },
  TIA: { city: 'Tirana',      country: 'Albânia',         flag: '🇦🇱' },
  // Small Europe
  MLA: { city: 'Malta',       country: 'Malta',           flag: '🇲🇹' },
  LCA: { city: 'Larnaca',     country: 'Chipre',          flag: '🇨🇾' },
  PFO: { city: 'Pafos',       country: 'Chipre',          flag: '🇨🇾' },
  LUX: { city: 'Luxemburgo',  country: 'Luxemburgo',      flag: '🇱🇺' },
  // North Africa
  CMN: { city: 'Casablanca',    country: 'Marrocos', flag: '🇲🇦' },
  RAK: { city: 'Marraquexe',   country: 'Marrocos', flag: '🇲🇦' },
  TNG: { city: 'Tânger',        country: 'Marrocos', flag: '🇲🇦' },
  FEZ: { city: 'Fez',           country: 'Marrocos', flag: '🇲🇦' },
  TUN: { city: 'Tunis',         country: 'Tunísia',  flag: '🇹🇳' },
  CAI: { city: 'Cairo',         country: 'Egito',    flag: '🇪🇬' },
  HRG: { city: 'Hurghada',      country: 'Egito',    flag: '🇪🇬' },
  SSH: { city: 'Sharm el-Sheikh', country: 'Egito',  flag: '🇪🇬' },
  // Middle East / Gulf
  DXB: { city: 'Dubai',     country: 'Emirados Árabes', flag: '🇦🇪' },
  AUH: { city: 'Abu Dhabi', country: 'Emirados Árabes', flag: '🇦🇪' },
  // Sub-Saharan Africa
  LAD: { city: 'Luanda',              country: 'Angola',        flag: '🇦🇴' },
  MPM: { city: 'Maputo',              country: 'Moçambique',    flag: '🇲🇿' },
  JNB: { city: 'Joanesburgo',         country: 'África do Sul', flag: '🇿🇦' },
  CPT: { city: 'Cidade do Cabo',      country: 'África do Sul', flag: '🇿🇦' },
  NBO: { city: 'Nairobi',             country: 'Quénia',        flag: '🇰🇪' },
  LOS: { city: 'Lagos',               country: 'Nigéria',       flag: '🇳🇬' },
  // Cape Verde
  SID: { city: 'Sal',    country: 'Cabo Verde', flag: '🇨🇻' },
  BVC: { city: 'Boa Vista', country: 'Cabo Verde', flag: '🇨🇻' },
  RAI: { city: 'Praia',  country: 'Cabo Verde', flag: '🇨🇻' },
  // Americas
  JFK: { city: 'Nova Iorque JFK',    country: 'EUA',            flag: '🇺🇸' },
  EWR: { city: 'Nova Iorque Newark', country: 'EUA',            flag: '🇺🇸' },
  LAX: { city: 'Los Angeles',        country: 'EUA',            flag: '🇺🇸' },
  MIA: { city: 'Miami',              country: 'EUA',            flag: '🇺🇸' },
  ORD: { city: 'Chicago',            country: 'EUA',            flag: '🇺🇸' },
  BOS: { city: 'Boston',             country: 'EUA',            flag: '🇺🇸' },
  SFO: { city: 'São Francisco',      country: 'EUA',            flag: '🇺🇸' },
  YYZ: { city: 'Toronto',            country: 'Canadá',         flag: '🇨🇦' },
  YUL: { city: 'Montreal',           country: 'Canadá',         flag: '🇨🇦' },
  GRU: { city: 'São Paulo',          country: 'Brasil',         flag: '🇧🇷' },
  GIG: { city: 'Rio de Janeiro',     country: 'Brasil',         flag: '🇧🇷' },
  FOR: { city: 'Fortaleza',          country: 'Brasil',         flag: '🇧🇷' },
  REC: { city: 'Recife',             country: 'Brasil',         flag: '🇧🇷' },
  SSA: { city: 'Salvador',           country: 'Brasil',         flag: '🇧🇷' },
  NAT: { city: 'Natal',              country: 'Brasil',         flag: '🇧🇷' },
  BSB: { city: 'Brasília',           country: 'Brasil',         flag: '🇧🇷' },
  MEX: { city: 'Cidade do México',   country: 'México',         flag: '🇲🇽' },
  CUN: { city: 'Cancún',             country: 'México',         flag: '🇲🇽' },
  PUJ: { city: 'Punta Cana',         country: 'Rep. Dominicana', flag: '🇩🇴' },
  HAV: { city: 'Havana',             country: 'Cuba',            flag: '🇨🇺' },
  EZE: { city: 'Buenos Aires',       country: 'Argentina',       flag: '🇦🇷' },
  // Asia & Pacific
  DXB: { city: 'Dubai',     country: 'Emirados Árabes', flag: '🇦🇪' },
  BKK: { city: 'Banguecoque', country: 'Tailândia',   flag: '🇹🇭' },
  HKT: { city: 'Phuket',      country: 'Tailândia',   flag: '🇹🇭' },
  NRT: { city: 'Tóquio Narita', country: 'Japão',     flag: '🇯🇵' },
  HND: { city: 'Tóquio Haneda', country: 'Japão',     flag: '🇯🇵' },
  KIX: { city: 'Osaka',         country: 'Japão',     flag: '🇯🇵' },
  SIN: { city: 'Singapura',     country: 'Singapura', flag: '🇸🇬' },
  DPS: { city: 'Bali',          country: 'Indonésia', flag: '🇮🇩' },
  DEL: { city: 'Nova Deli',     country: 'Índia',     flag: '🇮🇳' },
  BOM: { city: 'Mumbai',        country: 'Índia',     flag: '🇮🇳' },
  MLE: { city: 'Malé',          country: 'Maldivas',  flag: '🇲🇻' },
};

// ── AIRPORT INPUT with autocomplete ──────────────────────────────────────────
function AirportInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [open,  setOpen]  = useState(false);

  // Sync local query with parent value (e.g. when modal resets or prefills)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const upper   = query.toUpperCase().trim();
  const matches = upper.length >= 1
    ? Object.entries(AIRPORTS).filter(([code, info]) =>
        code.startsWith(upper) ||
        info.city.toUpperCase().includes(upper) ||
        info.country.toUpperCase().includes(upper)
      ).slice(0, 8)
    : [];

  function select(code) {
    setQuery(code);
    onChange(code);
    setOpen(false);
  }

  const info = AIRPORTS[upper];

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="input"
        value={query}
        placeholder={placeholder}
        style={{ textTransform: 'uppercase' }}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value.toUpperCase().trim()); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
      />
      {info && (
        <div style={{ fontSize: '.6rem', color: '#4a4a4a', marginTop: 4, letterSpacing: '.03em' }}>
          {info.flag} {info.city}, {info.country}
        </div>
      )}
      {open && matches.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: '#111', border: '1px solid #2a2a2a', maxHeight: 240, overflowY: 'auto',
        }}>
          {matches.map(([code, inf]) => (
            <div
              key={code}
              onMouseDown={() => select(code)}
              style={{
                padding: '8px 12px', cursor: 'pointer', display: 'flex', gap: 10,
                alignItems: 'center', borderBottom: '1px solid #1a1a1a',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono), monospace', color: '#f0ece4', fontWeight: 600, minWidth: 36, fontSize: '.78rem' }}>{code}</span>
              <span style={{ fontSize: '.65rem', color: '#555' }}>{inf.flag} {inf.city}</span>
              <span style={{ fontSize: '.6rem', color: '#333', marginLeft: 'auto' }}>{inf.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── GOOGLE FLIGHTS URL ────────────────────────────────────────────────────────
function googleFlightsUrl(from, to, depDate, retDate) {
  const base = 'https://www.google.com/travel/flights';
  if (depDate && retDate) return `${base}?q=Flights+from+${from}+to+${to}+on+${depDate}+return+${retDate}`;
  if (depDate) return `${base}?q=Flights+from+${from}+to+${to}+on+${depDate}`;
  return `${base}?q=Flights+from+${from}+to+${to}`;
}

// ── ROUTE CARD ────────────────────────────────────────────────────────────────
function RouteCard({ route, onToggle, onThresholdChange, onRemove, onCheck, onEdit, style }) {
  const [photo,     setPhoto]     = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    fetch(`/api/photos/${route.to_code}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.url && setPhoto(d.url))
      .catch(() => {});
  }, [route.to_code]);

  const history = route.price_history || [];

  // Group by check_id to get the latest check's top 3
  const sorted = [...history].sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at));
  const latestCheckId = sorted[0]?.check_id;
  let top3;
  if (latestCheckId) {
    top3 = history
      .filter(h => h.check_id === latestCheckId)
      .sort((a, b) => (a.rank || a.price) - (b.rank || b.price))
      .slice(0, 3);
  } else {
    // Fallback for old records without check_id
    top3 = sorted.slice(0, 1);
  }
  const latest = top3[0] || null;

  // Stats use only rank-1 records (cheapest per check) for avg
  // If route has specific dates set, filter history to those dates only (±7 days)
  const rank1History = history.filter(h => {
    if (h.rank && h.rank !== 1) return false;
    if (route.date_from && h.departure_date) {
      const diff = Math.abs(new Date(h.departure_date) - new Date(route.date_from));
      return diff <= 7 * 86400000; // within 7 days of the target date
    }
    return true;
  });
  const avg = rank1History.length >= 2
    ? rank1History.reduce((s, h) => s + Number(h.price), 0) / rank1History.length
    : null;

  const price   = latest?.price;
  const thresh  = Number(route.threshold_eur) || 80;
  const isAlert = price && (price <= thresh || (avg && price <= avg * 0.75));
  const savePct = avg && price ? Math.round((1 - price / avg) * 100) : null;
  const pax     = Number(route.passengers) || 1;

  const fromInfo = AIRPORTS[route.from_code];
  const toInfo   = AIRPORTS[route.to_code];

  // Sparkline from rank-1 history
  function Sparkline() {
    if (rank1History.length < 2) return null;
    const pts2 = [...rank1History]
      .sort((a, b) => new Date(a.checked_at) - new Date(b.checked_at))
      .slice(-20);
    const prices = pts2.map(h => Number(h.price));
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = max - min || 1;
    const W = 120, H = 28;
    const pts = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * W;
      const y = H - ((p - min) / range) * H;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={W} height={H} style={{ display: 'block', opacity: .5 }}>
        <polyline points={pts} fill="none" stroke="#f0ece4" strokeWidth="1" strokeLinejoin="round" />
        <circle
          cx={(prices.length - 1) / (prices.length - 1) * W}
          cy={H - ((prices[prices.length - 1] - min) / range) * H}
          r="2.5" fill={isAlert ? '#5adf8a' : '#f0ece4'}
        />
      </svg>
    );
  }

  return (
    <div style={{ ...cardStyles.wrap, ...(route.notify ? {} : cardStyles.disabled), ...style }} className="grain">

      {/* Photo */}
      <div className="photo-wrap" style={{ position: 'relative' }}>
        {!imgLoaded && <div className="photo-placeholder" style={{ aspectRatio: '16/10' }} />}
        {photo && (
          <img
            ref={imgRef}
            src={photo}
            alt={route.label}
            className={imgLoaded ? 'photo-loaded' : ''}
            style={{ display: imgLoaded ? 'block' : 'none', width: '100%', aspectRatio: '16/10', objectFit: 'cover' }}
            onLoad={() => setImgLoaded(true)}
          />
        )}
        <div className="photo-vignette" />
        <div style={cardStyles.codeOverlay}>
          <span style={cardStyles.codeText}>{route.to_code}</span>
        </div>
      </div>

      {/* Card body */}
      <div style={cardStyles.body}>
        {/* Top row */}
        <div style={cardStyles.topRow}>
          <div>
            <div style={cardStyles.label}>{route.label}</div>
            <div style={cardStyles.codes}>
              <span title={fromInfo ? `${fromInfo.flag} ${fromInfo.city}, ${fromInfo.country}` : route.from_code}>
                {route.from_code}
              </span>
              {' → '}
              <span title={toInfo ? `${toInfo.flag} ${toInfo.city}, ${toInfo.country}` : route.to_code}>
                {route.to_code}
              </span>
            </div>
            {(fromInfo || toInfo) && (
              <div style={cardStyles.cityNames}>
                {fromInfo?.city || route.from_code} → {toInfo?.city || route.to_code}
              </div>
            )}
            {(route.date_from || route.date_to) && (
              <div style={cardStyles.dateBadge}>
                {route.date_from || '?'} → {route.date_to || '?'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <label className="toggle" title="Alertas">
              <input type="checkbox" checked={route.notify} onChange={e => onToggle(route.id, e.target.checked)} />
              <span className="toggle-track" />
            </label>
            <span style={cardStyles.toggleLabel}>{route.notify ? 'alertas on' : 'alertas off'}</span>
          </div>
        </div>

        {/* Price (cheapest) */}
        {price && <div style={{ fontSize: '.55rem', color: '#2a2a2a', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 2 }}>mais barato agora</div>}
        <div style={cardStyles.priceRow}>
          <span style={{ ...cardStyles.price, ...(isAlert ? cardStyles.priceAlert : {}) }}>
            {price
              ? (pax > 1 ? `EUR ${price * pax} (${pax}×)` : `EUR ${price}`)
              : <span style={{ fontSize: '1rem', color: '#2a2a2a', letterSpacing: '.04em' }}>a pesquisar...</span>}
          </span>
          {isAlert && <span style={cardStyles.badgeLow}>oferta</span>}
          {price && !isAlert && <span style={cardStyles.badgeNormal}>normal</span>}
        </div>

        {/* Top 3 flight options */}
        {top3.length === 0 && (
          <div style={{ fontSize: '.6rem', color: '#222', marginBottom: 10, letterSpacing: '.04em' }}>
            Clica verificar para ver os preços actuais.
          </div>
        )}
        {top3.length > 0 && (
          <div style={cardStyles.top3Wrap}>
            {top3.map((flight, i) => (
              <a
                key={i}
                href={googleFlightsUrl(route.from_code, route.to_code, flight.departure_date, route.date_to)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...cardStyles.flightRow,
                  ...(i < top3.length - 1 ? { borderBottom: '1px solid #141414' } : {}),
                  textDecoration: 'none', display: 'flex', cursor: 'pointer',
                }}
              >
                <span style={cardStyles.flightRank}>{i + 1}</span>
                <span style={{
                  ...cardStyles.flightPrice,
                  ...(i === 0 && isAlert ? { color: '#5adf8a' } : {}),
                  fontWeight: i === 0 ? 600 : 400,
                }}>
                  EUR {pax > 1 ? flight.price * pax : flight.price}
                </span>
                <span style={cardStyles.flightAirline}>{flight.airline}</span>
                <span style={cardStyles.flightMeta}>
                  {flight.departure_date}
                  {flight.duration_h ? ` · ${flight.duration_h}h` : ''}
                  {flight.stops != null ? ` · ${flight.stops === 0 ? 'direto' : `${flight.stops} esc.`}` : ''}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={cardStyles.statsRow}>
          {avg && (
            <span style={cardStyles.avg} title={route.date_from ? `Média para ${route.date_from}` : 'Média histórica'}>
              média{route.date_from ? ` ${route.date_from.slice(0,7)}` : ''} EUR {Math.round(avg * pax)}{pax > 1 ? ` (${pax}×)` : ''}
            </span>
          )}
          {savePct !== null && savePct > 0 && (
            <span style={{ ...cardStyles.avg, color: '#5adf8a' }}>-{savePct}%</span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <Sparkline />
          </div>
        </div>

        {/* Controls */}
        <div style={cardStyles.controls}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '.6rem', color: '#555', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              alertar &lt; EUR
            </span>
            <input
              type="number"
              defaultValue={thresh}
              onBlur={e => onThresholdChange(route.id, Number(e.target.value))}
              style={cardStyles.threshInput}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn ghost" style={{ padding: '5px 12px', fontSize: '.62rem' }} onClick={() => onCheck(route.id)}>
              verificar
            </button>
            <button className="btn ghost" style={{ padding: '5px 10px', fontSize: '.62rem' }} onClick={() => onEdit(route)}>
              editar
            </button>
            <button className="btn dark-danger" style={{ padding: '5px 10px', fontSize: '.62rem' }} onClick={() => onRemove(route.id)}>
              &times;
            </button>
          </div>
        </div>

        {latest && (
          <div style={cardStyles.lastChecked}>
            verificado: {new Date(latest.checked_at).toLocaleString('pt-PT')}
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyles = {
  wrap: {
    background: '#0f0f0f',
    border: '1px solid #1e1e1e',
    overflow: 'hidden',
    transition: 'border-color .3s',
    position: 'relative',
  },
  disabled: { opacity: .45 },
  codeOverlay: { position: 'absolute', bottom: 12, left: 16, zIndex: 3 },
  codeText: {
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: '3.5rem', fontWeight: 300,
    color: 'rgba(240,236,228,0.18)', letterSpacing: '.12em', lineHeight: 1, userSelect: 'none',
  },
  body: { padding: '18px 20px 16px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  label: { fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.35rem', fontWeight: 400, lineHeight: 1.1 },
  codes: { fontSize: '.62rem', color: '#555', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3 },
  cityNames: { fontSize: '.6rem', color: '#3a3a3a', letterSpacing: '.03em', marginTop: 2 },
  dateBadge: { fontSize: '.58rem', color: '#9b2335', letterSpacing: '.04em', marginTop: 4 },
  toggleLabel: { fontSize: '.55rem', color: '#444', letterSpacing: '.06em' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 },
  price: { fontFamily: 'var(--font-display), Georgia, serif', fontSize: '2rem', fontWeight: 600, lineHeight: 1, color: '#f0ece4' },
  priceAlert: { color: '#5adf8a' },
  badgeLow: { fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', background: '#1a4a2e', color: '#5adf8a', padding: '3px 8px' },
  badgeNormal: { fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', background: '#1a1a1a', color: '#555', padding: '3px 8px' },
  top3Wrap: { marginBottom: 10, borderTop: '1px solid #1a1a1a', paddingTop: 8 },
  flightRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' },
  flightRank: { fontSize: '.55rem', color: '#2a2a2a', minWidth: 12, textAlign: 'right' },
  flightPrice: { fontFamily: 'var(--font-display), Georgia, serif', fontSize: '.9rem', color: '#f0ece4', minWidth: 70 },
  flightAirline: { fontSize: '.62rem', color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  flightMeta: { fontSize: '.58rem', color: '#333', whiteSpace: 'nowrap' },
  statsRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingTop: 8, borderTop: '1px solid #1a1a1a' },
  avg: { fontSize: '.62rem', color: '#555', letterSpacing: '.04em' },
  controls: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  threshInput: {
    fontFamily: 'var(--font-mono), monospace', fontSize: '.78rem',
    width: 64, padding: '5px 8px',
    background: '#141414', border: '1px solid #1e1e1e', color: '#f0ece4', outline: 'none',
  },
  lastChecked: { fontSize: '.58rem', color: '#333', marginTop: 8, letterSpacing: '.04em' },
};

// ── CONFIRM MODAL ─────────────────────────────────────────────────────────────
function ConfirmModal({ open, label, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="overlay open" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #1e1e1e',
        width: 360,
        maxWidth: '92vw',
        overflow: 'hidden',
        animation: 'fadeUp .22s cubic-bezier(0.22,1,0.36,1)',
        position: 'relative',
      }}>
        {/* Red danger stripe */}
        <div style={{ height: 2, background: '#9b2335' }} />

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, border: '1px solid #2a0a10',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9b2335', fontSize: '.9rem', flexShrink: 0,
            }}>✕</div>
            <span style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '1.05rem', fontWeight: 400, letterSpacing: '.03em',
            }}>Remover rota</span>
          </div>

          {/* Route name */}
          <div style={{
            padding: '12px 14px',
            background: '#0a0a0a', border: '1px solid #1a1a1a',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: '.58rem', color: '#333', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>rota</div>
            <div style={{ fontSize: '.9rem', color: '#f0ece4', fontFamily: 'var(--font-display), Georgia, serif' }}>{label}</div>
          </div>

          {/* Warning text */}
          <p style={{ fontSize: '.62rem', color: '#333', letterSpacing: '.04em', lineHeight: 1.8, marginBottom: 24 }}>
            Todo o histórico de preços será permanentemente apagado.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn danger" style={{ flex: 1, padding: '10px 0', fontSize: '.65rem' }} onClick={onConfirm}>
              Remover
            </button>
            <button className="btn ghost" style={{ flex: 1, padding: '10px 0', fontSize: '.65rem' }} onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD ROUTE MODAL ───────────────────────────────────────────────────────────
function AddRouteModal({ open, onClose, onAdd, initial = null }) {
  const isEdit = !!initial;
  const [from,       setFrom]       = useState('');
  const [to,         setTo]         = useState('');
  const [label,      setLabel]      = useState('');
  const [thresh,     setThresh]     = useState(80);
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [passengers, setPassengers] = useState(1);
  const [err,        setErr]        = useState('');

  // Populate / reset when modal opens
  useEffect(() => {
    if (!open) return;
    setFrom(initial?.from_code || '');
    setTo(initial?.to_code || '');
    setLabel(initial?.label || '');
    setThresh(initial?.threshold_eur || 80);
    setDateFrom(initial?.date_from || '');
    setDateTo(initial?.date_to || '');
    setPassengers(initial?.passengers || 1);
    setErr('');
  }, [open]);

  // Auto-fill label from airport names
  useEffect(() => {
    const f = AIRPORTS[from.toUpperCase().trim()];
    const t = AIRPORTS[to.toUpperCase().trim()];
    if (f && t) setLabel(`${f.city} — ${t.city}`);
    else if (f && to.length === 3) setLabel(`${f.city} — ${to.toUpperCase()}`);
    else if (t && from.length === 3) setLabel(`${from.toUpperCase()} — ${t.city}`);
  }, [from, to]);

  function handleSave() {
    const f = from.toUpperCase().trim(), t = to.toUpperCase().trim();
    if (f.length !== 3 || t.length !== 3) { setErr('Códigos IATA devem ter 3 letras.'); return; }
    if (dateFrom && dateTo && dateTo < dateFrom) { setErr('A data de regresso deve ser depois da partida.'); return; }
    onAdd({
      from_code:     f,
      to_code:       t,
      label:         label || `${f} — ${t}`,
      threshold_eur: thresh,
      date_from:     dateFrom || null,
      date_to:       dateTo   || null,
      passengers:    Number(passengers) || 1,
    });
    onClose();
  }

  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{isEdit ? 'Editar rota' : 'Nova rota'}</h2>

        {/* Airports */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="label">Origem</label>
            <AirportInput value={from} onChange={setFrom} placeholder="OPO" />
          </div>
          <div>
            <label className="label">Destino</label>
            <AirportInput value={to} onChange={setTo} placeholder="BCN" />
          </div>
        </div>

        {/* Label */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Nome da rota</label>
          <input className="input" placeholder="Porto — Barcelona" value={label} onChange={e => setLabel(e.target.value)} />
        </div>

        {/* Dates (optional) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="label">Partida (opcional)</label>
            <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Regresso (opcional)</label>
            <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>

        {/* Threshold + Passengers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label className="label">Alertar abaixo de (EUR)</label>
            <input className="input" type="number" value={thresh} onChange={e => setThresh(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Passageiros</label>
            <input className="input" type="number" min={1} max={9} value={passengers} onChange={e => setPassengers(Number(e.target.value))} />
          </div>
        </div>

        {err && <p style={{ fontSize: '.72rem', color: '#9b2335', marginBottom: 16 }}>{err}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" onClick={handleSave}>{isEdit ? 'Guardar' : 'Adicionar'}</button>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
        </div>

        <div style={{ marginTop: 20, fontSize: '.6rem', color: '#2a2a2a', lineHeight: 1.9 }}>
          Escreve o código ou o nome da cidade para pesquisar. Datas opcionais — sem datas pesquisa automaticamente os próximos 90 dias.
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [routes,    setRoutes]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [checking,  setChecking]  = useState(false);
  const [status,    setStatus]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [editRoute,    setEditRoute]    = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [user,         setUser]         = useState(null);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUser(user);
      loadRoutes();
    });
  }, []);

  async function safeJson(res) {
    try { return await res.json(); } catch { return {}; }
  }

  async function loadRoutes() {
    setLoading(true);
    try {
      const res  = await fetch('/api/routes');
      const data = await safeJson(res);
      setRoutes(Array.isArray(data) ? data : []);
    } catch { setRoutes([]); }
    setLoading(false);
  }

  async function handleCheckAll() {
    setChecking(true);
    setStatus('A verificar todos os preços...');
    try {
      const res  = await fetch('/api/prices/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await safeJson(res);
      setStatus(`Concluído — ${data.alerts_sent ?? 0} alerta(s) enviado(s)`);
    } catch { setStatus('Erro ao verificar preços.'); }
    await loadRoutes();
    setChecking(false);
  }

  async function handleCheckOne(routeId) {
    setStatus('A verificar...');
    await fetch('/api/prices/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ route_id: routeId }) });
    setStatus('Preço atualizado');
    await loadRoutes();
  }

  async function handleToggle(id, notify) {
    await fetch(`/api/routes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notify }) });
    setRoutes(r => r.map(x => x.id === id ? { ...x, notify } : x));
  }

  async function handleThreshold(id, threshold_eur) {
    await fetch(`/api/routes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threshold_eur }) });
    setRoutes(r => r.map(x => x.id === id ? { ...x, threshold_eur } : x));
  }

  async function handleRemove(id) {
    setConfirmRemove(id);
  }

  async function doRemove() {
    const id = confirmRemove;
    setConfirmRemove(null);
    await fetch(`/api/routes/${id}`, { method: 'DELETE' });
    setRoutes(r => r.filter(x => x.id !== id));
  }

  async function handleAdd(data) {
    try {
      const res   = await fetch('/api/routes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const route = await safeJson(res);
      if (route.id) {
        setRoutes(r => [...r, { ...route, price_history: [] }]);
        setStatus('A pesquisar preços para a nova rota...');
        await fetch('/api/prices/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ route_id: route.id }) });
        setStatus('');
      }
    } catch { setStatus('Erro ao adicionar rota.'); }
    await loadRoutes();
  }

  async function handleEdit(id, data) {
    await fetch(`/api/routes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    await loadRoutes();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div style={dash.root}>
      <header style={dash.header}>
        <div>
          <h1 style={dash.title}>Flight <span style={{ color: '#9b2335' }}>Monitor</span></h1>
          <p style={dash.subtitle}>{routes.length} rota{routes.length !== 1 ? 's' : ''} configurada{routes.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={dash.headerRight}>
          {status && <span style={dash.status}>{status}</span>}
          <button className="btn" onClick={handleCheckAll} disabled={checking} style={{ whiteSpace: 'nowrap' }}>
            {checking ? 'A verificar...' : 'Verificar tudo'}
          </button>
          <button className="btn ghost" onClick={() => setShowAdd(true)}>+ Rota</button>
          <button className="btn ghost" onClick={handleLogout} style={{ padding: '10px 14px' }} title="Sair">&rarr;</button>
        </div>
      </header>

      {loading ? (
        <div style={dash.loadingWrap}><div style={dash.loadingText}>A carregar rotas...</div></div>
      ) : routes.length === 0 ? (
        <div style={dash.emptyWrap}>
          <p style={dash.emptyTitle}>Sem rotas configuradas.</p>
          <p style={dash.emptySub}>Adiciona a tua primeira rota para começar a monitorizar preços.</p>
          <button className="btn" style={{ marginTop: 24 }} onClick={() => setShowAdd(true)}>+ Adicionar rota</button>
        </div>
      ) : (
        <div style={dash.grid}>
          {routes.map((route, i) => (
            <RouteCard
              key={route.id}
              route={route}
              onToggle={handleToggle}
              onThresholdChange={handleThreshold}
              onRemove={handleRemove}
              onCheck={handleCheckOne}
              onEdit={r => { setEditRoute(r); setShowEdit(true); }}
              style={{ animationDelay: `${i * 80}ms`, animation: 'fadeUp .5s cubic-bezier(0.22,1,0.36,1) both' }}
            />
          ))}
          <div style={dash.addCard} onClick={() => setShowAdd(true)}>
            <span style={dash.addPlus}>+</span>
            <span style={dash.addLabel}>Adicionar rota</span>
          </div>
        </div>
      )}

      <footer style={dash.footer}>
        <span>Flight Monitor &middot; Dados via Google Flights</span>
        <span style={{ color: '#2a2a2a' }}>{user?.email}</span>
      </footer>

      <AddRouteModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      <AddRouteModal open={showEdit} onClose={() => setShowEdit(false)} onAdd={data => handleEdit(editRoute?.id, data)} initial={editRoute} />
      <ConfirmModal
        open={!!confirmRemove}
        label={routes.find(r => r.id === confirmRemove)?.label || ''}
        onConfirm={doRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}

const dash = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    padding: '36px 40px 28px', borderBottom: '1px solid #1a1a1a',
  },
  title: { fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 300, fontSize: '2.2rem', letterSpacing: '.06em', lineHeight: 1 },
  subtitle: { fontSize: '.65rem', color: '#444', letterSpacing: '.08em', marginTop: 5 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  status: { fontSize: '.65rem', color: '#555', letterSpacing: '.04em' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1px', background: '#1a1a1a', flex: 1, borderTop: '1px solid #1a1a1a',
  },
  addCard: {
    background: '#0a0a0a',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 300, cursor: 'pointer', gap: 12, color: '#2a2a2a',
    border: '2px dashed #1a1a1a', transition: 'all .2s',
  },
  addPlus: { fontSize: '2.5rem', fontWeight: 300, lineHeight: 1 },
  addLabel: { fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase' },
  loadingWrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: '.72rem', color: '#333', letterSpacing: '.1em', textTransform: 'uppercase' },
  emptyWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' },
  emptyTitle: { fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.6rem', fontWeight: 300, color: '#555' },
  emptySub:   { fontSize: '.72rem', color: '#333', marginTop: 12, maxWidth: 320, lineHeight: 1.7 },
  footer:     { display: 'flex', justifyContent: 'space-between', padding: '16px 40px', borderTop: '1px solid #1a1a1a', fontSize: '.62rem', color: '#2a2a2a', letterSpacing: '.06em' },
};
