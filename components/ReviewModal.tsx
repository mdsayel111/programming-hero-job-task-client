'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FolderGit2,
  Globe,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { type Submission } from '@/lib/api';

interface ReviewModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Submission) => void;
  onSubmitReview: (
    id: number,
    data: { status: 'APPROVED' | 'REJECTED'; feedback?: string }
  ) => Promise<{ success: boolean; data: Submission; message?: string }>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  submission,
  isOpen,
  onClose,
  onSubmitReview,
  onSuccess,
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !submission) return null;

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    try {
      setLoadingAction(status);
      setError(null);
      const res = await onSubmitReview(submission.id, {
        status,
        feedback: feedback.trim() ? feedback.trim() : undefined,
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update submission status');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Review Submission
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Submitted by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{submission.student?.name || 'Student'}</span> ({submission.student?.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Project Name
              </label>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {submission.projectName}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderGit2 className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="truncate">GitHub Repository</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 shrink-0" />
              </a>

              <a
                href={submission.liveLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">Live Deployment</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 shrink-0" />
              </a>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Project Description
              </label>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {submission.description}
              </p>
            </div>
          </div>

          {/* Feedback Form */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Mentor Feedback / Evaluation Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback, praise good coding practices, or state reasons if rejection is needed..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleAction('REJECTED')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 rounded-xl transition-colors disabled:opacity-50"
            >
              {loadingAction === 'REJECTED' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject Submission
            </button>

            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleAction('APPROVED')}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loadingAction === 'APPROVED' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
