import React from 'react';
import { getEventStatus, STATUS_CONFIG } from '../utils/status.js';

/**
 * WCAG AA accessible Status Badge component
 * Uses text + icon, never color alone; contrast >= 4.5:1
 */
export default function StatusBadge({
  status: explicitStatus,
  event,
  referenceDate = new Date(),
  size = 'md',
  className = '',
}) {
  const status = explicitStatus || (event ? getEventStatus(event, referenceDate) : 'Upcoming');
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Upcoming;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${cfg.badgeClass} ${sizeClasses} ${className}`}
      role="status"
      aria-label={cfg.ariaLabel}
    >
      <span aria-hidden="true" className="select-none">
        {cfg.icon}
      </span>
      <span className="font-semibold">{cfg.label}</span>
    </span>
  );
}
