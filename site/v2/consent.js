/* ============================================================
   ORCA v2 — GDPR cookie consent
   - No non-essential scripts run before consent.
   - Accept, reject and custom choices are all stored for 90 days
     (GDPR: a rejection must be respected, not re-prompted).
   - Re-open anytime via [data-consent-open] or OrcaConsent.open().
   - Gate scripts with: <script type="text/plain" data-consent="analytics" data-src="…">
   ============================================================ */
(() => {
  'use strict';

  const STORAGE_KEY = 'orca-consent';
  const POLICY_VERSION = 1;          // bump to re-prompt everyone after a policy change
  const TTL_DAYS = 90;
  const POLICY_URL = 'https://support.withorca.com/security--privacy/aZYfzuthvijeBDSZN7kfdA/privacy-policy/j9QehpwAwAHX2J6H6P2qBM';

  const CATEGORIES = [
    { key: 'necessary',   name: 'Necessary',   desc: 'Enables security and basic functionality. Always on.', locked: true },
    { key: 'preferences', name: 'Preferences', desc: 'Enables personalized content and settings.' },
    { key: 'analytics',   name: 'Analytics',   desc: 'Enables tracking of performance.' },
    { key: 'marketing',   name: 'Marketing',   desc: 'Enables ads personalization and tracking.' },
  ];

  /* ---------------- storage ---------------- */
  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (c.version !== POLICY_VERSION) return null;
      if (Date.now() - c.timestamp > TTL_DAYS * 864e5) return null;
      return c;
    } catch { return null; }
  }

  function saveConsent(categories) {
    const record = {
      version: POLICY_VERSION,
      timestamp: Date.now(),
      categories: { necessary: true, ...categories },
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch { /* private mode */ }
    applyConsent(record);
    return record;
  }

  /* ---------------- applying consent ---------------- */
  function applyConsent(record) {
    // Activate gated scripts: <script type="text/plain" data-consent="analytics" data-src="…">
    document.querySelectorAll('script[data-consent]').forEach((s) => {
      if (s.dataset.consentDone || !record.categories[s.dataset.consent]) return;
      s.dataset.consentDone = '1';
      const live = document.createElement('script');
      for (const a of s.attributes) {
        if (a.name === 'type' || a.name === 'data-consent' || a.name === 'data-src') continue;
        live.setAttribute(a.name, a.value);
      }
      if (s.dataset.src) live.src = s.dataset.src;
      else live.text = s.text;
      s.parentNode.insertBefore(live, s.nextSibling);
    });
    document.dispatchEvent(new CustomEvent('orca:consent', { detail: { ...record.categories } }));
  }

  /* ---------------- banner ---------------- */
  let banner = null;

  const INTRO_HTML = `
    <h2 class="cc__title" id="ccTitle">Privacy Policy</h2>
    <p class="cc__text">We use cookies to enhance your experience, analyze site traffic and deliver
      personalized content. Read our <a href="${POLICY_URL}" target="_blank" rel="noopener">Privacy Policy</a>.
      You can change or withdraw your choice anytime via “Cookie settings” in the footer.</p>
    <div class="cc__actions">
      <button type="button" class="cc__btn cc__btn--reject" data-cc="reject">Reject all</button>
      <button type="button" class="cc__btn" data-cc="customize">Customize</button>
      <button type="button" class="cc__btn cc__btn--accept" data-cc="accept">Accept all</button>
    </div>`;

  function customizeHTML(current) {
    const rows = CATEGORIES.map((c) => {
      const on = c.locked || !!(current && current.categories[c.key]);
      return `
      <div class="cc__cat">
        <span class="cc__cat-name">${c.name}</span>
        <label class="cc__switch">
          <input type="checkbox" data-cat="${c.key}" ${on ? 'checked' : ''} ${c.locked ? 'disabled' : ''}
            aria-label="${c.name} cookies" />
          <span class="cc__track"></span>
        </label>
        <span class="cc__cat-desc">${c.desc}</span>
      </div>`;
    }).join('');
    return `
    <h2 class="cc__title" id="ccTitle">Privacy Policy</h2>
    <p class="cc__text">We use cookies to enhance your experience, analyze site traffic and deliver
      personalized content. Read our <a href="${POLICY_URL}" target="_blank" rel="noopener">Privacy Policy</a>.</p>
    <div class="cc__cats">${rows}</div>
    <div class="cc__actions">
      <button type="button" class="cc__btn cc__btn--accept" data-cc="save">Save preferences</button>
    </div>`;
  }

  function openBanner(view) {
    if (banner) { banner.remove(); banner = null; }
    banner = document.createElement('div');
    banner.className = 'cc';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'ccTitle');
    banner.tabIndex = -1;
    banner.innerHTML = view === 'customize' ? customizeHTML(readConsent()) : INTRO_HTML;
    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('is-visible')));

    banner.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cc]');
      if (!btn) return;
      const action = btn.dataset.cc;
      if (action === 'customize') {
        banner.innerHTML = customizeHTML(readConsent());
        return;
      }
      if (action === 'accept') {
        saveConsent({ preferences: true, analytics: true, marketing: true });
      } else if (action === 'reject') {
        saveConsent({ preferences: false, analytics: false, marketing: false });
      } else if (action === 'save') {
        const chosen = {};
        banner.querySelectorAll('input[data-cat]').forEach((i) => { chosen[i.dataset.cat] = i.checked; });
        saveConsent(chosen);
      }
      closeBanner();
    });
  }

  function closeBanner() {
    if (!banner) return;
    const el = banner;
    banner = null;
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 450);
  }

  /* ---------------- public API ---------------- */
  window.OrcaConsent = {
    open: () => openBanner('customize'),
    get: () => { const c = readConsent(); return c ? { ...c.categories } : null; },
    has: (cat) => { const c = readConsent(); return !!(c && c.categories[cat]); },
  };

  /* ---------------- boot ---------------- */
  function init() {
    document.querySelectorAll('[data-consent-open]').forEach((el) =>
      el.addEventListener('click', () => openBanner('customize')));
    const existing = readConsent();
    if (existing) applyConsent(existing);
    else openBanner('intro');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
