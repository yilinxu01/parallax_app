import React, { useState } from 'react';
import { ArrowLeft, Send, MapPin, X } from 'lucide-react';

interface Message {
  from: 'me' | 'them';
  text: string;
  isMeetup?: boolean;
  meetupLocation?: string;
  meetupDate?: string;
  meetupNote?: string;
}

interface Conversation {
  id: number;
  user: { name: string; initials: string; color: string };
  cardTitle: string;
  cardPhoto: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    user: { name: 'Sarah K.', initials: 'SK', color: '#8B7AF7' },
    cardTitle: 'The Hidden Jazz Club on 10th',
    cardPhoto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'Love this spot! Have you been back recently?',
    time: '2m ago',
    unread: true,
    messages: [
      { from: 'them', text: 'Just saw your card about the jazz club — incredible find 🎷' },
      { from: 'me', text: 'Right?? I stumbled on it totally by accident' },
      { from: 'them', text: 'Love this spot! Have you been back recently?' },
    ],
  },
  {
    id: 2,
    user: { name: 'Marcus T.', initials: 'MT', color: '#3A7AFE' },
    cardTitle: 'Rooftop Greenhouse, Bushwick',
    cardPhoto: 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'How did you find this place?!',
    time: '18m ago',
    unread: true,
    messages: [
      { from: 'them', text: 'Wait — that rooftop is real?? I thought it was staged' },
      { from: 'me', text: 'Completely real haha, no lock on the elevator either' },
      { from: 'them', text: 'How did you find this place?!' },
    ],
  },
  {
    id: 3,
    user: { name: 'Yuki L.', initials: 'YL', color: '#6BAF73' },
    cardTitle: 'The Bookshop Cat',
    cardPhoto: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'Thanks for the tip, went yesterday 🌿',
    time: '2h ago',
    unread: false,
    messages: [
      { from: 'me', text: 'The cat is still there btw, saw it this morning' },
      { from: 'them', text: 'No way!! I need to go back' },
      { from: 'them', text: 'Thanks for the tip, went yesterday 🌿' },
    ],
  },
];

export function Messaging() {
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMeetupSheet, setShowMeetupSheet] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupDate, setMeetupDate] = useState('');
  const [meetupNote, setMeetupNote] = useState('');

  const openConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setMessages(convo.messages);
    setMeetupLocation(convo.cardTitle);
  };

  const sendMeetup = () => {
    if (!meetupLocation.trim()) return;
    setMessages(prev => [...prev, {
      from: 'me',
      text: '',
      isMeetup: true,
      meetupLocation,
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
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ background: activeConvo.user.color }}
          >
            {activeConvo.user.initials}
          </div>
          <span className="text-[15px] font-semibold text-[#1A1A1A] tracking-tight">{activeConvo.user.name}</span>
        </div>

        {/* Suggest a Meetup bar */}
        <button
          onClick={() => setShowMeetupSheet(true)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#FF8A4C', background: '#FFF8F5', border: 'none', borderTop: '1px solid rgba(255,138,76,0.15)', borderBottom: '1px solid rgba(255,138,76,0.15)', cursor: 'pointer' }}
        >
          <MapPin size={14} strokeWidth={2} />
          Suggest a Meetup
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Shared card bubble — left aligned (sent by "them") */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div style={{ background: '#F5F5F5', borderRadius: 16, overflow: 'hidden', width: 200, border: '1px solid rgba(0,0,0,0.06)' }}>
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
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Where</label>
                  <input
                    value={meetupLocation}
                    onChange={e => setMeetupLocation(e.target.value)}
                    placeholder="Location"
                    style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }}
                  />
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
              <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: convo.user.color, color: '#fff', fontSize: 14, fontWeight: 600 }}>
                {convo.user.initials}
              </div>
              {convo.unread && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, background: '#3A7AFE', borderRadius: '50%', border: '2px solid white' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: convo.unread ? 600 : 500, color: '#1A1A1A' }}>{convo.user.name}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{convo.time}</span>
              </div>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                re: {convo.cardTitle}
              </p>
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
