import React from 'react';
import { Heart, MessageCircle, RotateCcw, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Card {
  id: number;
  photo: string;
  title: string;
  story: string;
  funFact: string;
  location: string;
  tags: string[];
  likes: number;
  timestamp: string;
}

interface CommunityFeedProps {
  cards: Card[];
  onToggleLike: (cardId: number) => void;
  onRemix: (cardId: number) => void;
  onMessage?: () => void;
}

export function CommunityFeed({ cards, onToggleLike, onRemix, onMessage }: CommunityFeedProps) {
  // Mock user data
  const users = [
    { name: 'Maya', avatar: 'M', topCards: ['Street Art', 'Hidden Cafes', 'Rooftops'] },
    { name: 'Alex', avatar: 'A', topCards: ['Museums', 'Sculptures', 'Galleries'] },
    { name: 'Sam', avatar: 'S', topCards: ['Urban Exploration', 'Tunnels', 'Bridges'] },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5] overflow-y-auto">
      {/* Header - Premium minimal */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/[0.06] px-6 py-4 z-10">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">Discover</h1>
          <p className="text-sm text-[#6B6B6B] tracking-tight">What people nearby are finding</p>
        </div>
      </div>

      {/* Active discoverers */}
      <div className="px-6 py-5 bg-white border-b border-black/[0.06]">
        <h2 className="text-xs uppercase tracking-wider font-semibold mb-4 text-[#6B6B6B]">Active Now</h2>
        <div className="flex gap-5">
          {users.map((user) => (
            <div key={user.name} className="flex-shrink-0 text-left">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-full flex items-center justify-center text-white text-sm font-medium mb-2 shadow-premium">
                {user.avatar}
              </div>
              <p className="text-xs font-medium text-[#1A1A1A] tracking-tight">{user.name}</p>
              <p className="text-[10px] text-[#9CA3AF] tracking-tight">{user.topCards[0]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3 py-3">
        {cards
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((card, index) => {
            const user = users[index % users.length];
            
            return (
              <div key={`card-${card.id}`} className="bg-white border-y border-black/[0.06]">
                {/* User header */}
                <div className="flex items-center px-6 py-4">
                  <div className="w-9 h-9 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A1A1A] tracking-tight">{user.name}</p>
                    <div className="flex items-center text-xs text-[#9CA3AF] tracking-tight min-w-0">
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" strokeWidth={1.5} />
                      <span className="flex-shrink-0">{formatTimeAgo(card.timestamp)}</span>
                      <span className="mx-1.5 flex-shrink-0">·</span>
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{card.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  <img 
                    src={card.photo} 
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  {/* Title and story */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1 tracking-tight">{card.title}</h3>
                    <p className="text-[15px] text-[#6B6B6B] leading-relaxed">{card.story}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-[#F5F5F5] text-[#6B6B6B] px-2.5 py-1 rounded-lg font-medium tracking-tight"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center pt-2">
                    <div className="flex gap-4">
                      <button
                        onClick={() => onToggleLike(card.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          card.likes > 0 
                            ? 'text-[#FF8A4C]' 
                            : 'text-[#9CA3AF] hover:text-[#6B6B6B]'
                        }`}
                      >
                        <Heart className="w-5 h-5" fill={card.likes > 0 ? "currentColor" : "none"} strokeWidth={1.5} />
                        <span className="text-sm font-medium">{card.likes}</span>
                      </button>
                      
                      <button onClick={onMessage} className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#6B6B6B] transition-colors">
                        <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                        <span className="text-sm font-medium">Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Load more */}
      <div className="px-6 py-8 text-center">
        <Button variant="outline" className="rounded-xl border-black/[0.06] hover:bg-white">
          Load more
        </Button>
      </div>
    </div>
  );
}