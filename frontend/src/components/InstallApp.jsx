import { useEffect, useState } from 'react';

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !('MSStream' in window)
  );
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    if (installed) return undefined;

    const onInstallable = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onInstallable);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [installed]);

  if (installed) return null;

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    setShowHelp(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-accent/40 hover:text-accent"
        title="Install ArrivAI on your device"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">Install app</span>
        <span className="sm:hidden">Install</span>
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setShowHelp(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-xl border border-white/10 bg-navy p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="install-help-title"
          >
            <h2 id="install-help-title" className="font-heading text-lg font-semibold text-white">
              Install ArrivAI
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Add ArrivAI to your home screen or desktop for quick access — works like a native app.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {isIOS() ? (
                <li>
                  <strong className="text-accent">iPhone / iPad:</strong> tap{' '}
                  <span className="text-white">Share</span> in Safari, then{' '}
                  <span className="text-white">Add to Home Screen</span>.
                </li>
              ) : (
                <li>
                  <strong className="text-accent">Android:</strong> tap the browser menu (⋮), then{' '}
                  <span className="text-white">Install app</span> or{' '}
                  <span className="text-white">Add to Home screen</span>.
                </li>
              )}
              <li>
                <strong className="text-accent">Windows / Mac:</strong> click the install icon in the
                address bar (⊕ or computer icon), or use browser menu →{' '}
                <span className="text-white">Install ArrivAI</span>.
              </li>
              <li>
                <strong className="text-accent">Chrome / Edge:</strong> menu →{' '}
                <span className="text-white">Install ArrivAI</span> or{' '}
                <span className="text-white">Apps → Install this site as an app</span>.
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-lg bg-accent/20 py-2 text-sm font-medium text-accent hover:bg-accent/30"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
