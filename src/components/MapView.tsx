import React, { useEffect, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Heart, MapPin, Plus, ChevronDown, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { ARDirections } from './ARDirections';

interface Card {
  id: number | string;
  photo: string;
  title: string;
  story: string;
  location: string;
  tags: string[];
  likes: number;
  timestamp: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  cards: Card[];
  savedCards?: Card[];
  onToggleLike: (cardId: number) => void;
  onAddToCollection: (cardId: number) => void;
  onCreateCard?: () => void;
  newCard?: Card | null;
  onNewCardShown?: () => void;
}

const PIN_COLORS = ['#FF8A4C', '#3A7AFE', '#6BAF73', '#8B7AF7', '#FF6B9D', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000';

const MY_LOCATION = { lat: 40.7231, lng: -74.0018 }; // Fixed in SoHo

const UPCOMING_CITIES = ['Tokyo', 'Paris', 'London', 'Los Angeles', 'Buenos Aires', 'Shanghai'];

export function MapView({ cards, savedCards = [], onToggleLike, onAddToCollection, onCreateCard, newCard, onNewCardShown }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('hasCreatedCard')) return;
    // Show after 1.5s
    const t1 = setTimeout(() => setShowTooltip(true), 1500);
    // Auto-dismiss after 7s
    const t2 = setTimeout(() => setShowTooltip(false), 8500);
    // Show again at 30s if still no card
    const t3 = setTimeout(() => {
      if (!localStorage.getItem('hasCreatedCard')) setShowTooltip(true);
    }, 30000);
    const t4 = setTimeout(() => setShowTooltip(false), 37000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);
  useEffect(() => {
    if (!newCard || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [newCard.lng, newCard.lat],
      zoom: 14,
      duration: 1200,
    });
    const t = setTimeout(() => {
      setSelectedCard(newCard);
      onNewCardShown?.();
    }, 1300);
    return () => clearTimeout(t);
  }, [newCard]);

  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [arCard, setArCard] = useState<Card | null>(null);
  const [apiCards, setApiCards] = useState<Card[]>([]);

  const startHover = (card: Card) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredCard(card);
  };
  const endHover = () => {
    hoverTimeout.current = setTimeout(() => setHoveredCard(null), 180);
  };
  const keepHover = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/cards/nearby?lat=40.7484&lng=-73.9857&radius_km=20`)
      .then((res) => {
        if (!res.ok) throw new Error('non-ok');
        return res.json();
      })
      .then((data: any[]) => {
        const mapped: Card[] = data.map((c) => ({
          id: c.id,
          photo: c.image_url
            ? c.image_url.startsWith('/')
              ? `${API_BASE}${c.image_url}`
              : c.image_url
            : '',
          title: c.title,
          story: c.story,
          location: c.location_name,
          tags: Array.isArray(c.tags) ? c.tags : [],
          likes: 0,
          timestamp: c.created_at,
          lat: c.lat,
          lng: c.lng,
        }));
        setApiCards(mapped);
      })
      .catch(() => setApiCards([]));
  }, []);

  const handleARDirections = (card: Card) => {
    setArCard(card);
    setShowAR(true);
  };

  if (showAR && arCard) {
    return (
      <ARDirections
        card={arCard}
        onBack={() => { setShowAR(false); setArCard(null); }}
        onCardSaved={() => {
          onAddToCollection(arCard.id as number);
          setShowAR(false);
          setArCard(null);
        }}
      />
    );
  }

  // Combine mock cards + any published API cards
  const allPins = [
    ...cards.map((card, i) => ({ card, color: PIN_COLORS[i % PIN_COLORS.length] })),
    ...apiCards.map((card, i) => ({ card, color: PIN_COLORS[(cards.length + i) % PIN_COLORS.length] })),
  ];

  const CardPopup = ({ card }: { card: Card }) => {
    const isLiked = card.likes > 0;
    const isSaved = savedCards.some((c) => c.id === card.id);

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-premium">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
          <img src={card.photo} alt={card.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>

        <div className="p-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F5] rounded-lg">
            <span className="text-xs text-[#6B6B6B] font-medium tracking-tight">{card.location}</span>
          </div>

          <h3 className="text-xl font-semibold text-[#1A1A1A] tracking-tight leading-tight">{card.title}</h3>
          <p className="text-[15px] text-[#6B6B6B] leading-relaxed">{card.story}</p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onToggleLike(card.id as number)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 h-11 rounded-xl transition-all ${
                isLiked
                  ? 'bg-gradient-to-br from-[#FF8A4C] to-[#FF7A3C] text-white shadow-md'
                  : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E2DE]'
              }`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} />
              <span className="text-sm font-medium">{card.likes}</span>
            </button>

            <button
              onClick={() => onAddToCollection(card.id as number)}
              disabled={isSaved}
              className={`flex-1 flex items-center justify-center px-4 py-2.5 h-11 rounded-xl font-medium text-sm transition-all ${
                isSaved
                  ? 'bg-[#E5E2DE] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] active:scale-98'
              }`}
            >
              {isSaved ? 'Saved' : 'Save to Collection'}
            </button>

            <button
              onClick={() => handleARDirections(card)}
              className="flex items-center justify-center px-4 py-2.5 h-11 w-11 bg-[#F5F5F5] hover:bg-[#E5E2DE] text-[#1A1A1A] rounded-xl transition-all"
            >
              <Navigation className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full relative">
      {/* Force Mapbox popup shell to be fully transparent */}
      <style>{`
        .story-hover-popup .mapboxgl-popup-content {
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          overflow: visible !important;
        }
        .story-hover-popup .mapboxgl-popup-tip { display: none !important; }
      `}</style>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -73.9680,
          latitude: 40.7300,
          zoom: 11.5,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        reuseMaps
      >
        <NavigationControl position="top-right" />

        {/* You are here — fixed in SoHo */}
        <Marker longitude={MY_LOCATION.lng} latitude={MY_LOCATION.lat} anchor="center">
          <div style={{ position: 'relative', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pulsing ring */}
            <div style={{
              position: 'absolute', width: 20, height: 20, borderRadius: '50%',
              background: '#3B82F6', opacity: 0.3,
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            {/* Solid dot */}
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: '#2563EB', border: '2.5px solid white',
              boxShadow: '0 2px 6px rgba(37,99,235,0.5)',
              position: 'relative', zIndex: 1,
            }} />
          </div>
        </Marker>

        {allPins.map(({ card, color }) => (
          <Marker
            key={card.id}
            longitude={card.lng}
            latitude={card.lat}
            anchor="center"
          >
            <button
              aria-label={card.title}
              onMouseEnter={() => startHover(card)}
              onMouseLeave={endHover}
              onClick={() => { setSelectedCard(card); setHoveredCard(null); }}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '2.5px solid white', cursor: 'pointer',
                backgroundColor: color,
                boxShadow: `0 2px 8px rgba(0,0,0,0.35), 0 0 0 3px ${color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.25)')}
              onMouseOut={e => { (e.currentTarget.style.transform = 'scale(1)'); endHover(); }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', pointerEvents: 'none' }} />
            </button>
          </Marker>
        ))}

        {/* Hover tooltip */}
        {hoveredCard && (
          <Popup
            longitude={hoveredCard.lng}
            latitude={hoveredCard.lat}
            anchor="bottom"
            offset={18}
            closeButton={false}
            closeOnClick={false}
            maxWidth="none"
            className="story-hover-popup"
          >
            {/* All styling here — popup shell is transparent */}
            <div
              onMouseEnter={keepHover}
              onMouseLeave={endHover}
              style={{
                width: 200,
                borderRadius: 16,
                overflow: 'hidden',
                background: '#ffffff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {/* Image — sits flush at top, clipped by parent border-radius */}
              <div style={{ width: '100%', height: 110, overflow: 'hidden' }}>
                <img
                  src={hoveredCard.photo}
                  alt={hoveredCard.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Text + button — centered */}
              <div style={{ padding: '10px 12px 12px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: '#1A1A1A', lineHeight: 1.4 }}>
                  {hoveredCard.title}
                </p>
                <p style={{
                  margin: '5px 0 0', fontSize: 11, color: '#6B6B6B', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {hoveredCard.story}
                </p>
                <button
                  onClick={() => { setSelectedCard(hoveredCard); setHoveredCard(null); }}
                  style={{
                    marginTop: 9, width: '100%',
                    background: 'rgba(26,26,26,0.88)', color: '#fff',
                    fontSize: 11, fontWeight: 500, padding: '6px 0',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                  }}
                >
                  See full →
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Card popup — controlled Dialog (no DialogTrigger needed) */}
      <Dialog open={selectedCard !== null} onOpenChange={(open) => { if (!open) setSelectedCard(null); }}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl border-0 p-0 overflow-hidden shadow-premium-lg">
          <DialogTitle className="sr-only">{selectedCard?.title ?? 'Hidden Spot'}</DialogTitle>
          <DialogDescription className="sr-only">
            View details about this hidden spot discovery.
          </DialogDescription>
          {selectedCard && <CardPopup card={selectedCard} />}
        </DialogContent>
      </Dialog>

      {/* City selector — top left */}
      <button
        onClick={() => setShowCityPicker(true)}
        className="absolute top-4 left-6 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-premium border border-black/[0.06] hover:bg-white transition-all"
      >
        <MapPin className="w-3.5 h-3.5 text-[#FF8A4C]" strokeWidth={2.5} />
        <span className="text-sm font-semibold text-[#1A1A1A] tracking-tight">New York City</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" strokeWidth={2.5} />
      </button>

      {/* City picker sheet */}
      {showCityPicker && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowCityPicker(false)}>
          <div
            className="w-full bg-white rounded-t-3xl p-6 shadow-premium-lg"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-[#E5E2DE] rounded-full mx-auto mb-5" />
            <h2 className="text-base font-semibold text-[#1A1A1A] tracking-tight mb-4">Choose a City</h2>

            {/* Active city */}
            <div className="flex items-center gap-3 bg-[#F5F5F5] rounded-xl px-4 py-3 mb-8">
              <MapPin className="w-4 h-4 text-[#FF8A4C] flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-[#1A1A1A] flex-1">New York City</span>
              <div className="w-2 h-2 rounded-full bg-[#FF8A4C]" />
            </div>

            {/* Upcoming cities */}
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-widest mb-3">Upcoming Cities</p>
            <div className="space-y-1" style={{ marginBottom: '32px' }}>
              {UPCOMING_CITIES.map(city => (
                <div key={city} className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50">
                  <Lock className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#6B6B6B] flex-1">{city}</span>
                  <span className="text-[10px] text-[#9CA3AF] bg-[#F5F5F5] px-2 py-0.5 rounded-full font-medium">Soon</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCityPicker(false)}
              className="w-full py-3 rounded-2xl bg-[#1A1A1A] text-white text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Single container: buttons on top, Hidden Spots bar below */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3" style={{ alignSelf: 'flex-end' }}>
          <button
            className="w-12 h-12 rounded-xl bg-white shadow-premium border border-black/[0.06] hover:shadow-premium-md hover:bg-[#FAFAFA] text-[#1A1A1A] flex items-center justify-center transition-all"
            aria-label="AR Navigation"
          >
            <Navigation className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="relative">
            {/* Tooltip bubble */}
            {showTooltip && (
              <div
                onClick={() => setShowTooltip(false)}
                style={{
                  position: 'absolute',
                  right: '56px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(30,30,30,0.82)',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '6px 11px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  opacity: 0.9,
                }}
              >
                Create your first story card
                {/* arrow pointing right */}
                <span style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0, height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '6px solid rgba(30,30,30,0.82)',
                }} />
              </div>
            )}
            <button
              onClick={() => {
                localStorage.setItem('hasCreatedCard', '1');
                setShowTooltip(false);
                onCreateCard?.();
              }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A4C] to-[#FF7A3C] text-white flex items-center justify-center shadow-premium-lg hover:shadow-premium-md transition-all active:scale-95"
              aria-label="Create new card"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-premium border border-black/[0.06] pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] tracking-tight">Hidden Spots</h3>
              <p className="text-xs text-[#6B6B6B]">{allPins.length} discoveries</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allPins.slice(0, 4).map(({ card, color }) => (
              <span key={card.id} className="text-xs bg-[#F5F5F5] text-[#6B6B6B] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="font-medium tracking-tight">{card.location.split(',')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
