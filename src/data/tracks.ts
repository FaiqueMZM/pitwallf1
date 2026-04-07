// Track metadata for all 24 2025 F1 circuits
// GeoJSON is fetched at runtime from bacinger/f1-circuits on GitHub
// https://github.com/bacinger/f1-circuits

export interface TrackData {
  id: string
  jolpicaId: string      // matches Ergast/Jolpica circuitId
  geojsonId: string      // filename in bacinger/f1-circuits repo (without .geojson)
  name: string
  circuit: string
  country: string
  city: string
  lapLength: number
  turns: number
  round: number
}

// Base URL for fetching GeoJSON files
export const GEOJSON_BASE = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits'

export function getGeoJsonUrl(geojsonId: string): string {
  return `${GEOJSON_BASE}/${geojsonId}.geojson`
}

export const TRACKS: TrackData[] = [
  { id: 'bahrain',       jolpicaId: 'bahrain',        geojsonId: 'bh-2004',      name: 'Bahrain Grand Prix',            circuit: 'Bahrain International Circuit',         country: 'Bahrain',      city: 'Sakhir',       lapLength: 5.412, turns: 15, round: 1  },
  { id: 'jeddah',        jolpicaId: 'jeddah',          geojsonId: 'sa-2021',      name: 'Saudi Arabian Grand Prix',       circuit: 'Jeddah Corniche Circuit',               country: 'Saudi Arabia', city: 'Jeddah',       lapLength: 6.174, turns: 27, round: 2  },
  { id: 'albert_park',   jolpicaId: 'albert_park',     geojsonId: 'au-2011',      name: 'Australian Grand Prix',          circuit: 'Albert Park Circuit',                   country: 'Australia',    city: 'Melbourne',    lapLength: 5.278, turns: 16, round: 3  },
  { id: 'suzuka',        jolpicaId: 'suzuka',          geojsonId: 'jp-1962',      name: 'Japanese Grand Prix',            circuit: 'Suzuka International Racing Course',     country: 'Japan',        city: 'Suzuka',       lapLength: 5.807, turns: 18, round: 4  },
  { id: 'shanghai',      jolpicaId: 'shanghai',        geojsonId: 'cn-2004',      name: 'Chinese Grand Prix',             circuit: 'Shanghai International Circuit',         country: 'China',        city: 'Shanghai',     lapLength: 5.451, turns: 16, round: 5  },
  { id: 'miami',         jolpicaId: 'miami',           geojsonId: 'us-2022-miami',name: 'Miami Grand Prix',               circuit: 'Miami International Autodrome',          country: 'USA',          city: 'Miami',        lapLength: 5.412, turns: 19, round: 6  },
  { id: 'imola',         jolpicaId: 'imola',           geojsonId: 'it-1988-imola',name: 'Emilia Romagna Grand Prix',      circuit: 'Autodromo Enzo e Dino Ferrari',          country: 'Italy',        city: 'Imola',        lapLength: 4.909, turns: 19, round: 7  },
  { id: 'monaco',        jolpicaId: 'monaco',          geojsonId: 'mc-1929',      name: 'Monaco Grand Prix',              circuit: 'Circuit de Monaco',                      country: 'Monaco',       city: 'Monte Carlo',  lapLength: 3.337, turns: 19, round: 8  },
  { id: 'villeneuve',    jolpicaId: 'villeneuve',      geojsonId: 'ca-1978',      name: 'Canadian Grand Prix',            circuit: 'Circuit Gilles Villeneuve',              country: 'Canada',       city: 'Montreal',     lapLength: 4.361, turns: 14, round: 9  },
  { id: 'catalunya',     jolpicaId: 'catalunya',       geojsonId: 'es-1991',      name: 'Spanish Grand Prix',             circuit: 'Circuit de Barcelona-Catalunya',         country: 'Spain',        city: 'Barcelona',    lapLength: 4.657, turns: 14, round: 10 },
  { id: 'red_bull_ring', jolpicaId: 'red_bull_ring',   geojsonId: 'at-1969',      name: 'Austrian Grand Prix',            circuit: 'Red Bull Ring',                          country: 'Austria',      city: 'Spielberg',    lapLength: 4.318, turns: 10, round: 11 },
  { id: 'silverstone',   jolpicaId: 'silverstone',     geojsonId: 'gb-1948',      name: 'British Grand Prix',             circuit: 'Silverstone Circuit',                    country: 'UK',           city: 'Silverstone',  lapLength: 5.891, turns: 18, round: 12 },
  { id: 'hungaroring',   jolpicaId: 'hungaroring',     geojsonId: 'hu-1986',      name: 'Hungarian Grand Prix',           circuit: 'Hungaroring',                            country: 'Hungary',      city: 'Budapest',     lapLength: 4.381, turns: 14, round: 13 },
  { id: 'spa',           jolpicaId: 'spa',             geojsonId: 'be-1925',      name: 'Belgian Grand Prix',             circuit: 'Circuit de Spa-Francorchamps',           country: 'Belgium',      city: 'Stavelot',     lapLength: 7.004, turns: 20, round: 14 },
  { id: 'zandvoort',     jolpicaId: 'zandvoort',       geojsonId: 'nl-1948',      name: 'Dutch Grand Prix',               circuit: 'Circuit Zandvoort',                      country: 'Netherlands',  city: 'Zandvoort',    lapLength: 4.259, turns: 14, round: 15 },
  { id: 'monza',         jolpicaId: 'monza',           geojsonId: 'it-1922',      name: 'Italian Grand Prix',             circuit: 'Autodromo Nazionale Monza',              country: 'Italy',        city: 'Monza',        lapLength: 5.793, turns: 11, round: 16 },
  { id: 'baku',          jolpicaId: 'baku',            geojsonId: 'az-2016',      name: 'Azerbaijan Grand Prix',          circuit: 'Baku City Circuit',                      country: 'Azerbaijan',   city: 'Baku',         lapLength: 6.003, turns: 20, round: 17 },
  { id: 'marina_bay',    jolpicaId: 'marina_bay',      geojsonId: 'sg-2008',      name: 'Singapore Grand Prix',           circuit: 'Marina Bay Street Circuit',              country: 'Singapore',    city: 'Singapore',    lapLength: 4.940, turns: 23, round: 18 },
  { id: 'americas',      jolpicaId: 'americas',        geojsonId: 'us-2012',      name: 'United States Grand Prix',       circuit: 'Circuit of the Americas',                country: 'USA',          city: 'Austin',       lapLength: 5.513, turns: 20, round: 19 },
  { id: 'rodriguez',     jolpicaId: 'rodriguez',       geojsonId: 'mx-1962',      name: 'Mexico City Grand Prix',         circuit: 'Autodromo Hermanos Rodriguez',           country: 'Mexico',       city: 'Mexico City',  lapLength: 4.304, turns: 17, round: 20 },
  { id: 'interlagos',    jolpicaId: 'interlagos',      geojsonId: 'br-1940',      name: 'Brazilian Grand Prix',           circuit: 'Autodromo Jose Carlos Pace',             country: 'Brazil',       city: 'São Paulo',    lapLength: 4.309, turns: 15, round: 21 },
  { id: 'las_vegas',     jolpicaId: 'las_vegas',       geojsonId: 'us-2023-vegas',name: 'Las Vegas Grand Prix',           circuit: 'Las Vegas Strip Circuit',                country: 'USA',          city: 'Las Vegas',    lapLength: 6.201, turns: 17, round: 22 },
  { id: 'losail',        jolpicaId: 'losail',          geojsonId: 'qa-2004',      name: 'Qatar Grand Prix',               circuit: 'Lusail International Circuit',           country: 'Qatar',        city: 'Lusail',       lapLength: 5.419, turns: 16, round: 23 },
  { id: 'yas_marina',    jolpicaId: 'yas_marina',      geojsonId: 'ae-2009',      name: 'Abu Dhabi Grand Prix',           circuit: 'Yas Marina Circuit',                     country: 'UAE',          city: 'Abu Dhabi',    lapLength: 5.281, turns: 16, round: 24 },
]

export const TRACK_MAP = new Map(TRACKS.map(t => [t.jolpicaId, t]))

export function findTrackByName(name: string): TrackData | undefined {
  if (!name) return undefined
  const lower = name.toLowerCase()
  return TRACKS.find(t =>
    t.circuit.toLowerCase().includes(lower) ||
    t.city.toLowerCase().includes(lower) ||
    t.country.toLowerCase().includes(lower) ||
    lower.includes(t.city.toLowerCase()) ||
    lower.includes(t.country.toLowerCase())
  )
}
