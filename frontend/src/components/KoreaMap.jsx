import { useCallback, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { irsColor } from '../lib/api.js';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';

const ESRI_SATELLITE_STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        'Imagery © Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, AeroGRID, IGN, GIS Community',
    },
  },
  layers: [
    {
      id: 'esri-imagery-layer',
      type: 'raster',
      source: 'esri-imagery',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const DEFAULT_VIEW = {
  longitude: 127.8,
  latitude: 36.1,
  zoom: 6.2,
  pitch: 55,
  bearing: -18,
};

function getMapStyle() {
  if (MAPTILER_KEY) {
    return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
  }
  return ESRI_SATELLITE_STYLE;
}

export default function KoreaMap({ cities, selectedCityId, onSelectCity }) {
  const mapStyle = useMemo(getMapStyle, []);

  const handleMapLoad = useCallback((evt) => {
    const map = evt.target;
    if (!MAPTILER_KEY || map.getSource('maptiler-terrain')) return;

    map.addSource('maptiler-terrain', {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
      tileSize: 256,
    });
    map.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 });

    if (!map.getLayer('sky')) {
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 12,
        },
      });
    }
  }, []);

  const handleClick = useCallback(
    (city) => {
      onSelectCity?.(city);
    },
    [onSelectCity],
  );

  const markers = useMemo(
    () =>
      (cities || []).map((city) => {
        const color = irsColor(city.irs ?? 50);
        const selected = city.id === selectedCityId;
        const dense = (cities?.length || 0) > 30;
        const size = selected ? (dense ? 18 : 28) : dense ? 10 : 22;
        return (
          <Marker
            key={city.id}
            longitude={city.lng}
            latitude={city.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleClick(city);
            }}
          >
            <button
              type="button"
              aria-label={`${city.name} IRS ${city.irs}`}
              className={`relative flex items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${
                selected ? 'scale-125 ring-2 ring-accent ring-offset-2 ring-offset-navy' : ''
              }`}
              style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderColor: selected ? '#00d4ff' : 'rgba(255,255,255,0.85)',
                boxShadow: `0 2px 8px rgba(0,0,0,0.5), 0 0 16px ${color}aa`,
                animation: selected ? 'pulse-dot 2s ease-in-out infinite' : undefined,
              }}
              onClick={() => handleClick(city)}
            />
          </Marker>
        );
      }),
    [cities, selectedCityId, handleClick],
  );

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-white/10">
      {!MAPTILER_KEY && (
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-navy/90 px-3 py-1.5 text-xs text-slate-300">
          Esri satellite view — add <span className="text-warning">VITE_MAPTILER_KEY</span> for terrain hills
        </div>
      )}
      <Map
        initialViewState={DEFAULT_VIEW}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={true}
        antialias={true}
        maxPitch={85}
        onLoad={handleMapLoad}
        onClick={() => onSelectCity?.(null)}
      >
        <NavigationControl position="bottom-right" showCompass visualizePitch />
        {markers}
      </Map>
      <div className="pointer-events-none absolute bottom-3 left-3 flex gap-3 rounded-lg bg-navy/80 px-3 py-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" /> High IRS
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" /> Mid
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger" /> Low
        </span>
      </div>
    </div>
  );
}
