'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  Cpu,
  Shield,
  Zap,
} from 'lucide-react';

interface Chapter {
  id: number;
  start: number;
  end: number;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tag: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    start: 0,
    end: 0.25,
    badge: 'STAGE 01 // STEALTH CORE',
    icon: Zap,
    title: 'Autonomous Web Intelligence',
    description: 'Zero-API cost headless DOM scraping, unrestricted pagination, and stealth footprint bypassing anti-bot blockers.',
    tag: '100% UNRESTRICTED',
  },
  {
    id: 2,
    start: 0.25,
    end: 0.55,
    badge: 'STAGE 02 // MULTI-SURFACE SOURCING',
    icon: Cpu,
    title: 'Maps, SERP & Technographic Sourcing',
    description: 'Chained business emails, phone numbers, verified GST, and WhatsApp RFQ triggers in parallel across live search surfaces.',
    tag: 'MULTI-THREAD PARALLEL',
  },
  {
    id: 3,
    start: 0.55,
    end: 0.85,
    badge: 'STAGE 03 // COGNITIVE REVOPS',
    icon: Shield,
    title: 'AI-Synthesized CRM Dossiers',
    description: 'Raw web noise transformed into deduplicated, structured intelligence ready for Smartlead and enterprise CRM pipelines.',
    tag: 'BYOK AI REVOPS',
  },
  {
    id: 4,
    start: 0.85,
    end: 1.0,
    badge: 'STAGE 04 // MISSION READY',
    icon: Layers,
    title: '6 Focused Research Workspaces',
    description: 'Video briefing complete. Scroll forward into dedicated control rooms tailored to your exact investigation workflow.',
    tag: 'READY TO DEPLOY',
  },
];

// herovideo.mp4 is 24fps — one frame ≈ 0.0417s. Frame 0 renders half-dark
// (fade-in from black), so the whole scrub range starts one+ frame forward
// and every scroll mapping stays aligned to that same offset.
const FRAME = 1 / 24;
const START_OFFSET = FRAME * 1.5; // ~0.062s: first fully-visible frame
const END_TRIM = 0.05; // keep the last frame clear of the fade-out tail

export default function ScrollVideoHero() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafId = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const isSeeking = useRef(false);
  const primed = useRef(false);
  const lastFrameTime = useRef<number | null>(null);
  const lastRenderedProgress = useRef(0);
  const lastRenderedCompleted = useRef(false);

  // Measure video duration once loaded, then prime the first visible frame
  // so the hero never paints the half-invisible frame 0.
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && !isNaN(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
  };

  const primeFirstFrame = () => {
    const video = videoRef.current;
    if (!video || primed.current) return;
    primed.current = true;
    try {
      video.pause();
      // Seeking to the offset frame; 'seeked' handler releases the gate.
      if (Math.abs(video.currentTime - START_OFFSET) > 0.01) {
        isSeeking.current = true;
        video.currentTime = START_OFFSET;
      } else {
        isSeeking.current = false;
      }
    } catch {
      isSeeking.current = false;
    }
  };

  // Passive window scroll listener to compute scroll fraction (0.0 to 1.0)
  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / totalScrollable));
      targetProgress.current = p;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth, continuous hardware playback animation loop
  // Single aligned pattern: time-based damping -> one scrub range
  // [START_OFFSET, duration - END_TRIM]. Forward plays fluidly, reverse
  // steps back through the same range. State updates are throttled so
  // React re-renders at most on visible progress changes, not every RAF.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    lastFrameTime.current = null;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Aligned scrub range: progress 0..1 maps onto the visible frames only.
    const scrubRange = Math.max(0.1, duration - START_OFFSET - END_TRIM);
    const toVideoTime = (p: number) =>
      START_OFFSET + Math.max(0, Math.min(1, p)) * scrubRange;

    const renderProgress = (p: number) => {
      const clamped = Math.max(0, Math.min(1, p));
      if (Math.abs(clamped - lastRenderedProgress.current) > 0.002) {
        lastRenderedProgress.current = clamped;
        setProgress(clamped);
      }
      const completed = clamped >= 0.96;
      if (completed !== lastRenderedCompleted.current) {
        lastRenderedCompleted.current = completed;
        setIsCompleted(completed);
      }
    };

    const tick = (now: number) => {
      if (!active) return;

      // Time-based damping: same feel at 30/60/120Hz (matches old 0.16 @60fps).
      if (lastFrameTime.current == null) lastFrameTime.current = now;
      const dt = Math.min(0.1, Math.max(0, (now - lastFrameTime.current) / 1000));
      lastFrameTime.current = now;
      const alpha = prefersReducedMotion ? 1 : 1 - Math.exp(-dt * 10.5);

      // Smoothly interpolate scroll progress (LERP)
      const diffP = targetProgress.current - smoothProgress.current;
      smoothProgress.current += diffP * alpha;

      const clampedP = Math.max(0, Math.min(1, smoothProgress.current));
      renderProgress(clampedP);

      const targetTime = toVideoTime(clampedP);
      const leadTime = targetTime - video.currentTime;

      // Fluid Playback:
      if (prefersReducedMotion) {
        if (!video.paused) video.pause();
        if (!isSeeking.current && Math.abs(leadTime) > 0.08) {
          isSeeking.current = true;
          video.currentTime = targetTime;
        }
      } else if (leadTime > 0.05) {
        // Target is ahead (scrolling down): play smoothly forward
        const speed = Math.min(3.2, Math.max(0.75, leadTime * 1.8));
        video.playbackRate = speed;

        if (video.paused) {
          video.play().catch(() => {});
        }
      } else if (leadTime < -0.05) {
        // Target is behind (scrolling up): pause and smoothly step backward
        if (!video.paused) {
          video.pause();
        }

        // Only issue reverse seek if previous seek has rendered
        if (!isSeeking.current) {
          const absDiff = Math.abs(leadTime);
          const step = Math.min(absDiff, Math.max(0.04, absDiff * 0.3));
          const nextTime = Math.max(START_OFFSET, video.currentTime - step);

          if (Math.abs(video.currentTime - nextTime) > 0.02) {
            isSeeking.current = true;
            video.currentTime = nextTime;
          }
        }
      } else {
        // In sync: pause video
        if (!video.paused) {
          video.pause();
        }
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    const onSeeked = () => {
      isSeeking.current = false;
    };

    video.addEventListener('seeked', onSeeked);

    return () => {
      active = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [duration]);

  // Current active chapter
  const activeChapter =
    CHAPTERS.find((ch) => progress >= ch.start && progress < ch.end) || CHAPTERS[CHAPTERS.length - 1];

  return (
    <section
      ref={trackRef}
      className="relative w-full h-[320vh] overflow-clip bg-[#070b18] select-none"
      aria-label="Interactive Hero Video Briefing"
    >
      {/* Sticky Fullscreen Viewport — Stays locked at top: 0 until scroll finishes */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center bg-[#070b18]">
        {/* Ambient Glows */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/4 w-[600px] h-[350px] rounded-full bg-indigo-600/15 blur-[120px]"
          aria-hidden="true"
        />

        {/* Video Background Layer */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src="/herovideo.mp4"
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={primeFirstFrame}
            onCanPlay={primeFirstFrame}
            className="h-full w-full scale-[1.03] object-cover object-center opacity-90"
            style={{ willChange: 'transform' }}
          />

          {/* Vignette Gradients — top kept light so the primed first frame stays visible */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b18] via-transparent to-[#070b18]/45" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070b18]/70 via-transparent to-[#070b18]/70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(7,11,24,0.7)_88%)]" />
        </div>

        {/* Dynamic HUD Overlays (No player controls, pure cinematic briefing) */}
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-10 xl:px-20 pointer-events-none">
          <div className="max-w-2xl">
            {/* Stage Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-950/60 backdrop-blur-md px-3.5 py-1.5 shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-cyan-200">
                {activeChapter.badge}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">|</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {activeChapter.tag}
              </span>
            </div>

            {/* Chapter Title */}
            <h1 className="mt-4 text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {activeChapter.title}
            </h1>

            {/* Chapter Description */}
            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-slate-300/90 sm:text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {activeChapter.description}
            </p>

            {/* Stage Indicator Pills */}
            <div className="mt-6 flex items-center gap-2">
              {CHAPTERS.map((ch) => {
                const isActive = progress >= ch.start && progress < ch.end;
                const isPassed = progress >= ch.end;
                return (
                  <div
                    key={ch.id}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-10 bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
                        : isPassed
                        ? 'w-5 bg-cyan-700/60'
                        : 'w-3 bg-white/15'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Minimal Scroll Cue at Bottom (No player controls) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          {isCompleted ? (
            <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/80 backdrop-blur-md px-4 py-2 text-xs font-bold text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] animate-bounce">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Briefing complete · Scroll down to continue ↓</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>Scroll to explore</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
