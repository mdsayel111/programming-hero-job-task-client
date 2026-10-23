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
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export default function StudentSubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicateError, setIsDuplicateError] = useState(false);
  const [isRateLimitError, setIsRateLimitError] = useState(false);
  const [successSubmission, setSuccessSubmission] = useState<Submission | null>(null);

  // Recent student submissions for immediate visibility
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchRecentSubmissions = async () => {
    try {
      setLoadingRecent(true);
      const res = await submissionApi.getMy();
      setRecentSubmissions(res.data.submissions);
    } catch (err) {
      console.error('Failed to load recent submissions:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentSubmissions();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDuplicateError(false);
    setIsRateLimitError(false);
    setSuccessSubmission(null);

    // Client-side pre-validations
    if (!repoUrl.includes('github.com') && !repoUrl.includes('gitlab.com') && !repoUrl.includes('bitbucket.org')) {
      setError('Please provide a valid GitHub, GitLab, or Bitbucket repository URL.');
      return;
    }

    if (!liveLink.startsWith('http://') && !liveLink.startsWith('https://')) {
      setError('Live URL must begin with http:// or https://');
      return;
    }

    if (description.trim().length < 10) {
      setError('Project description must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await submissionApi.create({
        projectName: projectName.trim(),
        repoUrl: repoUrl.trim(),
        liveLink: liveLink.trim(),
        description: description.trim(),
      });

      setSuccessSubmission(res.data);
      setProjectName('');
      setRepoUrl('');
      setLiveLink('');
      setDescription('');

      // Refresh recent list
      fetchRecentSubmissions();
    } catch (err: any) {
      const status = err.status;
      const message = err.message || 'Failed to submit project';

      if (status === 409 || message.toLowerCase().includes('duplicate')) {
        setIsDuplicateError(true);
        setError(message);
      } else if (status === 429 || message.toLowerCase().includes('too many')) {
        setIsRateLimitError(true);
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Project Submission Portal
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Student View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Submit your finished assignment details for mentor evaluation and feedback
          </p>
        </div>

        <Link
          href="/student/submissions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          View All Submissions ({recentSubmissions.length})
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Submission Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2.5 pb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Submit Project Details
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Fields are strictly validated to prevent malformed or duplicate entries
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {successSubmission && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  Submission Received Successfully!
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/90 pl-6">
                  &quot;{successSubmission.projectName}&quot; has been recorded with status{' '}
                  <span className="font-semibold uppercase">Pending</span>. Mentors have been notified for review.
                </p>
              </div>
            )}

            {/* Error / Duplicate Warning Alert */}
            {error && (
              <div
                className={`p-4 rounded-2xl border space-y-1 animate-in fade-in ${
                  isDuplicateError
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                    : isRateLimitError
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-900 text-purple-800 dark:text-purple-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  {isDuplicateError ? (
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>
                    {isDuplicateError
                      ? 'Duplicate Submission Detected'
                      : isRateLimitError
                      ? 'Rate Limit Safeguard'
                      : 'Validation Notice'}
                  </span>
                </div>
                <p className="text-xs pl-6 opacity-90">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Smart Logistics Delivery Tracker"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* GitHub Repo URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Repository URL (GitHub / GitLab) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FolderGit2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Must be public before the assessment deadline.
                </p>
              </div>

              {/* Live Link */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Live Link / Deployment URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={liveLink}
                    onChange={(e) => setLiveLink(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Project Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Project Description & Features <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {description.length}/2000 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the core features, architectural highlights, rendering choices, and how you solved key challenges..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating & Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Project for Review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Submission Guidelines & Live Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instructions card */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 dark:from-indigo-950/20 dark:via-zinc-900/80 dark:to-purple-950/20 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Submission Guidelines
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
              <li>
                <strong>One-Time Submission:</strong> Ensure repository URL and project names are unique. Re-submitting the same repo is blocked.
              </li>
              <li>
                <strong>Rate Limiting:</strong> A basic rate limiter restricts spamming (max 10 submissions per 15 minutes per IP).
              </li>
              <li>
                <strong>Public Access:</strong> Ensure your GitHub repository is public after the deadline so instructors can review your commits.
              </li>
            </ul>
          </div>

          {/* Quick Preview of Student's Submissions */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Your Submissions ({recentSubmissions.length})
              </h3>
              <Link
                href="/student/submissions"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingRecent ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No projects submitted yet. Fill out the form to make your first submission.
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {sub.projectName}
                      </h4>
                      <StatusBadge status={sub.status} />
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-600 flex items-center gap-1 truncate"
                      >
                        <FolderGit2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">Repo</span>
                      </a>
                      <a
                        href={sub.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-600 flex items-center gap-1 truncate"
                      >
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">Live Demo</span>
                      </a>
                    </div>

                    {sub.feedback && (
                      <div className="p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-zinc-700 dark:text-zinc-300">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-0.5">
                          <MessageSquare className="w-3 h-3" /> Mentor Feedback:
                        </span>
                        {sub.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
