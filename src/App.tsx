import React, { useState } from 'react';
import { Map, Users, User, Plus, MapPin, Navigation, MessageCircle, ArrowLeft, UserPlus, X } from 'lucide-react';
import { USERS, CARD_AUTHOR_IDS, getUser, type UserProfile } from './data/users';

const PIN_COLORS = ['#FF8A4C', '#3A7AFE', '#6BAF73', '#8B7AF7', '#FF6B9D', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];
import { CardCreationFlow } from './components/CardCreationFlow';
import { MapView } from './components/MapView';
import { CommunityFeed } from './components/CommunityFeed';
import { Profile } from './components/Profile';
import { Messaging } from './components/Messaging';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

interface Card {
  id: number;
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'feed' | 'messages' | 'profile'>('map');
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('hasSeenSplash'));
  const [viewingUserProfile, setViewingUserProfile] = useState<UserProfile | null>(null);
  
  // Mock data for demonstration
  const [cards, setCards] = useState<Card[]>([
    {
      id: 11,
      photo: "https://images.unsplash.com/photo-1698248476242-bfde13928633?auto=format&fit=crop&w=800&q=80",
      title: "The Door Nobody Uses",
      story: "Side entrance to Low Library, facing the sundial. It's always unlocked. I walked in once expecting to get stopped. Nobody looked up. There's a reading room at the end of the hall that smells like 1910.",
      location: "Columbia University, Morningside Heights",
      tags: ["#Columbia", "#NYC", "#Hidden"],
      likes: 17,
      lat: 40.8075,
      lng: -73.9626,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 12,
      photo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
      title: "The Bench at the End of the Path",
      story: "Riverside Park, past the 79th Street Boat Basin, there's a bench at the edge of the path that faces straight up the Hudson. No buildings. Just water and the Palisades going orange at 5pm. I've never seen anyone else sitting there.",
      location: "Riverside Park, Manhattan",
      tags: ["#RiversidePark", "#Hudson", "#NYC"],
      likes: 29,
      lat: 40.8006,
      lng: -73.9706,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 1,
      photo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      title: "The Wall That Talks Back",
      story: "Tucked behind a coffee shop on Orchard St. The colors shift when afternoon light hits — pinks become red, blues go almost black. I've gone back three times.",
      location: "Lower East Side, NYC",
      tags: ["#StreetArt", "#LES", "#Murals"],
      likes: 12,
      lat: 40.7166,
      lng: -73.9897,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      title: "The Ledge Guardian",
      story: "You only see it if you lean out the stairwell window on the third floor. Small, ceramic, someone placed it there on purpose. It's been watching the courtyard for who knows how long.",
      location: "MoMA PS1, Long Island City",
      tags: ["#MoMAPS1", "#HiddenArt", "#FoundIt"],
      likes: 8,
      lat: 40.7447,
      lng: -73.9485,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      photo: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=800&q=80",
      title: "Rooftop Nobody Talks About",
      story: "12th floor, the elevator opens straight into a garden. Tomatoes, actually. A folding chair pointed at the Empire State Building. No sign, no lock. Just there.",
      location: "Midtown, NYC",
      tags: ["#Rooftop", "#Garden", "#Urban"],
      likes: 15,
      lat: 40.7549,
      lng: -73.9840,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      photo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
      title: "The Canal Street Radio Guy",
      story: "Same corner every Saturday. He plays a radio, not a speaker — actual AM static mixed in. People stop and don't know why. I didn't know why either.",
      location: "Canal Street, Manhattan",
      tags: ["#CanalSt", "#StreetMusic", "#NYC"],
      likes: 23,
      lat: 40.7191,
      lng: -74.0028,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      photo: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
      title: "Stairs That Go Nowhere",
      story: "Dead-ends into a painted brick wall. Someone put a little potted plant on the top step anyway. The plant is doing great.",
      location: "Bushwick, Brooklyn",
      tags: ["#Bushwick", "#Weird", "#Brooklyn"],
      likes: 31,
      lat: 40.7050,
      lng: -73.9250,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      photo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
      title: "3am Diner Booth",
      story: "The coffee is bad. The lighting is worse. But everyone in here at 3am has somewhere they're coming from, and nobody asks.",
      location: "Hell's Kitchen, NYC",
      tags: ["#HellsKitchen", "#NightCity", "#Diner"],
      likes: 44,
      lat: 40.7638,
      lng: -73.9918,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 7,
      photo: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
      title: "Wrong Platform, Right Moment",
      story: "Wrong train, wrong platform. Found a tiled alcove I'd never seen — old MTA mosaic, half the tiles missing. Stood there alone for a full minute before the next train came.",
      location: "Chambers St Station, NYC",
      tags: ["#Subway", "#NYC", "#Hidden"],
      likes: 19,
      lat: 40.7140,
      lng: -74.0087,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 8,
      photo: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=800&q=80",
      title: "Chess at the Concrete Table",
      story: "The same four guys every Sunday morning. They play faster than any clock I've seen. I watched for an hour and only understood maybe two moves.",
      location: "Washington Square Park, NYC",
      tags: ["#WashingtonSq", "#Chess", "#NYC"],
      likes: 27,
      lat: 40.7308,
      lng: -74.0007,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 9,
      photo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      title: "Cash Only, One Table",
      story: "He's been making the same pizza since 1987. Cash only. One table by the window. He told me this unprompted while folding my slice.",
      location: "DUMBO, Brooklyn",
      tags: ["#DUMBO", "#Pizza", "#Brooklyn"],
      likes: 38,
      lat: 40.7033,
      lng: -73.9890,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 10,
      photo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
      title: "The Bookshop Cat",
      story: "Just a cat. In a used bookshop on Bleecker. Sitting on a stack of Penguin classics. Fully unbothered by everyone who came in specifically to pet it.",
      location: "West Village, NYC",
      tags: ["#WestVillage", "#Books", "#Cat"],
      likes: 52,
      lat: 40.7328,
      lng: -74.0030,
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [savedCards, setSavedCards] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState<Card | null>(null);

  const handleCreateCard = (card: Card) => {
    setCards(prev => [...prev, card]);
    setNewCard(card);
    setShowCreateFlow(false);
  };

  const handleToggleLike = (cardId: number) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { ...card, likes: card.likes > 0 ? 0 : Math.floor(Math.random() * 20) + 1 }
        : card
    ));
  };

  const handleAddToCollection = (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    if (card && !savedCards.find(c => c.id === cardId)) {
      setSavedCards([...savedCards, card]);
      toast.success(`"${card.title}" saved to your collection!`, {
        description: "View your saved cards in your profile."
      });
    }
  };

  const handleRemoveFromCollection = (cardId: number) => {
    setSavedCards(savedCards.filter(card => card.id !== cardId));
  };

  const handleRemix = (cardId: number) => {
    // Mock remix functionality - in real app this would open creation flow with base card
    console.log('Remixing card:', cardId);
  };

  const outerWrapStatic: React.CSSProperties = { minHeight: '100vh', backgroundColor: '#DCDCDC', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const phoneFrameStatic: React.CSSProperties = { width: '100%', maxWidth: '390px', height: '100vh', maxHeight: '844px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderRadius: window.innerWidth >= 768 ? '40px' : '0px' };

  if (showSplash) {
    return (
      <div style={outerWrapStatic}>
        <div style={{ ...phoneFrameStatic, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', padding: '48px 36px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '52px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Parallax
          </h1>
          <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '56px', maxWidth: '260px' }}>
            Explore hidden stories tied to real places in your city.
          </p>
          <button
            onClick={() => { localStorage.setItem('hasSeenSplash', '1'); setShowSplash(false); }}
            style={{ background: '#1C1C1E', color: '#ffffff', border: 'none', borderRadius: '100px', padding: '16px 40px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em' }}
          >
            Start Exploring
          </button>
        </div>
      </div>
    );
  }

  const phoneFrame: React.CSSProperties = {
    width: '100%',
    maxWidth: '390px',
    height: '100vh',
    maxHeight: '844px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    borderRadius: window.innerWidth >= 768 ? '40px' : '0px',
  };

  const outerWrap: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#DCDCDC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (showCreateFlow) {
    return (
      <div style={outerWrap}>
        <div style={phoneFrame}>
          <CardCreationFlow
            onComplete={handleCreateCard}
            onBack={() => setShowCreateFlow(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={outerWrap}>
    <div style={{ ...phoneFrame, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #FAFAFA, #F5F5F5)' }}>
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'map' && (
          <MapView
            cards={cards}
            savedCards={savedCards}
            onToggleLike={handleToggleLike}
            onAddToCollection={handleAddToCollection}
            onCreateCard={() => setShowCreateFlow(true)}
            newCard={newCard}
            onNewCardShown={() => setNewCard(null)}
          />
        )}
        {activeTab === 'feed' && (
          <CommunityFeed
            cards={cards}
            onToggleLike={handleToggleLike}
            onRemix={handleRemix}
            onMessage={() => setActiveTab('messages')}
            onViewProfile={(user) => setViewingUserProfile(user)}
          />
        )}
        {activeTab === 'messages' && (
          <Messaging onViewProfile={(user) => setViewingUserProfile(user)} />
        )}
        {activeTab === 'profile' && (
          <Profile
            cards={cards}
            savedCards={savedCards}
          />
        )}
      </div>

      {/* User profile overlay — shared across all tabs */}
      {viewingUserProfile && (() => {
        const user = viewingUserProfile;
        const userCards = cards.filter((_, i) => {
          const authorId = CARD_AUTHOR_IDS[i];
          return authorId && getUser(authorId).name === user.name;
        });
        const mutualCount = user.isFriend ? Math.floor(user.name.length * 1.3) + 2 : 0;
        return (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1200, background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)', padding: '40px 20px 24px', position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setViewingUserProfile(null)} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
                <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{user.name}</span>
                    {user.isFriend && <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.25)', color: '#34D399', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Friend</span>}
                  </div>
                  {user.bio && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{user.bio}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
                <div><span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{user.cardCount || 0}</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>spots</span></div>
                <div><span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{mutualCount}</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>mutual</span></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {user.isFriend ? (
                  <button onClick={() => { setViewingUserProfile(null); setActiveTab('messages'); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    <MessageCircle style={{ width: 14, height: 14 }} /> Message
                  </button>
                ) : (
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', color: '#1A1A1A', border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <UserPlus style={{ width: 14, height: 14 }} /> Add Friend
                  </button>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', marginBottom: 12 }}>{userCards.length > 0 ? `${userCards.length} Discoveries` : 'No spots yet'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {userCards.map(card => (
                  <div key={card.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: '100%', height: 100, overflow: 'hidden' }}>
                      <img src={card.photo} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '10px 10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>{card.location.split(',')[0]}</div>
                    </div>
                  </div>
                ))}
              </div>
              {(user.cardCount || 0) > userCards.length && (
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#9CA3AF', padding: '16px 0' }}>+ {(user.cardCount || 0) - userCards.length} more spots in other cities</div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Bottom navigation */}
      <div className="bg-white border-t border-black/[0.06] px-4 pb-6 pt-2 safe-area-pb">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: '28rem', margin: '0 auto' }}>
          {[
            { id: 'map', label: 'Map', Icon: Map },
            { id: 'feed', label: 'Feed', Icon: Users },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'map' | 'feed')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 12px', borderRadius: 12, border: 'none', background: 'none', cursor: 'pointer', color: activeTab === id ? '#1A1A1A' : '#9CA3AF', minWidth: 56 }}
            >
              <Icon style={{ width: 20, height: 20 }} strokeWidth={activeTab === id ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.025em', opacity: activeTab === id ? 1 : 0 }}>{label}</span>
            </button>
          ))}
          {/* Center create button — always fixed */}
          <button
            onClick={() => setShowCreateFlow(true)}
            style={{ marginBottom: 6, background: '#1C1C1E', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
          >
            <Plus style={{ width: 20, height: 20 }} color="#fff" strokeWidth={2} />
          </button>
          {[
            { id: 'messages', label: 'Messages', Icon: MessageCircle },
            { id: 'profile', label: 'Profile', Icon: User },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'messages' | 'profile')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 12px', borderRadius: 12, border: 'none', background: 'none', cursor: 'pointer', color: activeTab === id ? '#1A1A1A' : '#9CA3AF', minWidth: 56 }}
            >
              <Icon style={{ width: 20, height: 20 }} strokeWidth={activeTab === id ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.025em', opacity: activeTab === id ? 1 : 0 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toast notifications — constrain Sonner portal to phone frame */}
      <style>{`
        [data-sonner-toaster] {
          position: absolute !important;
          bottom: 90px !important;
          top: auto !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          max-width: 356px !important;
        }
      `}</style>
      <Toaster />
    </div>
    </div>
  );
}