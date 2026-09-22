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

  // Measure video duration once loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
      setDuration(videoRef.current.duration);
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
  // Zero seek stalls forward, seek-gated smooth stepping reverse
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;

    const tick = () => {
      if (!active) return;

      // Smoothly interpolate scroll progress (LERP)
      const diffP = targetProgress.current - smoothProgress.current;
      smoothProgress.current += diffP * 0.16;

      const clampedP = Math.max(0, Math.min(1, smoothProgress.current));
      setProgress(clampedP);
      setIsCompleted(clampedP >= 0.96);

      const targetTime = clampedP * duration;
      const leadTime = targetTime - video.currentTime;

      // Fluid Playback:
      if (leadTime > 0.05) {
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
          const nextTime = Math.max(0, video.currentTime - step);

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
      className="relative w-full h-[320vh] bg-[#070b18] select-none"
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
            onLoadedMetadata={handleLoadedMetadata}
            className="h-full w-full object-cover opacity-90"
            style={{ willChange: 'transform' }}
          />

          {/* Vignette Gradients */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b18] via-transparent to-[#070b18]/80" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070b18]/80 via-transparent to-[#070b18]/80" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,11,24,0.75)_85%)]" />
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
