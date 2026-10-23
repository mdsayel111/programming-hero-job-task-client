'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { submissionApi, type Submission, type Stats, type Pagination } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { StatsCard } from '@/components/StatsCard';
import { ReviewModal } from '@/components/ReviewModal';
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ExternalLink,
  FolderGit2,
  Globe,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  User,
  MessageSquare,
} from 'lucide-react';

export default function MentorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Server-side filter states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Review modal state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await submissionApi.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getAll({
        page,
        limit,
        status: statusFilter,
        search: debouncedSearch.trim() || undefined,
      });

      setSubmissions(res.data.submissions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'MENTOR' || user.role === 'ADMIN')) {
      fetchStats();
      fetchSubmissions();
    }
  }, [user, fetchSubmissions]);

  // Handle Review modal success
  const handleReviewSuccess = (updated: Submission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    fetchStats();
  };

  const handleOpenReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Access control check for Student trying to view Mentor Dashboard
  if (user && user.role !== 'MENTOR' && user.role !== 'ADMIN') {
    return (
      <div className="flex-1 max-w-lg mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Mentor Access Required
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          You are signed in as a <strong>Student</strong> ({user.email}). The Review Dashboard is restricted to instructors and mentors.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/student/submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
          >
            Go to Submission Portal
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mentor Review Dashboard
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Instructor View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review submitted student projects, evaluate codebase links, and manage approval statuses
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchSubmissions();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Aggregated Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Submissions"
          value={stats.total}
          icon={Layers}
          variant="default"
          description="All student projects submitted"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          variant="pending"
          description="Awaiting mentor review & evaluation"
        />
        <StatsCard
          title="Approved Projects"
          value={stats.approved}
          icon={CheckCircle2}
          variant="approved"
          description="Meets submission guidelines"
        />
        <StatsCard
          title="Rejected Projects"
          value={stats.rejected}
          icon={XCircle}
          variant="rejected"
          description="Needs revision or correction"
        />
      </div>

      {/* Filter and Search Bar (Server Side) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-md backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Filter:
            </span>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab === 'ALL' ? 'All Projects' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Box and Items per page */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search project name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Paginated Data Table */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="py-4 px-6">Project Details</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Links</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      <span className="text-zinc-400">Fetching submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-400 space-y-1">
                    <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                      No submissions found
                    </p>
                    <p className="text-xs">
                      Try adjusting the filter status or clearing the search query.
                    </p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Project Name & Description */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {sub.projectName}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {sub.description}
                      </p>
                      {sub.feedback && (
                        <div className="mt-1.5 p-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-1">
                          <strong className="text-indigo-600 dark:text-indigo-400">Feedback: </strong>
                          {sub.feedback}
                        </div>
                      )}
                    </td>

                    {/* Student */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {sub.student?.name || 'Student'}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {sub.student?.email}
                      </div>
                    </td>

                    {/* Repo & Live Links */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 font-medium transition-colors"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Code Repository</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                        <a
                          href={sub.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Live Site</span>
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                        </a>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={sub.status} />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-zinc-500 whitespace-nowrap">
                      <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-zinc-400">
                        {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Evaluate / Action
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 text-xs text-zinc-500">
          <div>
            Showing{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-zinc-900 dark:text-zinc-100">{pagination.total}</span>{' '}
            submissions
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <span className="px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        submission={selectedSubmission}
        onClose={() => setIsModalOpen(false)}
        onSubmitReview={submissionApi.updateStatus}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
