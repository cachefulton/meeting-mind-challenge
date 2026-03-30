import type { AnalysisStatus } from '@meeting-mind/shared';

export function statusLabel(
  status: AnalysisStatus,
  variant: 'short' | 'long' = 'short',
): string {
  switch (status) {
    case 'completed':
      return variant === 'long' ? 'Analysis complete' : 'Complete';
    case 'failed':
      return variant === 'long' ? 'Analysis failed' : 'Failed';
    default:
      return variant === 'long' ? 'Analyzing\u2026' : 'Pending';
  }
}

export function statusClass(status: AnalysisStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-600/20';
    case 'failed':
      return 'bg-red-50 text-red-800 ring-red-600/20';
    default:
      return 'bg-amber-50 text-amber-800 ring-amber-600/20';
  }
}
