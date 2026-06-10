/* ORCA Sonar — 30-second guided walkthrough video.
   A deterministic "director": every visible thing is a pure function of the
   Stage playhead (window.useTime), so it scrubs cleanly and stays in sync with
   an optional narration track (narration.mp3). Reuses the real demo components
   (Sidebar, DocViewer, ReviewPanel, DropZone) driven by time instead of clicks. */

const { Stage, useTimeline, interpolate, Easing, clamp } = window;
const { Sidebar, DropZone, DocViewer, ReviewPanel, ChromeTabBar, ChromeToolbar } = window;
const S = window.ORCA_SONAR;

/* ---------- canvas + window geometry (1920×1080 stage) ---------- */
const CANVAS_W = 1920, CANVAS_H = 1080;
const WIN_W = 1740, WIN_H = 1000, WIN_LEFT = 90, WIN_TOP = 40;
const CHROME_H = 84;                         // tab bar (44) + toolbar (40)
const CONTENT_W = WIN_W, CONTENT_H = WIN_H - CHROME_H;

/* ---------- the document we walk through ---------- */
const SPA = S.samples.find(s => s.id === 'spa');
const DOC = { blocks: SPA.blocks, file: SPA.file };
const FIELDS = SPA.extraction.fields.map((f, i) => ({ ...f, id: 'f' + i }));
const DOC_TYPE = SPA.extraction.docType;
const ALL_IDS = FIELDS.map(f => f.id);

/* ---------- key timings (seconds) ---------- */
// timings aligned to the narration track (29.15s; pauses detected per sentence)
const T_DROP = 8.5;            // doc lands as the sample list finishes ("…a register.")
const T_SCAN_START = 8.6;
const T_SCAN_END = 11.3;       // sweep complete → review (over "Sonar reads it in seconds")
const T_FILE = 23.4;           // confirm clicked → filed ("One click…")
const REV = [9.9, 10.4, 10.9, 11.4, 11.9, 12.4, 12.9, 13.4];   // reveal over "…entity, date, owner and value"

/* ---------- camera (subtle Screen-Studio push/pan) ---------- */
const scaleFn = interpolate(
  [0, 14, 14.7, 20, 22.3, 23.4, 25.8, 26.6, 29.2],
  [1.0, 1.0, 1.10, 1.10, 1.11, 1.13, 1.11, 1.02, 1.02],
  Easing.easeInOutSine);
const oxFn = interpolate(
  [0, 14, 14.7, 20, 22.3, 23.4, 25.8, 26.6, 29.2],
  [0.5, 0.5, 0.46, 0.52, 0.74, 0.78, 0.78, 0.5, 0.5],
  Easing.easeInOutSine);
const oyFn = interpolate(
  [0, 14, 14.7, 22.3, 23.4, 25.8, 26.6, 29.2],
  [0.5, 0.5, 0.45, 0.5, 0.72, 0.66, 0.5, 0.5],
  Easing.easeInOutSine);

/* ---------- captions (synced to the narration script) ---------- */
const CAPS = [
  { a: 0.4,  b: 3.5,  text: "This is Sonar — ORCA’s AI document reader." },
  { a: 3.95, b: 8.45, text: "Drop in any legal document — a share purchase agreement, a trust deed, a share register." },
  { a: 8.6,  b: 9.85, text: "Sonar reads it in seconds." },
  { a: 10.0, b: 14.4, text: "Pulling out every entity, date, owner and value." },
  { a: 14.7, b: 19.7, text: "Each one linked back to the exact words in the source." },
  { a: 20.3, b: 22.75, text: "You don’t type anymore. You just check." },
  { a: 23.2, b: 26.3, text: "One click files it all to Smart Folders." },
];

/* ---------- cursor waypoints ---------- */
const SEL_SPA = '[data-sample-id="spa"]';
const SEL_TRUST = '[data-sample-id="trust"]';
const SEL_REGISTER = '[data-sample-id="register"]';
const SEL_CONFIRM = '[data-tour="confirm"]';
const CURSOR = [
  { t: 0.4,  x: 1000, y: 560, show: 0, grab: 0 },
  { t: 1.0,  x: 1000, y: 560, show: 1, grab: 0 },
  { t: 3.0,  x: 1080, y: 480, show: 1, grab: 0 },
  { t: 4.7,  sel: SEL_SPA, show: 1, grab: 0 },       // "a share purchase agreement"
  { t: 6.1,  sel: SEL_TRUST, show: 1, grab: 0 },     // "a trust deed"
  { t: 7.35, sel: SEL_REGISTER, show: 1, grab: 0 },  // "a share register"
  { t: 8.0,  sel: SEL_SPA, show: 1, grab: 0 },       // back to the SPA to read it
  { t: 8.35, sel: SEL_SPA, show: 1, grab: 1 },
  { t: 8.6,  sel: SEL_SPA, show: 1, grab: 1 },
  { t: 9.2,  sel: SEL_SPA, show: 0, grab: 0 },
  { t: 19.9, sel: '[data-field-id="f2"]', show: 0, grab: 0 },
  { t: 20.5, sel: '[data-field-id="f2"]', show: 1, grab: 0 },
  { t: 21.5, sel: '[data-field-id="f0"]', show: 1, grab: 0 },
  { t: 22.4, sel: SEL_CONFIRM, show: 1, grab: 0 },
  { t: 23.1, sel: SEL_CONFIRM, show: 1, grab: 1 },
  { t: 23.4, sel: SEL_CONFIRM, show: 1, grab: 1 },
  { t: 24.6, sel: SEL_CONFIRM, show: 1, grab: 0 },
  { t: 25.8, x: 1320, y: 850, show: 0, grab: 0 },
];
const cursorShowFn = interpolate(CURSOR.map(w => w.t), CURSOR.map(w => w.show), Easing.easeInOutSine);
const cursorGrabFn = interpolate(CURSOR.map(w => w.t), CURSOR.map(w => w.grab), Easing.linear);

/* ===================================================================
   Memoized wrappers — keep the heavy app subtree from re-rendering 60fps.
   Props only change at discrete moments, so React.memo skips most frames.
   =================================================================== */
const MSidebar = React.memo(Sidebar);
const MDropZone = React.memo(DropZone);
const MDocViewer = React.memo(DocViewer);
const MReviewPanel = React.memo(ReviewPanel);

const TopBar = React.memo(function TopBar({ doc }) {
  return (
    <header style={{ flex: 'none', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--app-line)', display: 'flex', alignItems: 'center',
      padding: '13px 24px', gap: 12, zIndex: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--app-ink-2)', fontWeight: 500 }}>
        <span>{S.workspace}</span>
        <window.Icon name="chevron-right" size={16} color="var(--app-ink-3)" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--app-ink)', fontWeight: 700 }}>
          <window.Icon name="radar" size={16} color="var(--app-primary)" stroke={2.2} />Sonar
        </span>
      </div>
      <div style={{ flex: 1 }} />
      {doc && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999,
          background: 'var(--app-surface-sunken)', border: '1px solid var(--app-line)' }}>
          <window.Icon name="file-text" size={16} color="var(--app-slate-icon)" />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--app-ink)' }}>{doc.file.name}</span>
          <span style={{ fontSize: 12, color: 'var(--app-ink-3)', fontVariantNumeric: 'tabular-nums' }}>{doc.file.size}</span>
        </div>
      )}
    </header>
  );
});

/* The full app at content size, state passed in (no internal timers). */
const AppRoot = React.memo(function AppRoot({ phase, revealedIds, approvedIds, activeId, scanP, filed }) {
  const noop = AppRoot.noop || (AppRoot.noop = () => {});
  const scanState = phase === 'scan' ? 'scanning' : (phase === 'idle' ? 'idle' : 'done');
  const fields = phase === 'idle' ? [] : FIELDS;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', background: '#fff' }}>
      <MSidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <TopBar doc={phase === 'idle' ? null : DOC} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {phase === 'idle'
            ? <MDropZone samples={S.samples} dragging={false} onFile={noop} onSample={noop} onDragState={noop} />
            : <MDocViewer doc={DOC} fields={fields} revealedIds={revealedIds} activeId={activeId}
                scanState={scanState} scanP={scanP} scanStyle="sweep" />}
          {phase !== 'idle' && (
            <MReviewPanel docType={DOC_TYPE} fields={fields} revealedIds={revealedIds} approvedIds={approvedIds}
              activeId={activeId} scanState={scanState} showConfidence={true} error={null} filed={filed}
              onHover={noop} onToggle={noop} onConfirm={noop} onReset={noop} />
          )}
        </div>
      </div>
    </div>
  );
});

/* ---------- cursor ---------- */
function Cursor({ x, y, opacity, grab }) {
  if (opacity <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity, zIndex: 50, pointerEvents: 'none',
      transform: 'translate(-3px,-2px)', willChange: 'left, top, opacity' }}>
      {grab > 0.02 && (
        <div style={{ position: 'absolute', left: 2, top: 2, width: 54, height: 54, marginLeft: -27, marginTop: -27,
          borderRadius: 999, border: '3px solid rgba(0,192,233,.7)',
          transform: `scale(${0.5 + grab * 1.0})`, opacity: 0.9 * (1 - grab) + 0.2 }} />
      )}
      <svg width="40" height="40" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 3px 6px rgba(38,51,63,.45))',
        transform: `scale(${1 - grab * 0.12})`, transformOrigin: '6px 4px' }}>
        <path d="M5 3 L5 18 L9 14 L12 21 L15 19.5 L12 13 L18 13 Z"
          fill="#fff" stroke="#26333f" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ---------- captions ---------- */
function Captions({ t }) {
  const cue = CAPS.find(c => t >= c.a - 0.28 && t <= c.b + 0.28);
  if (!cue) return null;
  const fadeIn = clamp((t - (cue.a - 0.28)) / 0.3, 0, 1);
  const fadeOut = clamp(((cue.b + 0.28) - t) / 0.3, 0, 1);
  const opacity = Math.min(fadeIn, fadeOut);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none' }}>
      <div style={{ maxWidth: 1240, opacity, transform: `translateY(${(1 - Math.min(fadeIn, 1)) * 10}px)`,
        background: 'rgba(12,17,22,.84)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,.08)', color: '#fff', fontFamily: 'var(--font-sans)',
        fontSize: 34, fontWeight: 500, letterSpacing: '-.01em', lineHeight: 1.32, textAlign: 'center',
        padding: '18px 36px', borderRadius: 18, boxShadow: '0 18px 50px rgba(0,0,0,.4)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 13, height: 13, borderRadius: 999, background: 'var(--accent-cyan)', flex: 'none',
          boxShadow: '0 0 14px 2px rgba(0,192,233,.6)' }} />
        <span style={{ textWrap: 'pretty' }}>{cue.text}</span>
      </div>
    </div>
  );
}

/* ---------- end card ---------- */
function EndCard({ t }) {
  const op = clamp((t - 26.45) / 0.85, 0, 1);
  if (op <= 0.001) return null;
  const e = Easing.easeOutCubic(op);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--orca-gradient)',
      opacity: op, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 34, pointerEvents: 'none' }}>
      {/* sonar rings behind the mark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-160px)' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ position: 'absolute', width: 220, height: 220, marginLeft: -110, marginTop: -110,
            borderRadius: '50%', border: '1.5px solid rgba(0,192,233,.22)',
            animation: `sonarPing 3.4s var(--ease-serene) ${i * 1.0}s infinite` }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, transform: `translateY(${(1 - e) * 16}px)` }}>
        <img src={(window.ORCA_LOGOS && window.ORCA_LOGOS.white) || 'assets/orca-symbol-white.png'} alt=""
          style={{ height: 92, width: 'auto', transform: 'translateY(-3px)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 84,
          letterSpacing: '.30em', paddingLeft: '.34em', color: '#fff' }}>RCA</span>
      </div>
      <div style={{ width: 64, height: 1, background: 'rgba(255,255,255,.28)', transform: `scaleX(${e})` }} />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 46, color: '#fff',
        letterSpacing: '-.01em', transform: `translateY(${(1 - e) * 14}px)`, opacity: clamp((t - 26.95) / 0.7, 0, 1) }}>
        Less admin. More business.
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 600, letterSpacing: '.22em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', opacity: clamp((t - 28.0) / 0.7, 0, 1) }}>
        withorca.com
      </div>
    </div>
  );
}

/* ---------- narration audio sync ---------- */
function AudioSync() {
  const { time, playing } = useTimeline();
  React.useEffect(() => {
    const a = window.__narration;
    if (!a || a.__missing || !window.__audioUnlocked) return;
    if (Math.abs(a.currentTime - time) > 0.32) { try { a.currentTime = time; } catch (e) {} }
    if (playing && a.paused) a.play().catch(() => {});
    if (!playing && !a.paused) a.pause();
  });
  return null;
}

/* ===================================================================
   The scene — recomputes derived state from the playhead each frame.
   =================================================================== */
function SonarScene() {
  const tl = useTimeline();
  const { time } = tl;
  const t = time;
  React.useEffect(() => { window.__stage = { setTime: tl.setTime, setPlaying: tl.setPlaying }; }, [tl.setTime, tl.setPlaying]);
  const sceneRef = React.useRef(null);
  const lastGood = React.useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2 });

  /* ----- discrete derived state (memoized so AppRoot skips frames) ----- */
  const phase = t < T_DROP ? 'idle' : (t < T_SCAN_END ? 'scan' : 'review');
  const revealedCount = REV.filter(x => t >= x).length;
  const filed = t >= T_FILE;

  const activeId =
    (t >= 14.9 && t < 16.6) ? 'f1' :
    (t >= 16.6 && t < 18.3) ? 'f6' :
    (t >= 18.3 && t < 19.7) ? 'f4' :
    (t >= 20.4 && t < 21.5) ? 'f2' :
    (t >= 21.5 && t < 22.7) ? 'f0' : null;

  const revealedIds = React.useMemo(
    () => new Set(FIELDS.slice(0, revealedCount).map(f => f.id)), [revealedCount]);
  const approvedIds = React.useMemo(
    () => filed ? new Set(ALL_IDS) : EMPTY_SET, [filed]);

  let scanP = 0;
  if (t >= T_SCAN_END) scanP = 1;
  else if (t > T_SCAN_START) scanP = Easing.easeOutQuad(clamp((t - T_SCAN_START) / (T_SCAN_END - T_SCAN_START), 0, 1));

  /* ----- camera ----- */
  const camScale = scaleFn(t);
  const camOX = oxFn(t) * CONTENT_W;
  const camOY = oyFn(t) * CONTENT_H;

  /* ----- cursor position (resolve selectors → canvas-local coords) ----- */
  const resolve = (wp) => {
    if (wp.sel && sceneRef.current) {
      const el = sceneRef.current.querySelector(wp.sel);
      if (el) {
        const r = el.getBoundingClientRect();
        const rr = sceneRef.current.getBoundingClientRect();
        const sc = rr.width / CANVAS_W || 1;
        const p = { x: (r.left + r.width / 2 - rr.left) / sc, y: (r.top + r.height / 2 - rr.top) / sc };
        lastGood.current = p;
        return p;
      }
      return lastGood.current;
    }
    return { x: wp.x, y: wp.y };
  };
  let cursorPos = lastGood.current;
  if (t <= CURSOR[0].t) cursorPos = resolve(CURSOR[0]);
  else if (t >= CURSOR[CURSOR.length - 1].t) cursorPos = resolve(CURSOR[CURSOR.length - 1]);
  else {
    for (let i = 0; i < CURSOR.length - 1; i++) {
      if (t >= CURSOR[i].t && t < CURSOR[i + 1].t) {
        const a = CURSOR[i], b = CURSOR[i + 1];
        const p = Easing.easeInOutCubic(clamp((t - a.t) / (b.t - a.t), 0, 1));
        const pa = resolve(a), pb = resolve(b);
        cursorPos = { x: pa.x + (pb.x - pa.x) * p, y: pa.y + (pb.y - pa.y) * p };
        break;
      }
    }
  }
  const cursorOpacity = clamp(cursorShowFn(t), 0, 1);
  const cursorGrab = clamp(cursorGrabFn(t), 0, 1);

  /* keep a comment anchor on the timestamp for review */
  const label = Math.floor(t) + 's';

  return (
    <div ref={sceneRef} data-screen-label={label}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* backdrop */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(125% 120% at 50% -10%, #31424f 0%, #1a232c 46%, #0a0e12 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.45) 100%)' }} />

      {/* browser window */}
      <div style={{ position: 'absolute', left: WIN_LEFT, top: WIN_TOP, width: WIN_W, height: WIN_H,
        borderRadius: 14, overflow: 'hidden', background: '#35363a',
        boxShadow: '0 50px 130px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.25)',
        display: 'flex', flexDirection: 'column' }}>
        <ChromeTabBar tabs={[{ title: 'ORCA — Sonar' }]} activeIndex={0} />
        <ChromeToolbar url="app.withorca.com/sonar" />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#fff' }}>
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${camScale})`,
            transformOrigin: `${camOX}px ${camOY}px`, willChange: 'transform' }}>
            <AppRoot phase={phase} revealedIds={revealedIds} approvedIds={approvedIds}
              activeId={activeId} scanP={scanP} filed={filed} />
          </div>
        </div>
      </div>

      {/* intro fade from black */}
      {t < 0.7 && <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: clamp(1 - t / 0.7, 0, 1), zIndex: 70 }} />}

      <Cursor x={cursorPos.x} y={cursorPos.y} opacity={cursorOpacity} grab={cursorGrab} />
      <Captions t={t} />
      <EndCard t={t} />
      <AudioSync />
    </div>
  );
}

const EMPTY_SET = new Set();

ReactDOM.createRoot(document.getElementById('root')).render(
  <Stage width={CANVAS_W} height={CANVAS_H} duration={29.2} background="#0a0e12"
    persistKey="orca-sonar-video" loop={true} autoplay={true}>
    <SonarScene />
  </Stage>
);
