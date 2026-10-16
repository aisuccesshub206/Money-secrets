import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  Database,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Shield,
  Key,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    db,
    updateSettings,
    loadSampleDemo,
    resetToClean,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useApp();

  const [currency, setCurrency] = useState(db.settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(db.settings.currencySymbol);
  const [dailyLimit, setDailyLimit] = useState(db.settings.dailySpendingLimit.toString());
  const [weeklyLimit, setWeeklyLimit] = useState(db.settings.weeklySpendingLimit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(db.settings.monthlySpendingLimit.toString());
  const [defaultMentorshipPrice, setDefaultMentorshipPrice] = useState(db.settings.defaultMentorshipPrice.toString());
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(db.settings.monthlyIncomeGoal.toString());
  const [ownerName, setOwnerName] = useState(db.settings.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(db.settings.ownerEmail);
  const [securityPin, setSecurityPin] = useState(db.settings.securityPin || '1234');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
    { code: 'EUR', symbol: '€', name: 'Euro (€)' },
    { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
    { code: 'SOS', symbol: 'Sh.So.', name: 'Somali Shilling (Sh.So.)' },
    { code: 'KES', symbol: 'Ksh', name: 'Kenyan Shilling (Ksh)' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  ];

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    const found = currencies.find(c => c.code === code);
    if (found) setCurrencySymbol(found.symbol);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      currency,
      currencySymbol,
      dailySpendingLimit: parseFloat(dailyLimit) || 0,
      weeklySpendingLimit: parseFloat(weeklyLimit) || 0,
      monthlySpendingLimit: parseFloat(monthlyLimit) || 0,
      defaultMentorshipPrice: parseFloat(defaultMentorshipPrice) || 100,
      monthlyIncomeGoal: parseFloat(monthlyIncomeGoal) || 1500,
      ownerName: ownerName.trim() || 'Ridwan',
      ownerEmail: ownerEmail.trim() || 'owner@xirfadonet.com',
      securityPin: securityPin.trim() || '1234',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDatabaseJSON(content);
      if (ok) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to import: invalid JSON file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-slate-300" />
          Settings & Database Controls
        </h1>
        <p className="text-xs text-slate-400">
          Customize currency symbols, spending thresholds, mentorship fee defaults, and database backups.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white">General & Financial Preferences</h2>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in fade-in">
              <CheckCircle className="h-4 w-4" /> Preferences Saved!
            </span>
          )}
        </div>

        {/* Currency & Base Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-white"
            />
          </div>
        </div>

        {/* Limits & Defaults */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Mentorship Fee ({currencySymbol})
            </label>
            <input
              type="number"
              value={defaultMentorshipPrice}
              onChange={(e) => setDefaultMentorshipPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monthly Income Target ({currencySymbol})
            </label>
            <input
              type="number"
              value={monthlyIncomeGoal}
              onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Security PIN
            </label>
            <input
              type="password"
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-white"
            />
          </div>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Owner Email
            </label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Demo Data Management */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="h-4 w-4 text-cyan-400" />
          <span>Data Storage, Demo Mode & Backup</span>
        </h2>
        <p className="text-xs text-slate-400">
          Export full JSON snapshots of your dashboard data, restore backups, or reset to realistic sample data anytime.
        </p>

        {importStatus && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-xs text-cyan-300">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportDatabaseJSON}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Load sample starter courses?')) {
                loadSampleDemo();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Load Sample Courses</span>
          </button>

          {/* Reset all to clean $0 state */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset dashboard to clean $0 state (clearing all transactions and data)?')) {
                resetToClean();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>Reset to Clean $0 State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
