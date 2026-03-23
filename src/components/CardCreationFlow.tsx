import React, { useRef, useState, useEffect } from 'react';
import { Camera, MapPin, Edit3, Sparkles, Info, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000';

interface GeocodeSuggestion {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

type AiPolishState = 'asking' | 'loading' | 'showing' | 'editing' | 'done';

interface CardCreationFlowProps {
  onComplete: (card: any) => void;
  onBack: () => void;
}

export function CardCreationFlow({ onComplete, onBack }: CardCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cardData, setCardData] = useState({
    photo: null as string | null,
    location: '',
    story: '',
    title: '',
    lat: 0,
    lng: 0,
    tags: [] as string[],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setShowWebcam(true);
      // Attach stream after state update renders the video element
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      // Fallback: open file picker with capture
      cameraInputRef.current?.click();
    }
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopWebcam();
      // Reuse the same upload flow
      setPhotoFile(file);
      setCardData(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
      setUploadingPhoto(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/api/upload-image`, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setCardData(prev => ({ ...prev, photo: `${API_BASE}${data.image_url}` }));
        }
      } catch { /* keep local preview */ }
      finally { setUploadingPhoto(false); }
    }, 'image/jpeg', 0.92);
  };

  // Clean up stream if component unmounts
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);
  const [aiPolishState, setAiPolishState] = useState<AiPolishState>('asking');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [geoSuggestions, setGeoSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const geoDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLocationInput = (value: string) => {
    setLocationQuery(value);
    setCardData(prev => ({ ...prev, location: value, lat: 0, lng: 0 }));
    if (geoDebounce.current) clearTimeout(geoDebounce.current);
    if (!value.trim()) { setGeoSuggestions([]); return; }
    geoDebounce.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6&countrycodes=us&addressdetails=1&viewbox=-74.26,40.48,-73.70,40.92&bounded=0`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        setGeoSuggestions((data ?? []).map((f: any) => {
          // Build a clean display name: "Name, Neighborhood, City"
          const a = f.address ?? {};
          const parts = [
            f.name,
            a.neighbourhood || a.suburb || a.borough,
            a.city || a.town || 'New York',
          ].filter(Boolean);
          return {
            place_name: parts.join(', '),
            center: [parseFloat(f.lon), parseFloat(f.lat)] as [number, number],
          };
        }));
      } catch { setGeoSuggestions([]); }
      finally { setGeoLoading(false); }
    }, 300);
  };

  const handleSelectSuggestion = (s: GeocodeSuggestion) => {
    setCardData(prev => ({ ...prev, location: s.place_name, lng: s.center[0], lat: s.center[1] }));
    setLocationQuery(s.place_name);
    setGeoSuggestions([]);
  };

  const steps = [
    {
      icon: Camera,
      title: 'Snap what you found!',
      bg: 'bg-gradient-to-br from-pink-400 to-purple-500'
    },
    {
      icon: MapPin,
      title: 'Where is it?',
      bg: 'bg-gradient-to-br from-blue-400 to-teal-500'
    },
    {
      icon: Edit3,
      title: 'Tell your mini-story',
      bg: 'bg-gradient-to-br from-green-400 to-emerald-500'
    },
    {
      icon: Sparkles,
      title: 'Almost done!',
      bg: 'bg-gradient-to-br from-orange-400 to-red-500'
    }
  ];

  const storyPrompts = [
    "I stumbled on...",
    "Secretly hidden at...",
    "Nobody notices this...",
    "Found by accident..."
  ];

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    // Show local preview immediately
    setCardData(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
    // Upload in background while user fills in other steps
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCardData(prev => ({ ...prev, photo: `${API_BASE}${data.image_url}` }));
      }
    } catch { /* keep the local object URL as fallback */ }
    finally { setUploadingPhoto(false); }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Use whatever photo was selected (or nothing — photo is optional)
    } else if (currentStep === 2) {
      // Reset AI polish state each time step 3 is entered
      setAiPolishState('asking');
      setAiSuggestion('');
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAiPolishYes = async () => {
    setAiPolishState('loading');
    try {
      const res = await fetch(`${API_BASE}/api/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: cardData.location,
          user_input: cardData.story,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const polished = data.story ?? '';
      const aiTags: string[] = data.tags ?? [];
      setAiSuggestion(polished);
      setCardData(prev => ({ ...prev, tags: aiTags }));
      setAiPolishState('showing');
    } catch {
      setAiPolishState('asking');
    }
  };

  const generateFallbackTags = (location: string): string[] => {
    const place = location.split(',')[0].trim().replace(/\s+/g, '');
    return ['#NYC', `#${place}`, '#HiddenSpot'];
  };

  const handleComplete = async () => {
    let imageUrl = cardData.photo ?? '';

    // Upload real photo file if one was selected
    if (photoFile) {
      try {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetch(`${API_BASE}/api/upload-image`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = `${API_BASE}${uploadData.image_url}`;
        }
      } catch { /* keep existing imageUrl */ }
    }

    // Persist card to backend (non-blocking — proceed regardless)
    try {
      await fetch(`${API_BASE}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cardData.title,
          story: cardData.story,
          location_name: cardData.location,
          lat: cardData.lat,
          lng: cardData.lng,
          image_url: imageUrl,
        }),
      });
    } catch { /* proceed even if backend is down */ }

    const finalCard = {
      ...cardData,
      photo: imageUrl || cardData.photo,
      id: Date.now(),
      tags: cardData.tags.length > 0 ? cardData.tags : generateFallbackTags(cardData.location),
      likes: 0,
      timestamp: new Date().toISOString(),
    };
    onComplete(finalCard);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={`min-h-screen ${currentStepData.bg} flex flex-col items-center justify-center p-6 text-white relative`}>
      {/* Back button */}
      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="absolute top-6 left-6 text-white/80 hover:text-white"
        >
          ← Back
        </button>
      )}
      
      {/* Close button */}
      <button
        onClick={onBack}
        className="absolute top-6 right-6 text-white/80 hover:text-white"
      >
        ✕
      </button>

      {/* Step indicator */}
      <div className="flex space-x-2 mb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index <= currentStep ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center max-w-sm w-full">
        <div className="mb-6 flex justify-center">
          <currentStepData.icon size={64} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl mb-8 font-medium">{currentStepData.title}</h1>

        {/* Step-specific content */}
        {currentStep === 0 && (
          <div className="mb-8">
            {/* Hidden inputs */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
            <canvas ref={canvasRef} className="hidden" />

            {/* Webcam live view */}
            {showWebcam ? (
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {/* Capture button */}
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-white/40 shadow-lg active:scale-95 transition-all"
                />
                {/* Close webcam */}
                <button
                  onClick={stopWebcam}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <>
                {/* Photo preview / placeholder */}
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black/20 flex items-center justify-center mb-4">
                  {cardData.photo ? (
                    <img src={cardData.photo} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={48} className="text-white/60" />
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>

                {/* Two action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={startWebcam}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all"
                  >
                    <Camera size={18} />
                    Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-3 mb-8 text-left">
            {/* Use current location button */}
            <button
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  const { latitude: lat, longitude: lng } = pos.coords;
                  setGeoLoading(true);
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
                    const data = await res.json();
                    const a = data.address ?? {};
                    const parts = [data.name || a.amenity || a.road, a.neighbourhood || a.suburb || a.borough, a.city || a.town || 'New York'].filter(Boolean);
                    const place_name = parts.join(', ');
                    setLocationQuery(place_name);
                    setCardData(prev => ({ ...prev, location: place_name, lat, lng }));
                  } catch { /* ignore */ }
                  finally { setGeoLoading(false); }
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all"
            >
              <MapPin size={15} />
              Use Current Location
            </button>

            <div className="relative">
              <Input
                placeholder="Or search for a place…"
                value={locationQuery}
                onChange={(e) => handleLocationInput(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pr-8"
                autoFocus
              />
              {geoLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-white/60" size={16} />
              )}
            </div>

            {geoSuggestions.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                {geoSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-3 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] flex items-start gap-2 border-b border-black/[0.05] last:border-0"
                  >
                    <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#6B6B6B]" />
                    <span className="leading-snug">{s.place_name}</span>
                  </button>
                ))}
              </div>
            )}

            {cardData.lat !== 0 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <MapPin size={14} className="text-white/80 flex-shrink-0" />
                <p className="text-xs text-white/80 leading-snug truncate">{cardData.location}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {storyPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setCardData({...cardData, story: prompt})}
                  className="bg-white/20 px-3 py-1 rounded-full text-sm hover:bg-white/30"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your discovery story..."
              value={cardData.story}
              onChange={(e) => setCardData({...cardData, story: e.target.value})}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 resize-none"
              rows={4}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 mb-8">
            {/* AI story polish prompt */}
            {aiPolishState === 'asking' && (
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <Sparkles className="mx-auto mb-2" size={24} />
                <p className="text-sm mb-4">Would you like AI to help polish your story?</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleAiPolishYes}
                    className="bg-white text-black hover:bg-white/90 rounded-xl px-6"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setAiPolishState('done')}
                    variant="ghost"
                    className="text-white border border-white/40 hover:bg-white/10 rounded-xl px-6"
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            {aiPolishState === 'loading' && (
              <div className="bg-white/20 rounded-2xl p-4 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" size={24} />
                <p className="text-sm">Polishing your story…</p>
              </div>
            )}


            {aiPolishState === 'showing' && (
              <>
                {/* AI suggestion — read-only */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-medium opacity-60 uppercase tracking-wide">AI suggestion</p>
                  <p className="text-sm leading-relaxed opacity-90">{aiSuggestion}</p>
                </div>

                {/* Choice buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setCardData(prev => ({ ...prev, story: aiSuggestion }));
                      setAiPolishState('done');
                    }}
                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl py-3"
                  >
                    Use this version
                  </Button>
                  <Button
                    onClick={() => setAiPolishState('editing')}
                    variant="ghost"
                    className="w-full text-white border border-white/40 hover:bg-white/10 rounded-xl py-3"
                  >
                    Edit &amp; mix
                  </Button>
                  <Button
                    onClick={() => setAiPolishState('done')}
                    variant="ghost"
                    className="w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl py-3"
                  >
                    Keep my original
                  </Button>
                </div>
              </>
            )}

            {aiPolishState === 'editing' && (
              <>
                {/* AI suggestion stays visible as reference */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3 space-y-1">
                  <p className="text-xs font-medium opacity-50 uppercase tracking-wide">AI suggestion (reference)</p>
                  <p className="text-xs leading-relaxed opacity-70">{aiSuggestion}</p>
                </div>

                {/* Editable story — starts from user's original */}
                <Textarea
                  value={cardData.story}
                  onChange={(e) => setCardData({ ...cardData, story: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 resize-none text-sm"
                  rows={4}
                />

                {/* Title */}
                <Input
                  placeholder="Card title"
                  value={cardData.title}
                  onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </>
            )}

            {/* Title only — No path */}
            {aiPolishState === 'done' && (
              <Input
                placeholder="Card title"
                value={cardData.title}
                onChange={(e) => setCardData({...cardData, title: e.target.value})}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            )}
          </div>
        )}

        {/* Action button */}
        {(currentStep < steps.length - 1 || aiPolishState === 'done' || aiPolishState === 'editing') && (
          <Button
            onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
            className="w-full bg-white text-black hover:bg-white/90 rounded-2xl py-6"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2 inline" strokeWidth={2} />
            {currentStep === steps.length - 1 ? 'Create Card' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  );
}