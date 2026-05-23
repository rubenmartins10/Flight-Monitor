// Queries otimizadas para cada destino — resultados mais cinematograficos
const QUERIES = {
  BCN: 'Barcelona Spain aerial gothic quarter',
  MAD: 'Madrid Spain Gran Via sunset',
  VLC: 'Valencia Spain architecture',
  SVQ: 'Seville Spain cathedral orange',
  LHR: 'London England Thames Tower Bridge',
  STN: 'London England cityscape',
  MAN: 'Manchester England architecture',
  CDG: 'Paris France Seine Eiffel Tower',
  NCE: 'Nice French Riviera azure coast',
  MRS: 'Marseille France coast',
  FCO: 'Rome Italy Colosseum golden hour',
  MXP: 'Milan Italy Duomo cathedral',
  VCE: 'Venice Italy grand canal gondola',
  NAP: 'Naples Italy coast Vesuvius',
  BER: 'Berlin Germany Brandenburg Gate',
  MUC: 'Munich Bavaria Alps',
  FRA: 'Frankfurt Germany skyline night',
  AMS: 'Amsterdam Netherlands canals',
  ATH: 'Athens Greece Acropolis sunset',
  SKG: 'Thessaloniki Greece waterfront',
  HER: 'Crete Greece blue sea cliff',
  DBV: 'Dubrovnik Croatia old town walls',
  SPU: 'Split Croatia Diocletian Palace',
  VIE: 'Vienna Austria Schonbrunn Palace',
  PRG: 'Prague Czech Republic old town bridge',
  BUD: 'Budapest Hungary Danube Parliament',
  WAW: 'Warsaw Poland old town',
  IST: 'Istanbul Turkey Bosphorus mosque',
  LIS: 'Lisbon Portugal Alfama tram hills',
  OPO: 'Porto Portugal Douro river Ribeira',
  FAO: 'Algarve Portugal golden cliffs ocean',
};

export async function fetchDestinationPhoto(code) {
  const query = QUERIES[code?.toUpperCase()] || `${code} travel destination landscape`;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
      {
        headers: { Authorization: process.env.PEXELS_KEY },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;

    const data   = await res.json();
    const photos = data.photos || [];
    if (!photos.length) return null;

    // Selecionar a foto com maior resolucao disponivel
    const best = photos.reduce((a, b) =>
      (a.width * a.height > b.width * b.height) ? a : b
    );

    return {
      url:          best.src.large2x || best.src.large,
      photographer: best.photographer,
      alt:          best.alt || query,
    };
  } catch {
    return null;
  }
}
