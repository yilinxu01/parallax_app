import React, { useState, useEffect } from 'react';
import { Camera, Navigation, Target, CheckCircle } from 'lucide-react';
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

interface ARDirectionsProps {
  card: Card;
  onBack: () => void;
  onCardSaved: () => void;
}

export function ARDirections({ card, onBack, onCardSaved }: ARDirectionsProps) {
  const [arMode, setArMode] = useState<'navigation' | 'find-angle' | 'success'>('navigation');
  const [distance, setDistance] = useState(250); // meters
  const [alignment, setAlignment] = useState(0); // percentage of photo alignment

  useEffect(() => {
    // Mock distance countdown
    if (arMode === 'navigation' && distance > 0) {
      const timer = setInterval(() => {
        setDistance(prev => Math.max(0, prev - 5));
      }, 200);
      return () => clearInterval(timer);
    }
    
    // Switch to find-angle mode when close
    if (distance <= 10 && arMode === 'navigation') {
      setArMode('find-angle');
    }
  }, [distance, arMode]);

  useEffect(() => {
    // Mock photo alignment detection
    if (arMode === 'find-angle') {
      const timer = setInterval(() => {
        setAlignment(prev => {
          const newVal = prev + Math.random() * 10 - 5;
          return Math.max(0, Math.min(100, newVal));
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [arMode]);

  const handlePhotoAligned = () => {
    setArMode('success');
    setTimeout(() => {
      onCardSaved();
    }, 2000);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Mock camera background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-80">
        <div className="w-full h-full bg-gradient-to-t from-black/40 via-black/20 to-transparent flex items-center justify-center">
          <Camera className="w-24 h-24 text-white/30" />
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 bg-black/50 rounded-full p-3 text-white hover:bg-black/70 transition-colors"
      >
        ← Back
      </button>

      {/* AR UI Overlays */}
      {arMode === 'navigation' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
          {/* Navigation arrow */}
          <div className="mb-8">
            <div className="relative">
              <Navigation className="w-16 h-16 text-blue-400 animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Distance info */}
          <div className="bg-black/70 rounded-2xl px-6 py-4 text-center mb-8">
            <p className="text-2xl font-medium">{distance}m</p>
            <p className="text-sm text-gray-300">to {card.title}</p>
          </div>

          {/* Direction instruction */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 max-w-xs text-center shadow-lg">
            <p className="text-sm">Follow the arrow to reach the hidden spot!</p>
          </div>
        </div>
      )}

      {arMode === 'find-angle' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
          {/* Photo overlay */}
          <div className="relative mb-8">
            <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-white/50 relative shadow-2xl">
              <img 
                src={card.photo} 
                alt={card.title}
                className="w-full h-full object-cover opacity-40"
                style={{ opacity: alignment / 100 * 0.6 + 0.4 }}
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/70 rounded-2xl"></div>
            </div>
            
            {/* Alignment indicator */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-black/70 to-black/80 rounded-full px-4 py-2 shadow-lg">
                <p className="text-xs">{Math.round(alignment)}% aligned</p>
              </div>
            </div>
          </div>

          {/* Target crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Target className="w-12 h-12 text-white/60" />
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 max-w-xs text-center shadow-lg">
            <p className="text-sm">Move your camera to match the original photo angle!</p>
          </div>

          {/* Success trigger when well aligned */}
          {alignment > 85 && (
            <Button
              onClick={handlePhotoAligned}
              className="mt-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl px-8 py-3 animate-pulse shadow-lg"
            >
              🎯 Perfect Match!
            </Button>
          )}
        </div>
      )}

      {arMode === 'success' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white bg-green-500/20">
          <div className="text-center">
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-medium mb-4">🎉 Discovered!</h2>
            <p className="text-lg mb-2">{card.title}</p>
            <p className="text-sm text-gray-300 max-w-xs">Card saved to your collection</p>
          </div>
        </div>
      )}

      {/* Card info footer */}
      <div className="absolute bottom-24 left-6 right-6 z-20 bg-black/70 backdrop-blur-sm rounded-2xl p-4 text-white">
        <h3 className="font-medium mb-1 truncate">{card.title}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">{card.story}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/20 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}