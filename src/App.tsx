import React, { useState } from 'react';
import { Map, Users, User, Plus, MapPin, Navigation } from 'lucide-react';

const PIN_COLORS = ['#FF8A4C', '#3A7AFE', '#6BAF73', '#8B7AF7', '#FF6B9D', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];
import { CardCreationFlow } from './components/CardCreationFlow';
import { MapView } from './components/MapView';
import { CommunityFeed } from './components/CommunityFeed';
import { Profile } from './components/Profile';
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
  const [activeTab, setActiveTab] = useState<'map' | 'feed' | 'profile'>('map');
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  
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
          />
        )}
        {activeTab === 'profile' && (
          <Profile
            cards={cards}
            savedCards={savedCards}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-black/[0.06] px-6 pb-6 pt-3 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${activeTab === 'map' ? 'text-[#1A1A1A]' : 'text-[#9CA3AF] hover:text-[#6B6B6B]'}`}
          >
            <Map className="w-5 h-5" strokeWidth={activeTab === 'map' ? 2 : 1.5} />
            <span className="text-[11px] font-medium tracking-tight">{activeTab === 'map' ? 'Map' : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${activeTab === 'feed' ? 'text-[#1A1A1A]' : 'text-[#9CA3AF] hover:text-[#6B6B6B]'}`}
          >
            <Users className="w-5 h-5" strokeWidth={activeTab === 'feed' ? 2 : 1.5} />
            <span className="text-[11px] font-medium tracking-tight">{activeTab === 'feed' ? 'Feed' : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${activeTab === 'profile' ? 'text-[#1A1A1A]' : 'text-[#9CA3AF] hover:text-[#6B6B6B]'}`}
          >
            <User className="w-5 h-5" strokeWidth={activeTab === 'profile' ? 2 : 1.5} />
            <span className="text-[11px] font-medium tracking-tight">{activeTab === 'profile' ? 'Profile' : ''}</span>
          </button>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
    </div>
  );
}