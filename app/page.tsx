'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Send,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const handleQuickLogin = async (role: 'MENTOR' | 'STUDENT') => {
    try {
      if (role === 'MENTOR') {
        await login({
          email: 'mentor@programming-hero.com',
          password: 'Mentor123!',
        });
        router.push('/mentor/dashboard');
      } else {
        await login({
          email: 'student@programming-hero.com',
          password: 'Student123!',
        });
        router.push('/student/submit');
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-12 md:py-20 px-4 sm:px-6">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-5xl w-full mx-auto space-y-12 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Programming Hero Associate Web Instructor Hiring Task
        </div>

        {/* Hero title & description */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
            Project Submission &{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Review Dashboard
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A production-grade full-stack platform built with Next.js, Express.js, PostgreSQL, and Prisma ORM. Designed with role-based access control, strict server-side validation, anti-spam rate limiting, and real-time review statistics.
          </p>
        </div>

        {/* Quick Demo Login Box */}
        <div className="max-w-xl mx-auto p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Zap className="w-4 h-4 text-amber-500" />
            Instant Demo Access
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('MENTOR')}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Log in as Mentor
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Review, filter & approve submissions
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('STUDENT')}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 transition-all text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform mb-2">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Log in as Student
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Submit project details & track status
              </span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            Pre-seeded credentials: <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">mentor@programming-hero.com</code> / <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Mentor123!</code>
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              JWT & RBAC Security
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Strict role enforcement separating Student and Mentor capabilities at both route and controller levels.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Duplicate Prevention
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Zod defensive validation and database unique constraints stop duplicate student submissions.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Rate Limit Defense
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              IP-based submission rate limiting prevents automated spam and protects database server resources.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Server-Side Filters
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Server-side SQL filtering, search matching, and pagination with live aggregated statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
