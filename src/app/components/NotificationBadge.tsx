import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <Bell className="w-5 h-5 text-white" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}
