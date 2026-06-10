/* ORCA Sonar — interactive demo · App */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "autoTour": true,
  "scanStyle": "sweep",
  "showConfidence": true
}/*EDITMODE-END*/;

const SCAN_MS = 2600;

/* slim top bar with breadcrumb + open-file chip */
function TopBar({ doc, onReset }) {
  return (
    <header style={{ flex: 'none', background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--app-line)', display: 'flex', alignItems: 'center',
      padding: '12px 22px', gap: 12, zIndex: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--app-ink-2)', fontWeight: 500 }}>
        <span>{window.ORCA_SONAR.workspace}</span>
        <Icon name="chevron-right" size={15} color="var(--app-ink-3)" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--app-ink)', fontWeight: 700 }}>
          <Icon name="radar" size={15} color="var(--app-primary)" stroke={2.2} />Sonar
        </span>
      </div>
      <div style={{ flex: 1 }} />
      {doc && (
        <React.Fragment>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 13px', borderRadius: 999,
            background: 'var(--app-surface-sunken)', border: '1px solid var(--app-line)' }}>
            <Icon name="file-text" size={15} color="var(--app-slate-icon)" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--app-ink)', maxWidth: 280,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.file.name}</span>
            <span style={{ fontSize: 11, color: 'var(--app-ink-3)', fontVariantNumeric: 'tabular-nums' }}>{doc.file.size}</span>
          </div>
          <button onClick={onReset} title="Read another document"
            style={{ width: 38, height: 38, borderRadius: 999, flex: 'none', border: '1.5px solid var(--app-line)',
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--app-surface-sunken)'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <Icon name="plus" size={18} color="var(--app-slate-icon)" stroke={2.2} />
          </button>
        </React.Fragment>
      )}
    </header>
  );
}

function App() {
  const S = window.ORCA_SONAR;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [phase, setPhase] = React.useState('idle');     // idle | scan | review
  const [doc, setDoc] = React.useState(null);           // { blocks, file }
  const [extraction, setExtraction] = React.useState(null); // { docType, fields }
  const [scanP, setScanP] = React.useState(0);
  const [revealed, setRevealed] = React.useState(() => new Set());
  const [approved, setApproved] = React.useState(() => new Set());
  const [activeId, setActiveId] = React.useState(null);
  const [filed, setFiled] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [dragging, setDragging] = React.useState(false);

  // demo cursor
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = React.useState(false);
  const [grab, setGrab] = React.useState(false);
  const [label, setLabel] = React.useState('');

  const runToken = React.useRef(0);
  const sweepRaf = React.useRef(0);
  const tourActive = React.useRef(false);
  const tourCancel = React.useRef(null);
  const phaseRef = React.useRef(phase);
  const extractionRef = React.useRef(extraction);
  const cursorRef = React.useRef(cursor);
  phaseRef.current = phase;
  extractionRef.current = extraction;
  cursorRef.current = cursor;

  const fields = extraction ? extraction.fields : [];

  /* ---------- scan animation + reveal ---------- */
  const sweep = (dur) => new Promise(res => {
    cancelAnimationFrame(sweepRaf.current);
    const t0 = performance.now();
    const ease = x => 1 - Math.pow(1 - x, 2);
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      setScanP(ease(k));
      if (k < 1) sweepRaf.current = requestAnimationFrame(step); else res();
    };
    sweepRaf.current = requestAnimationFrame(step);
  });

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const runRead = React.useCallback(async (blocks, fileMeta, getResult) => {
    const token = ++runToken.current;
    cancelAnimationFrame(sweepRaf.current);
    setDoc({ blocks, file: fileMeta });
    setExtraction(null); setRevealed(new Set()); setApproved(new Set());
    setActiveId(null); setFiled(false); setError(null);
    setScanP(0); setPhase('scan');

    sweep(SCAN_MS);                       // visual sweep (not awaited)

    let result;
    try { result = await getResult(); }
    catch (e) {
      if (token !== runToken.current) return;
      setError(e.message || 'Sonar could not read this document.');
      setPhase('review'); setScanP(1);
      return;
    }
    if (token !== runToken.current) return;

    const fs = result.fields.map((f, i) => ({ ...f, id: 'f' + i }));
    setExtraction({ docType: result.docType, fields: fs });

    const stagger = Math.min(440, Math.max(190, 2200 / fs.length));
    for (let i = 0; i < fs.length; i++) {
      if (token !== runToken.current) return;
      setRevealed(prev => { const n = new Set(prev); n.add(fs[i].id); return n; });
      await sleep(stagger);
    }
    if (token !== runToken.current) return;
    await sleep(220);
    cancelAnimationFrame(sweepRaf.current);
    setScanP(1); setPhase('review');
  }, []);

  /* ---------- open handlers ---------- */
  const openSample = React.useCallback((id) => {
    const s = S.samples.find(x => x.id === id);
    if (!s) return;
    runRead(s.blocks, s.file, async () => s.extraction);
  }, [runRead, S]);

  const openFile = React.useCallback(async (file) => {
    setDragging(false);
    // first read the file to blocks (so the doc renders), then extract live
    let parsed;
    try { parsed = await window.SonarExtract.readFile(file); }
    catch (e) {
      setDoc({ blocks: [{ type: 'p', text: 'Could not open this file.' }], file: { name: file.name, size: '', kind: '' } });
      setExtraction(null); setError(e.message); setPhase('review'); setScanP(1);
      return;
    }
    runRead(parsed.blocks, parsed.file, () => window.SonarExtract.extractWithClaude(parsed.plain, parsed.file.name));
  }, [runRead]);

  const reset = React.useCallback(() => {
    runToken.current++;
    cancelAnimationFrame(sweepRaf.current);
    setPhase('idle'); setDoc(null); setExtraction(null); setRevealed(new Set());
    setApproved(new Set()); setActiveId(null); setFiled(false); setError(null); setScanP(0);
  }, []);

  const toggleApprove = id => setApproved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const confirmAll = React.useCallback(() => {
    if (!extractionRef.current) return;
    setApproved(new Set(extractionRef.current.fields.map(f => f.id)));
    setFiled(true);
  }, []);
  const onFieldHover = id => { if (tourActive.current) return; setActiveId(id); };

  /* ---------- user-takeover: stop the tour ---------- */
  const stopTour = React.useCallback(() => {
    if (!tourActive.current) return;
    tourActive.current = false;
    setCursorVisible(false); setGrab(false); setLabel('');
    if (tourCancel.current) tourCancel.current.v = true;
  }, []);

  React.useEffect(() => {
    const born = performance.now();
    const onMove = e => { if (performance.now() - born < 850) return; if (e.movementX === 0 && e.movementY === 0) return; stopTour(); };
    const onAny = () => stopTour();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onAny, { passive: true });
    window.addEventListener('wheel', onAny, { passive: true });
    window.addEventListener('keydown', onAny);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onAny);
      window.removeEventListener('wheel', onAny);
      window.removeEventListener('keydown', onAny);
    };
  }, [stopTour]);

  /* ---------- the guided tour ---------- */
  React.useEffect(() => {
    if (!t.autoTour) { setCursorVisible(false); return; }
    const cancel = { v: false };
    tourCancel.current = cancel;
    let raf = 0;
    const easo = x => 1 - Math.pow(1 - x, 3);
    const rectC = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const tween = (dur, fn) => new Promise(res => {
      const t0 = performance.now();
      const step = now => { if (cancel.v) return res(); const k = Math.min(1, (now - t0) / dur); fn(easo(k)); if (k < 1) raf = requestAnimationFrame(step); else res(); };
      raf = requestAnimationFrame(step);
    });
    const move = async (target, dur) => { if (!target) return; const from = { ...cursorRef.current }; await tween(dur, e => setCursor({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e })); };
    const waitPhase = async (want, timeout) => { const t0 = performance.now(); while (!cancel.v && phaseRef.current !== want && performance.now() - t0 < timeout) await sleep(120); };

    const run = async () => {
      tourActive.current = true;
      setCursorVisible(true);
      setCursor({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.46 });
      await sleep(750); if (cancel.v) return;

      setLabel('Sonar reads any legal document');
      await move(rectC('[data-sample-id="spa"]'), 950); if (cancel.v) return;
      setGrab(true); await sleep(420); if (cancel.v) return;
      openSample('spa'); setGrab(false);
      setLabel('Scanning — extracting the data…');
      await sleep(400); if (cancel.v) return;
      await waitPhase('review', 7000); if (cancel.v) return;
      await sleep(550); if (cancel.v) return;

      setLabel('Every value is linked to its source');
      await move(rectC('[data-field-id="f1"]'), 820); if (cancel.v) return;
      setActiveId('f1'); await sleep(1650); if (cancel.v) return;
      await move(rectC('[data-field-id="f4"]'), 720); if (cancel.v) return;
      setActiveId('f4'); await sleep(1650); if (cancel.v) return;
      setActiveId(null); await sleep(250); if (cancel.v) return;

      setLabel('You just check — then file it away');
      await move(rectC('[data-tour="confirm"]'), 900); if (cancel.v) return;
      setGrab(true); await sleep(420); if (cancel.v) return;
      confirmAll(); setGrab(false);
      await sleep(1100); if (cancel.v) return;
      setLabel(''); 
      await sleep(400);
      tourActive.current = false;
      setCursorVisible(false);
    };
    const startT = setTimeout(run, 600);
    return () => { cancel.v = true; clearTimeout(startT); cancelAnimationFrame(raf); };
  }, [t.autoTour, openSample, confirmAll]);

  const scanState = phase === 'scan' ? 'scanning' : (phase === 'idle' ? 'idle' : 'done');

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: '#fff' }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <TopBar doc={doc} onReset={reset} />

        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {phase === 'idle'
            ? <DropZone samples={S.samples} dragging={dragging} onFile={openFile} onSample={openSample} onDragState={setDragging} />
            : <DocViewer doc={doc} fields={fields} revealedIds={revealed} activeId={activeId}
                scanState={scanState} scanP={scanP} scanStyle={t.scanStyle} />}

          {phase !== 'idle' && (
            <ReviewPanel docType={extraction ? extraction.docType : ''} fields={fields}
              revealedIds={revealed} approvedIds={approved} activeId={activeId} scanState={scanState}
              showConfidence={t.showConfidence !== false} error={error} filed={filed}
              onHover={onFieldHover} onToggle={toggleApprove} onConfirm={confirmAll} onReset={reset} />
          )}
        </div>
      </div>

      <DemoCursor pos={cursor} visible={cursorVisible} grab={grab} label={label} />

      <TweaksPanel>
        <TweakSection label="Scan animation" />
        <TweakRadio label="Style" value={t.scanStyle} options={['sweep', 'ping', 'inline-tag']}
          onChange={v => setTweak('scanStyle', v)} />
        <TweakSection label="Extracted fields" />
        <TweakToggle label="Show confidence scores" value={t.showConfidence !== false}
          onChange={v => setTweak('showConfidence', v)} />
        <TweakSection label="Guided tour" />
        <TweakToggle label="Auto-demo on load" value={t.autoTour}
          onChange={v => setTweak('autoTour', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
