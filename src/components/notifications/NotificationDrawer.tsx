import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    db,
    markNotificationRead,
    clearAllNotifications,
    setActiveTab,
  } = useApp();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => setIsNotificationsOpen(false)}
      />

      <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 p-5 shadow-2xl overflow-y-auto z-10 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Notifications & Alerts</h2>
                <p className="text-[11px] text-slate-400">Financial alerts and business events</p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action buttons */}
          {db.notifications.length > 0 && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] text-slate-400">
                {db.notifications.filter(n => !n.read).length} unread
              </span>
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-2.5">
            {db.notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Bell className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-xs">No alerts right now</p>
              </div>
            ) : (
              db.notifications.map((item) => {
                const getIcon = () => {
                  switch (item.type) {
                    case 'warning':
                    case 'alert':
                      return <ShieldAlert className="h-4 w-4 text-amber-400" />;
                    case 'success':
                      return <CheckCircle className="h-4 w-4 text-emerald-400" />;
                    case 'info':
                    default:
                      return <Info className="h-4 w-4 text-cyan-400" />;
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      markNotificationRead(item.id);
                      if (item.targetTab) {
                        setActiveTab(item.targetTab);
                        setIsNotificationsOpen(false);
                      }
                    }}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      item.read
                        ? 'border-slate-800/60 bg-slate-950/40 text-slate-400'
                        : 'border-slate-700 bg-slate-950 text-slate-200 shadow-sm'
                    } hover:border-slate-600`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">{getIcon()}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{item.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{item.message}</p>
                        {item.targetTab && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <span>Open {item.targetTab}</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
