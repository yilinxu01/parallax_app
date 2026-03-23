import React from 'react';
import { Settings, MapPin, Calendar, Heart, Bookmark, Building2, Target, Gem, Star, Trophy } from 'lucide-react';
import { Button } from './ui/button';

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

interface ProfileProps {
  cards: Card[];
  savedCards: Card[];
}

export function Profile({ cards, savedCards }: ProfileProps) {
  const userStats = {
    discoveries: cards.length,
    saved: savedCards.length,
    totalLikes: cards.reduce((sum, card) => sum + card.likes, 0)
  };

  const topTags = Array.from(
    new Set(cards.flatMap(card => card.tags))
  ).slice(0, 5);

  return (
    <div className="h-full bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5] overflow-y-auto">
      {/* Header - Premium minimal */}
      <div className="bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#2A2A2A] px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Building2 className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">NYC Explorer</h1>
              <p className="text-white/60 text-sm tracking-tight">Hidden spot hunter</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-white tracking-tight">{userStats.discoveries}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium mt-1">Found</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-white tracking-tight">{userStats.saved}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium mt-1">Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-white tracking-tight">{userStats.totalLikes}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider font-medium mt-1">Likes</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Taste Profile */}
        <div className="bg-white rounded-xl p-5 border border-black/[0.06]">
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3 tracking-tight">Your Taste</h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <span
                key={tag}
                className="bg-[#F5F5F5] text-[#6B6B6B] px-3 py-1.5 rounded-lg text-sm font-medium tracking-tight"
              >
                {tag}
              </span>
            ))}
            {topTags.length === 0 && (
              <p className="text-sm text-[#9CA3AF]">Discover more places to build your taste profile</p>
            )}
          </div>
        </div>

        {/* Saved Collection */}
        {savedCards.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-black/[0.06]">
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4 tracking-tight flex items-center gap-2">
              <Bookmark className="w-4 h-4" strokeWidth={2} />
              Saved Collection
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {savedCards.slice(0, 6).map((card) => (
                <div key={card.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={card.photo}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {savedCards.length > 6 && (
              <Button variant="outline" className="w-full mt-3 border-black/[0.06] hover:bg-[#F8F8F8] rounded-xl">
                View all {savedCards.length} saved
              </Button>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 border border-black/[0.06]">
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4 tracking-tight">Recent Discoveries</h2>
          <div className="space-y-3">
            {cards.slice(0, 3).map((card) => (
              <div key={card.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={card.photo}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1 text-[#1A1A1A] tracking-tight">{card.title}</p>
                  <div className="flex items-center text-xs text-[#9CA3AF] tracking-tight">
                    <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                    <span className="line-clamp-1">{card.location}</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-[#9CA3AF]">
                  <Heart className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  <span className="font-medium">{card.likes}</span>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <p className="text-sm text-[#9CA3AF] text-center py-4">No discoveries yet</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl p-5 border border-black/[0.06]">
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4 tracking-tight">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {cards.length > 0 && (
              <div className="relative bg-gradient-to-br from-[#FFD700] via-[#FFC700] to-[#FFB700] rounded-xl p-4 text-center shadow-lg overflow-hidden border border-[#FFD700]/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10"></div>
                <div className="relative">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-white/80 to-white/40 flex items-center justify-center shadow-md">
                    <Target className="w-5 h-5 text-[#996515]" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-semibold text-[#996515] tracking-tight drop-shadow-sm">First Discovery</p>
                </div>
              </div>
            )}
            {savedCards.length > 0 && (
              <div className="relative bg-gradient-to-br from-[#C0C0C0] via-[#B8B8B8] to-[#A8A8A8] rounded-xl p-4 text-center shadow-lg overflow-hidden border border-[#D3D3D3]/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/10"></div>
                <div className="relative">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-white/90 to-white/50 flex items-center justify-center shadow-md">
                    <Gem className="w-5 h-5 text-[#5A5A5A]" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-semibold text-[#404040] tracking-tight drop-shadow-sm">Collector</p>
                </div>
              </div>
            )}
            {userStats.totalLikes > 10 && (
              <div className="relative bg-gradient-to-br from-[#CD7F32] via-[#C57830] to-[#B8722E] rounded-xl p-4 text-center shadow-lg overflow-hidden border border-[#E5A858]/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10"></div>
                <div className="relative">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-white/80 to-white/40 flex items-center justify-center shadow-md">
                    <Star className="w-5 h-5 text-[#7A4F1E]" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-semibold text-[#7A4F1E] tracking-tight drop-shadow-sm">Community Favorite</p>
                </div>
              </div>
            )}
            {cards.length > 5 && (
              <div className="relative bg-gradient-to-br from-[#E5E4E2] via-[#D5D5D5] to-[#C9C9C9] rounded-xl p-4 text-center shadow-lg overflow-hidden border border-[#E8E8E8]/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/10"></div>
                <div className="relative">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-white/95 to-white/60 flex items-center justify-center shadow-md">
                    <Trophy className="w-5 h-5 text-[#6A6A6A]" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-semibold text-[#4A4A4A] tracking-tight drop-shadow-sm">Explorer</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Join Date */}
        <div className="text-center text-[#9CA3AF] text-sm py-4">
          <Calendar className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
          <span className="tracking-tight">Exploring since January 2024</span>
        </div>
      </div>
    </div>
  );
}