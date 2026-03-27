import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Navigation, CheckCircle } from 'lucide-react';

const COMPASS = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'] as const;
function headingLabel(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  const idx = Math.round(norm / 45) % 8;
  return COMPASS[idx];
}

interface Card {
  id: number;
  photo: string;
  title: string;
  story: string;
  funFact?: string;
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

const S = {
  root: {
    height: '100%',
    background: '#000',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  vignette: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.6) 100%)',
    pointerEvents: 'none' as const,
  },
  uiLayer: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  backBtn: {
    position: 'absolute' as const,
    top: 40,
    left: 16,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
  },
} as const;

export function ARDirections({ card, onBack, onCardSaved }: ARDirectionsProps) {
  const [arMode, setArMode] = useState<'navigation' | 'find-angle' | 'success'>('navigation');
  const [distance, setDistance] = useState(250);
  const [alignment, setAlignment] = useState(0);
  const [ghostOpacity, setGhostOpacity] = useState(0.45);
  const [heading, setHeading] = useState(35); // degrees — start roughly NE

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const refImgRef = useRef<HTMLImageElement | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Preload reference image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = card.photo;
    img.onload = () => { refImgRef.current = img; };
  }, [card.photo]);

  // Distance countdown + irregular heading drift
  useEffect(() => {
    if (arMode !== 'navigation') return;
    const distTimer = setInterval(() => {
      setDistance(prev => {
        const next = Math.max(0, prev - 5);
        if (next <= 10) { setArMode('find-angle'); clearInterval(distTimer); }
        return next;
      });
    }, 200);

    // Heading drifts irregularly — small jitters every 800ms, bigger turns every 2.5s
    const jitterTimer = setInterval(() => {
      setHeading(prev => prev + (Math.random() - 0.4) * 12); // slight drift, biased forward
    }, 800);
    const turnTimer = setInterval(() => {
      setHeading(prev => prev + (Math.random() - 0.3) * 60); // bigger course correction
    }, 2500);

    return () => {
      clearInterval(distTimer);
      clearInterval(jitterTimer);
      clearInterval(turnTimer);
    };
  }, [arMode]);

  // Histogram similarity in find-angle mode
  useEffect(() => {
    if (arMode !== 'find-angle') return;
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getHist = (src: CanvasImageSource) => {
      ctx.drawImage(src, 0, 0, 64, 64);
      const d = ctx.getImageData(0, 0, 64, 64).data;
      const h = new Float32Array(16);
      for (let i = 0; i < d.length; i += 4)
        h[Math.min(15, Math.floor((0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]) / 16))]++;
      const s = h.reduce((a, b) => a + b, 0);
      return h.map(v => v / s);
    };

    simTimerRef.current = setInterval(() => {
      const v = videoRef.current, r = refImgRef.current;
      if (!v || !r || v.readyState < 2) return;
      try {
        const sim = getHist(v).reduce((acc, v, i) => acc + Math.sqrt(v * getHist(r)[i]), 0);
        const pct = Math.round(sim * 100);
        setAlignment(pct);
        setGhostOpacity(0.5 - (pct / 100) * 0.35);
      } catch {}
    }, 500);
    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, [arMode]);

  const handleSuccess = () => {
    setArMode('success');
    setTimeout(() => onCardSaved(), 2000);
  };

  const handleBack = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onBack();
  };

  const alignColor = alignment > 75 ? '#22c55e' : alignment > 45 ? '#f59e0b' : '#60a5fa';
  const dirLabel = headingLabel(heading);

  return (
    <div style={S.root}>
      {/* Camera */}
      <video ref={videoRef} autoPlay playsInline muted style={S.video} />

      {/* Vignette */}
      <div style={S.vignette} />

      {/* Back button */}
      <button onClick={handleBack} style={S.backBtn}>
        <ChevronLeft style={{ width: 16, height: 16 }} />
        Back
      </button>

      {/* ── NAVIGATION MODE ── */}
      {arMode === 'navigation' && (
        <div style={{ ...S.uiLayer, zIndex: 20 }}>
          {/* top: distance badge */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '16px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 300, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{distance}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>meters away</div>
            </div>
          </div>

          {/* middle: animated compass arrow */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(96,165,250,0.1)',
              border: '1.5px solid rgba(147,197,253,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(96,165,250,0.15)',
              transition: 'box-shadow 0.3s ease',
            }}>
              <Navigation
                style={{
                  width: 36, height: 36,
                  color: '#93c5fd',
                  filter: 'drop-shadow(0 0 10px #60a5fa)',
                  transform: `rotate(${heading}deg)`,
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'opacity 0.3s ease',
            }}>
              Head {dirLabel.toLowerCase()}
            </div>
          </div>

          {/* bottom: card info */}
          <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', padding: '16px 20px 32px' }}>
            <div style={{ width: 32, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 12px' }} />
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{card.location}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {card.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 999 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FIND-ANGLE MODE ── */}
      {arMode === 'find-angle' && (
        <>
          {/* Ghost reference photo */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', opacity: ghostOpacity }}>
            <img src={card.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen' }} />
          </div>

          {/* Corner brackets */}
          {[
            { top: 80, left: 24 },
            { top: 80, right: 24 },
            { bottom: 200, left: 24 },
            { bottom: 200, right: 24 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 32, height: 32, zIndex: 20, pointerEvents: 'none',
              borderTop: i < 2 ? '2px solid rgba(255,255,255,0.7)' : undefined,
              borderBottom: i >= 2 ? '2px solid rgba(255,255,255,0.7)' : undefined,
              borderLeft: i % 2 === 0 ? '2px solid rgba(255,255,255,0.7)' : undefined,
              borderRight: i % 2 === 1 ? '2px solid rgba(255,255,255,0.7)' : undefined,
              ...pos,
            }} />
          ))}

          {/* UI flex column */}
          <div style={{ ...S.uiLayer, zIndex: 30 }}>
            {/* Top: hint label */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
              <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '8px 20px', color: '#fff', fontSize: 14 }}>
                Match the angle
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Bottom: controls */}
            <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)', padding: '16px 24px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Alignment bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 6 }}>
                  <span>Alignment</span>
                  <span>{alignment}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${alignment}%`, background: alignColor, borderRadius: 3, transition: 'width 0.5s ease, background 0.5s ease' }} />
                </div>
              </div>

              {/* Perfect Match — only at 85%+ */}
              {alignment > 85 && (
                <button onClick={handleSuccess} style={{ width: '100%', background: '#22c55e', border: 'none', borderRadius: 16, padding: '14px 0', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>
                  Perfect Match!
                </button>
              )}

              {/* Skip */}
              <button onClick={handleSuccess} style={{ alignSelf: 'center', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 24px', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>
                Skip for now
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── SUCCESS MODE ── */}
      {arMode === 'success' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 32, margin: '0 24px', color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle style={{ width: 36, height: 36, color: '#4ade80' }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Discovered!</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginBottom: 4 }}>{card.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{card.location}</div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Saved to your collection</div>
          </div>
        </div>
      )}
    </div>
  );
}
