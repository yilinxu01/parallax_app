import React, { useState } from 'react';
import { ArrowLeft, Send, MapPin, X, Navigation, Edit3 } from 'lucide-react';
import { USERS, getUser, type UserProfile } from '../data/users';

interface Message {
  from: 'me' | 'them';
  text: string;
  isMeetup?: boolean;
  meetupLocation?: string;
  meetupDate?: string;
  meetupNote?: string;
  isLocation?: boolean;
  locationName?: string;
  locationAddress?: string;
  locationLng?: number;
  locationLat?: number;
}

interface Conversation {
  id: number;
  userId: string;
  user: { name: string; initials: string; color: string; avatar: string };
  cardTitle: string;
  cardPhoto: string;
  cardSentByMe?: boolean; // true if I was the one who shared the card
  lastMessage: string;
  time: string;
  unread: boolean;
  online: boolean;
  activity?: string;
  recentCardTitle?: string;
  recentCardPhoto?: string;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    userId: 'mei',
    user: { name: USERS.mei.name, initials: 'ME', color: '#8B7AF7', avatar: USERS.mei.avatar },
    cardTitle: 'The Hidden Jazz Club on 10th',
    cardPhoto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'Love this spot! Have you been back recently?',
    time: '2m ago',
    unread: true,
    online: true,
    activity: 'Exploring East Village',
    recentCardTitle: 'Dim Sum Alley, Chinatown',
    recentCardPhoto: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80',
    messages: [
      { from: 'them', text: 'Just saw your card about the jazz club — incredible find 🎷' },
      { from: 'me', text: 'Right?? I stumbled on it totally by accident' },
      { from: 'them', text: 'Love this spot! Have you been back recently?' },
    ],
  },
  {
    id: 2,
    userId: 'jordan',
    user: { name: USERS.jordan.name, initials: 'JO', color: '#3A7AFE', avatar: USERS.jordan.avatar },
    cardTitle: 'Rooftop Greenhouse, Bushwick',
    cardPhoto: 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'How did you find this place?!',
    time: '18m ago',
    unread: true,
    online: true,
    activity: 'Collecting in Bushwick',
    recentCardTitle: 'The Mural at Troutman St',
    recentCardPhoto: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=200&q=80',
    messages: [
      { from: 'them', text: 'Wait — that rooftop is real?? I thought it was staged' },
      { from: 'me', text: 'Completely real haha, no lock on the elevator either' },
      { from: 'them', text: 'How did you find this place?!' },
    ],
  },
  {
    id: 3,
    userId: 'yuki',
    user: { name: USERS.yuki.name, initials: 'YU', color: '#6BAF73', avatar: USERS.yuki.avatar },
    cardTitle: 'The Bookshop Cat',
    cardPhoto: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'Thanks for the tip, went yesterday 🌿',
    time: '2h ago',
    unread: false,
    online: false,
    cardSentByMe: true,
    messages: [
      { from: 'me', text: 'The cat is still there btw, saw it this morning' },
      { from: 'them', text: 'No way!! I need to go back' },
      { from: 'them', text: 'Thanks for the tip, went yesterday 🌿' },
    ],
  },
];

export function Messaging({ onViewProfile }: { onViewProfile?: (user: UserProfile) => void }) {
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMeetupSheet, setShowMeetupSheet] = useState(false);
  const [meetupMode, setMeetupMode] = useState<'card' | 'freeform'>('card');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupDate, setMeetupDate] = useState('');
  const [meetupNote, setMeetupNote] = useState('');

  const openConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setMessages(convo.messages);
    setMeetupLocation('');
    setMeetupMode('card');
  };

  const sendLocation = () => {
    // Mock current location — Lower East Side, NYC
    setMessages(prev => [...prev, {
      from: 'me',
      text: '',
      isLocation: true,
      locationName: 'Lower East Side',
      locationAddress: 'Delancey St, New York, NY',
      locationLng: -73.9880,
      locationLat: 40.7185,
    }]);
  };

  const openMeetupSheet = () => {
    setMeetupMode('card');
    setMeetupLocation('');
    setMeetupDate('');
    setMeetupNote('');
    setShowMeetupSheet(true);
  };

  const sendMeetup = () => {
    const location = meetupMode === 'card' ? (activeConvo?.cardTitle ?? '') : meetupLocation;
    if (!location.trim()) return;
    setMessages(prev => [...prev, {
      from: 'me',
      text: '',
      isMeetup: true,
      meetupLocation: location,
      meetupDate,
      meetupNote,
    }]);
    setShowMeetupSheet(false);
    setMeetupDate('');
    setMeetupNote('');
  };

  if (activeConvo) {
    return (
      <div className="h-full flex flex-col bg-white" style={{ position: 'relative' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-white/95 backdrop-blur-sm">
          <button onClick={() => { setActiveConvo(null); setShowMeetupSheet(false); }} className="p-1 -ml-1 text-[#1A1A1A]">
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button onClick={() => onViewProfile?.(getUser(activeConvo.userId))} style={{ position: 'relative', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={activeConvo.user.avatar} alt={activeConvo.user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            {activeConvo.online && (
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, background: '#22C55E', borderRadius: '50%', border: '1.5px solid white' }} />
            )}
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => onViewProfile?.(getUser(activeConvo.userId))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 15, fontWeight: 600, color: '#1A1A1A', letterSpacing: '-0.01em' }}>{activeConvo.user.name}</button>
              {activeConvo.online && (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#22C55E' }}>online</span>
              )}
            </div>
            {activeConvo.online && activeConvo.activity && (
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{activeConvo.activity}</p>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={sendLocation}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#3A7AFE', background: '#F5F8FF', border: 'none', borderRight: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}
          >
            <Navigation size={13} strokeWidth={2} />
            Share Location
          </button>
          <button
            onClick={openMeetupSheet}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#FF8A4C', background: '#FFF8F5', border: 'none', cursor: 'pointer' }}
          >
            <MapPin size={13} strokeWidth={2} />
            Suggest a Meetup
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Shared card bubble — aligned by sender */}
          <div style={{ display: 'flex', justifyContent: activeConvo.cardSentByMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{ background: '#F5F5F5', borderRadius: 16, overflow: 'hidden', width: 200, border: '1px solid rgba(0,0,0,0.06)', borderBottomRightRadius: activeConvo.cardSentByMe ? 4 : 16, borderBottomLeftRadius: activeConvo.cardSentByMe ? 16 : 4 }}>
              <img
                src={activeConvo.cardPhoto}
                alt={activeConvo.cardTitle}
                style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '8px 12px 10px' }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Shared a card</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3 }}>
                  {activeConvo.cardTitle}
                </p>
              </div>
            </div>
          </div>

          {messages.map((msg, i) => {
            if (msg.isMeetup) {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '72%', background: '#FFF8F5', border: '1px solid rgba(255,138,76,0.25)', borderRadius: 16, borderBottomRightRadius: 4, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                      <MapPin size={13} color="#FF8A4C" strokeWidth={2} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#FF8A4C' }}>Meetup suggested</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{msg.meetupLocation}</p>
                    {msg.meetupDate && <p style={{ fontSize: 12, color: '#6B6B6B' }}>{msg.meetupDate}</p>}
                    {msg.meetupNote && <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4, fontStyle: 'italic' }}>{msg.meetupNote}</p>}
                  </div>
                </div>
              );
            }
            if (msg.isLocation) {
              const mapToken = import.meta.env.VITE_MAPBOX_TOKEN;
              const mapUrl = mapToken
                ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3A7AFE(${msg.locationLng},${msg.locationLat})/${msg.locationLng},${msg.locationLat},14,0/300x150?access_token=${mapToken}`
                : 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=300&q=80';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ width: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', borderBottomRightRadius: msg.from === 'me' ? 4 : 16, borderBottomLeftRadius: msg.from === 'them' ? 4 : 16 }}>
                    <img src={mapUrl} alt="map" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    <div style={{ background: 'white', padding: '10px 12px 12px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{msg.locationName}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>{msg.locationAddress}</p>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '72%', padding: '10px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.4,
                  background: msg.from === 'me' ? '#1C1C1E' : '#F0F0F0',
                  color: msg.from === 'me' ? '#fff' : '#1A1A1A',
                  borderBottomRightRadius: msg.from === 'me' ? 4 : 18,
                  borderBottomLeftRadius: msg.from === 'them' ? 4 : 18,
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-black/[0.06] bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-[#F5F5F5] rounded-full px-4 py-2.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#9CA3AF]"
          />
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: inputText.trim() ? '#1C1C1E' : '#E5E5E5' }}
          >
            <Send className="w-4 h-4" color={inputText.trim() ? '#fff' : '#9CA3AF'} strokeWidth={1.5} />
          </button>
        </div>

        {/* Meetup bottom sheet */}
        {showMeetupSheet && (
          <>
            <div
              onClick={() => setShowMeetupSheet(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 10 }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '20px 20px 0 0', padding: '20px 20px 32px', zIndex: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>Suggest a Meetup</span>
                <button onClick={() => setShowMeetupSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={18} color="#9CA3AF" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Mode toggle */}
                <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 12, padding: 3, gap: 3 }}>
                  <button
                    onClick={() => setMeetupMode('card')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', background: meetupMode === 'card' ? 'white' : 'transparent', color: meetupMode === 'card' ? '#1A1A1A' : '#9CA3AF', boxShadow: meetupMode === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                  >
                    <MapPin size={12} strokeWidth={2} />
                    Quote a Card
                  </button>
                  <button
                    onClick={() => setMeetupMode('freeform')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', background: meetupMode === 'freeform' ? 'white' : 'transparent', color: meetupMode === 'freeform' ? '#1A1A1A' : '#9CA3AF', boxShadow: meetupMode === 'freeform' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                  >
                    <Edit3 size={12} strokeWidth={2} />
                    New Place
                  </button>
                </div>

                {/* Location field */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Where</label>
                  {meetupMode === 'card' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF8F5', border: '1px solid rgba(255,138,76,0.2)', borderRadius: 12, padding: '10px 14px' }}>
                      <img src={activeConvo.cardPhoto} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 10, color: '#FF8A4C', fontWeight: 600, marginBottom: 2 }}>Story card</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeConvo.cardTitle}</p>
                      </div>
                    </div>
                  ) : (
                    <input
                      value={meetupLocation}
                      onChange={e => setMeetupLocation(e.target.value)}
                      placeholder="Type a place..."
                      style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>When</label>
                  <input
                    value={meetupDate}
                    onChange={e => setMeetupDate(e.target.value)}
                    placeholder="e.g. Saturday at 3pm"
                    style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Note (optional)</label>
                  <input
                    value={meetupNote}
                    onChange={e => setMeetupNote(e.target.value)}
                    placeholder="Add a note..."
                    style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={sendMeetup}
                  style={{ width: '100%', background: '#1C1C1E', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/[0.06] px-6 py-4 z-10">
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Messages</h1>
        <p className="text-sm text-[#6B6B6B] tracking-tight">Connections from story cards</p>
      </div>

      <div className="bg-white divide-y divide-black/[0.04]">
        {CONVERSATIONS.map(convo => (
          <button
            key={convo.id}
            onClick={() => openConvo(convo)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={convo.user.avatar} alt={convo.user.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              {convo.online && (
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
              )}
              {convo.unread && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, background: '#3A7AFE', borderRadius: '50%', border: '2px solid white' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: convo.unread ? 600 : 500, color: '#1A1A1A' }}>{convo.user.name}</span>
                  {convo.online && <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E' }}>online</span>}
                </div>
                <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{convo.time}</span>
              </div>
              {/* Recent card collected — replaces "re: cardTitle" */}
              {convo.online && convo.recentCardTitle ? (
                <p style={{ fontSize: 11, color: '#3A7AFE', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  collected · {convo.recentCardTitle}
                </p>
              ) : (
                <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {convo.cardTitle}
                </p>
              )}
              {/* Last message preview */}
              <p style={{ fontSize: 13, color: convo.unread ? '#1A1A1A' : '#9CA3AF', fontWeight: convo.unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {convo.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
