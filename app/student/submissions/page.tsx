'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { submissionApi, type Submission } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Send,
  FolderGit2,
  Globe,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function StudentSubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await submissionApi.getMy();
        setSubmissions(res.data.submissions);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'ALL') return true;
    return sub.status === filter;
  });

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              My Submissions
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {submissions.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track evaluation status and read feedback from Programming Hero mentors
          </p>
        </div>

        <Link
          href="/student/submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Send className="w-3.5 h-3.5" />
          Submit New Project
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => {
          const count =
            tab === 'ALL'
              ? submissions.length
              : submissions.filter((s) => s.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filter === tab
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <span>{tab === 'ALL' ? 'All Projects' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab
                    ? 'bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-zinc-500">Loading your submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No projects found for filter: {filter}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'You have not submitted any projects yet.'
              : `You have no submissions currently marked as ${filter}.`}
          </p>
          <Link
            href="/student/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Submit a project now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-md backdrop-blur-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {sub.projectName}
                  </h3>
                  <StatusBadge status={sub.status} />
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                  {sub.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-indigo-400 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">GitHub Repo</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-indigo-600 shrink-0" />
                  </a>

                  <a
                    href={sub.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-indigo-400 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Live Demo</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-indigo-600 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Feedback or Date Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                {sub.feedback ? (
                  <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Mentor Feedback:
                    </span>
                    <p className="text-xs leading-relaxed">{sub.feedback}</p>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted on {new Date(sub.createdAt).toLocaleDateString()} at{' '}
                    {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
