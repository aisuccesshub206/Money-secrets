import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthPages: React.FC = () => {
  const { login, requestPasswordReset, resetPasswordWithCode } = useApp();
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');

  // Form states
  const [email, setEmail] = useState('owner@xirfadonet.com');
  const [password, setPassword] = useState('1234');
  const [resetCode, setResetCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = login(email, password);
    if (!ok) {
      setError('Invalid owner credentials. Try email: owner@xirfadonet.com, PIN: 1234');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = requestPasswordReset(email);
    setSuccessMsg(res.message);
    if (res.tempCode) setResetCode(res.tempCode);
    setTimeout(() => {
      setView('reset');
    }, 1200);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    const ok = resetPasswordWithCode(resetCode, newPin);
    if (ok) {
      setSuccessMsg('PIN successfully updated! Redirecting to dashboard...');
    } else {
      setError('Invalid reset verification code. Use code: XIRFADO-789');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-slate-950 font-black shadow-xl shadow-emerald-950/60 font-mono text-2xl">
            XN
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">XirfadoNet</h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mt-1">
            Private Owner & Admin Portal
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            Confidential financial control center. Unauthorized access strictly prohibited.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@xirfadonet.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Security PIN / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setView('forgot');
                    }}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Forgot PIN?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security PIN"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-[0.98] transition-all"
              >
                Access Owner Dashboard
              </button>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300 mb-0.5">Quick Demo Access:</p>
                <p>Email: <span className="font-mono text-emerald-400">owner@xirfadonet.com</span></p>
                <p>PIN: <span className="font-mono text-emerald-400">1234</span></p>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your owner email address. A recovery code will be dispatched to verify your identity.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all"
              >
                Send Recovery Code
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your verification code and set a new security PIN.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="XIRFADO-789"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Security PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="e.g. 5678"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all"
              >
                Set PIN & Enter Dashboard
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Security watermark */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
          <span>Encrypted Session • Owner Only</span>
        </div>
      </div>
    </div>
  );
};
