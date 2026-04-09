import React, { useEffect, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Heart, MapPin, Plus, ChevronDown, Lock, Users, Globe, User, MessageCircle, UserPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { ARDirections } from './ARDirections';
import { USERS, CARD_AUTHOR_IDS, FRIEND_IDS, getUser, type UserProfile } from '../data/users';

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

// Friends with live locations — derived from shared user data
const FRIENDS = FRIEND_IDS
  .map(id => USERS[id])
  .filter((u): u is UserProfile & { lat: number; lng: number } => u != null && u.lat != null && u.lng != null)
  .map(u => ({ id: u.id, name: u.name, avatar: u.avatar, lat: u.lat, lng: u.lng, status: u.status || '' }));

// Author info derived from shared user data
type Author = Pick<UserProfile, 'name' | 'avatar' | 'isFriend' | 'bio' | 'cardCount'>;

const CARD_AUTHORS: Record<number, Author> = Object.fromEntries(
  Object.entries(CARD_AUTHOR_IDS).map(([idx, userId]) => {
    const u = getUser(userId);
    return [Number(idx), { name: u.name, avatar: u.avatar, isFriend: u.isFriend, bio: u.bio, cardCount: u.cardCount }];
  }),
);

type MapFilter = 'everyone' | 'friends' | 'mine';

export function MapView({ cards, savedCards = [], onToggleLike, onAddToCollection, onCreateCard, newCard, onNewCardShown }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mapFilter, setMapFilter] = useState<MapFilter>('everyone');
  const [viewingProfile, setViewingProfile] = useState<Author | null>(null);
  const [fullProfile, setFullProfile] = useState<Author | null>(null);

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
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <ARDirections
          card={arCard}
          onBack={() => { setShowAR(false); setArCard(null); }}
          onCardSaved={() => {
            onAddToCollection(arCard.id as number);
            setShowAR(false);
            setArCard(null);
          }}
        />
      </div>
    );
  }

  // Combine mock cards + any published API cards, with author info
  const allPinsUnfiltered = [
    ...cards.map((card, i) => ({
      card,
      color: PIN_COLORS[i % PIN_COLORS.length],
      author: CARD_AUTHORS[i] || null,
      isMine: false,
    })),
    ...apiCards.map((card, i) => ({
      card,
      color: PIN_COLORS[(cards.length + i) % PIN_COLORS.length],
      author: null,
      isMine: true, // user-created cards
    })),
  ];

  const allPins = allPinsUnfiltered.filter(pin => {
    if (mapFilter === 'everyone') return true;
    if (mapFilter === 'friends') return pin.author?.isFriend === true;
    if (mapFilter === 'mine') return pin.isMine;
    return true;
  });

  const CardPopup = ({ card, author }: { card: Card; author?: Author | null }) => {
    const isLiked = card.likes > 0;
    const isSaved = savedCards.some((c) => c.id === card.id);

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-premium">
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100" style={{ height: 200 }}>
          <img src={card.photo} alt={card.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          {/* Author badge on image */}
          {author && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewingProfile(author); }}
              style={{
                position: 'absolute', top: 12, left: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                borderRadius: 999, paddingLeft: 4, paddingRight: 10, paddingTop: 4, paddingBottom: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                border: 'none', cursor: 'pointer',
              }}
            >
              <img src={author.avatar} alt={author.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A' }}>{author.name}</span>
              {author.isFriend && (
                <span style={{ fontSize: 9, background: '#10B981', color: '#fff', padding: '1px 5px', borderRadius: 999, fontWeight: 600 }}>Friend</span>
              )}
            </button>
          )}
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
        .mapboxgl-ctrl-top-right { top: 16px !important; }
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

        {/* Friend live locations */}
        {(mapFilter === 'everyone' || mapFilter === 'friends') && FRIENDS.map(friend => (
          <Marker key={friend.id} longitude={friend.lng} latitude={friend.lat} anchor="center">
            <div style={{ position: 'relative', cursor: 'pointer' }} title={`${friend.name} — ${friend.status}`}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '2.5px solid #10B981',
                boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
                overflow: 'hidden',
                background: '#fff',
              }}>
                <img src={friend.avatar} alt={friend.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 12, height: 12, borderRadius: '50%',
                background: '#10B981', border: '2px solid white',
              }} />
            </div>
          </Marker>
        ))}

        {allPins.map(({ card, color, author }) => (
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
                border: `2.5px solid ${author?.isFriend ? '#10B981' : 'white'}`, cursor: 'pointer',
                backgroundColor: color,
                boxShadow: author?.isFriend
                  ? `0 2px 8px rgba(0,0,0,0.35), 0 0 0 3px rgba(16,185,129,0.3)`
                  : `0 2px 8px rgba(0,0,0,0.35), 0 0 0 3px ${color}33`,
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

      {/* Card popup — inline overlay (stays inside phone frame) */}
      {selectedCard && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 px-4"
          style={{ zIndex: 999 }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full rounded-2xl overflow-hidden shadow-2xl bg-white"
            style={{ maxHeight: '78%', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <CardPopup card={selectedCard} author={allPinsUnfiltered.find(p => p.card.id === selectedCard.id)?.author} />
          </div>
        </div>
      )}

      {/* Profile overlay */}
      {viewingProfile && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 16 }}
          onClick={() => setViewingProfile(null)}
        >
          <div
            style={{ width: '100%', maxWidth: 340, background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)', padding: '28px 24px 20px', textAlign: 'center', position: 'relative' }}>
              <button
                onClick={() => setViewingProfile(null)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X style={{ width: 14, height: 14, color: '#fff' }} />
              </button>
              <img src={viewingProfile.avatar} alt={viewingProfile.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{viewingProfile.name}</div>
              {viewingProfile.bio && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 1.4 }}>{viewingProfile.bio}</div>
              )}
              {viewingProfile.isFriend && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, background: 'rgba(16,185,129,0.2)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#34D399' }}>
                  <Users style={{ width: 10, height: 10 }} /> Friends
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '14px 0' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{viewingProfile.cardCount || 0}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Spots</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '14px 0', borderLeft: '1px solid #F0F0F0', borderRight: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{viewingProfile.isFriend ? Math.floor(Math.random() * 8) + 3 : 0}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Mutual</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '14px 0' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{Math.floor(Math.random() * 12) + 1}mo</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Active</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 20px 8px', display: 'flex', gap: 10 }}>
              {viewingProfile.isFriend ? (
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <MessageCircle style={{ width: 16, height: 16 }} /> Message
                </button>
              ) : (
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <UserPlus style={{ width: 16, height: 16 }} /> Add Friend
                </button>
              )}
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, background: '#F5F5F5', border: 'none', borderRadius: 14, cursor: 'pointer' }}>
                <MapPin style={{ width: 16, height: 16, color: '#6B6B6B' }} />
              </button>
            </div>
            {/* View full profile */}
            <button
              onClick={() => { setFullProfile(viewingProfile); setViewingProfile(null); setSelectedCard(null); }}
              style={{ display: 'block', width: '100%', padding: '12px 20px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3A7AFE', textAlign: 'center' }}
            >
              View all {viewingProfile.cardCount || 0} spots →
            </button>
          </div>
        </div>
      )}

      {/* City selector — top left */}
      <button
        onClick={() => setShowCityPicker(true)}
        className="absolute top-4 left-6 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-premium border border-black/[0.06] hover:bg-white transition-all"
      >
        <MapPin className="w-3.5 h-3.5 text-[#FF8A4C]" strokeWidth={2.5} />
        <span className="text-sm font-semibold text-[#1A1A1A] tracking-tight">New York City</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" strokeWidth={2.5} />
      </button>

      {/* Filter pills */}
      <div style={{ position: 'absolute', top: 72, left: 24, zIndex: 10, display: 'flex', gap: 6 }}>
        {([
          { key: 'everyone' as MapFilter, label: 'Everyone', icon: Globe },
          { key: 'friends' as MapFilter, label: 'Friends', icon: Users },
          { key: 'mine' as MapFilter, label: 'Mine', icon: User },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMapFilter(key)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={{
              background: mapFilter === key ? '#1A1A1A' : 'rgba(255,255,255,0.92)',
              color: mapFilter === key ? '#fff' : '#6B6B6B',
              borderColor: mapFilter === key ? '#1A1A1A' : 'rgba(0,0,0,0.06)',
              backdropFilter: 'blur(8px)',
              boxShadow: mapFilter === key ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <Icon style={{ width: 12, height: 12 }} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </div>

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

      {/* Single container: AR button on top-right, Hidden Spots bar below */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
        <div style={{ alignSelf: 'flex-end' }}>
          <button
            onClick={() => mapRef.current?.flyTo({ center: [MY_LOCATION.lng, MY_LOCATION.lat], zoom: 13, duration: 1200 })}
            className="w-12 h-12 rounded-xl bg-white shadow-premium border border-black/[0.06] hover:shadow-premium-md hover:bg-[#FAFAFA] text-[#1A1A1A] flex items-center justify-center transition-all"
            aria-label="Recenter map"
          >
            <Navigation className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-premium border border-black/[0.06] pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] tracking-tight">
                {mapFilter === 'friends' ? 'Friends\' Spots' : mapFilter === 'mine' ? 'My Spots' : 'Hidden Spots'}
              </h3>
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

      {/* Full profile page */}
      {fullProfile && (() => {
        // Find all cards by this author
        const authorCards = allPinsUnfiltered.filter(p => p.author?.name === fullProfile.name).map(p => p.card);
        const mutualCount = fullProfile.isFriend ? Math.floor(fullProfile.name.length * 1.3) + 2 : 0;
        return (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1200, background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)', padding: '40px 20px 24px', position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setFullProfile(null)}
                style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ← Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
                <img src={fullProfile.avatar} alt={fullProfile.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{fullProfile.name}</span>
                    {fullProfile.isFriend && (
                      <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.25)', color: '#34D399', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Friend</span>
                    )}
                  </div>
                  {fullProfile.bio && (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{fullProfile.bio}</div>
                  )}
                </div>
              </div>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
                <div><span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{fullProfile.cardCount || 0}</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>spots</span></div>
                <div><span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{mutualCount}</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>mutual</span></div>
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {fullProfile.isFriend ? (
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    <MessageCircle style={{ width: 14, height: 14 }} /> Message
                  </button>
                ) : (
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', color: '#1A1A1A', border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <UserPlus style={{ width: 14, height: 14 }} /> Add Friend
                  </button>
                )}
              </div>
            </div>

            {/* Cards grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', marginBottom: 12, letterSpacing: '0.02em' }}>
                {authorCards.length > 0 ? `${authorCards.length} Discoveries` : 'No spots yet'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {authorCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => { setSelectedCard(card); setFullProfile(null); }}
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  >
                    <div style={{ width: '100%', height: 100, overflow: 'hidden' }}>
                      <img src={card.photo} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '10px 10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>{card.location.split(',')[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
              {/* Show remaining spots as placeholder thumbnails for the full card count */}
              {(fullProfile.cardCount || 0) > authorCards.length && (
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#9CA3AF', padding: '16px 0' }}>
                  + {(fullProfile.cardCount || 0) - authorCards.length} more spots in other cities
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
