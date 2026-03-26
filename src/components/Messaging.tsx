import React, { useState } from 'react';
import { ArrowLeft, Send, MapPin, Video } from 'lucide-react';

interface Conversation {
  id: number;
  user: { name: string; initials: string; color: string };
  cardTitle: string;
  cardPhoto: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: { from: 'me' | 'them'; text: string }[];
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
  const [inputText, setInputText] = useState('');

  if (activeConvo) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-white/95 backdrop-blur-sm">
          <button onClick={() => setActiveConvo(null)} className="p-1 -ml-1 text-[#1A1A1A]">
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

        {/* Action bar */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', fontSize: 13, fontWeight: 500, color: '#1A1A1A', background: 'white', border: 'none', borderRight: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>
            <MapPin size={14} strokeWidth={1.5} />
            Share Location
          </button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', fontSize: 13, fontWeight: 500, color: '#1A1A1A', background: 'white', border: 'none', cursor: 'pointer' }}>
            <Video size={14} strokeWidth={1.5} />
            Video Call
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Shared card bubble */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
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

          {activeConvo.messages.map((msg, i) => (
            <div
              key={i}
              style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}
            >
              <div
                style={{
                  maxWidth: '72%',
                  padding: '10px 14px',
                  borderRadius: 18,
                  fontSize: 14,
                  lineHeight: 1.4,
                  background: msg.from === 'me' ? '#1C1C1E' : '#F0F0F0',
                  color: msg.from === 'me' ? '#fff' : '#1A1A1A',
                  borderBottomRightRadius: msg.from === 'me' ? 4 : 18,
                  borderBottomLeftRadius: msg.from === 'them' ? 4 : 18,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
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
      </div>
    );
  }

  return (
    <div className="h-full bg-[#FAFAFA] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/[0.06] px-6 py-4 z-10">
        <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Messages</h1>
        <p className="text-sm text-[#6B6B6B] tracking-tight">Connections from story cards</p>
      </div>

      {/* Conversations */}
      <div className="bg-white divide-y divide-black/[0.04]">
        {CONVERSATIONS.map(convo => (
          <button
            key={convo.id}
            onClick={() => setActiveConvo(convo)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: convo.user.color, color: '#fff', fontSize: 14, fontWeight: 600 }}
              >
                {convo.user.initials}
              </div>
              {convo.unread && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, background: '#3A7AFE', borderRadius: '50%', border: '2px solid white' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: convo.unread ? 600 : 500, color: '#1A1A1A' }}>
                  {convo.user.name}
                </span>
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
