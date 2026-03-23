import React, { useState } from 'react';
import { Grid3X3, List, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

interface MyCollectionProps {
  savedCards: Card[];
  onRemoveFromCollection: (cardId: number) => void;
}

export function MyCollection({ savedCards, onRemoveFromCollection }: MyCollectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique tags for filtering
  const allTags = Array.from(new Set(savedCards.flatMap(card => card.tags)));

  // Filter and sort cards
  const filteredCards = savedCards
    .filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'likes':
          return b.likes - a.likes;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Group cards by tags for organization
  const cardsByTag = allTags.reduce((acc, tag) => {
    acc[tag] = savedCards.filter(card => card.tags.includes(tag));
    return acc;
  }, {} as Record<string, Card[]>);

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💎</div>
            <div>
              <h1 className="font-medium">My Collection</h1>
              <p className="text-sm text-gray-600">{savedCards.length} saved spots</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search your collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {savedCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-6xl mb-4">🕳️</div>
          <h3 className="font-medium text-gray-900 mb-2">No saved spots yet</h3>
          <p className="text-gray-600 text-sm">Start exploring and save your favorite discoveries!</p>
        </div>
      ) : (
        <div className="p-4">
          {/* Tag-based organization */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <h2 className="font-medium text-gray-900 mb-3">By Category</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-white rounded-xl px-3 py-2 border border-gray-200 flex items-center space-x-2"
                  >
                    <span className="text-sm">{tag}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {cardsByTag[tag].length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredCards.map((card) => (
                <GridCard 
                  key={card.id} 
                  card={card} 
                  onRemove={onRemoveFromCollection}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCards.map((card) => (
                <ListCard 
                  key={card.id} 
                  card={card} 
                  onRemove={onRemoveFromCollection}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GridCard({ card, onRemove }: { card: Card, onRemove: (id: number) => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <div className="aspect-square bg-gray-200 relative">
        <img 
          src={card.photo} 
          alt={card.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onRemove(card.id)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1 mb-1">{card.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{card.story}</p>
        <div className="flex flex-wrap gap-1">
          {card.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListCard({ card, onRemove }: { card: Card, onRemove: (id: number) => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex space-x-4">
      <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={card.photo} 
          alt={card.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium line-clamp-1">{card.title}</h3>
          <button
            onClick={() => onRemove(card.id)}
            className="text-red-500 hover:text-red-600 ml-2"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{card.story}</p>
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}