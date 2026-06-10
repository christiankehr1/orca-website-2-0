/* ORCA Sonar demo — idle drop state */
function DropZone({ samples, dragging, onFile, onSample, onDragState }) {
  const inputRef = React.useRef(null);

  const handleDrop = e => {
    e.preventDefault(); onDragState(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 32px',
      background: '#fbfcfd', backgroundImage: 'radial-gradient(circle, #e6ebf1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      onDragOver={e => { e.preventDefault(); onDragState(true); }}
      onDragLeave={e => { if (e.currentTarget === e.target) onDragState(false); }}
      onDrop={handleDrop}>

      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* drop card */}
        <div onClick={() => inputRef.current && inputRef.current.click()}
          style={{ position: 'relative', borderRadius: 20, padding: '52px 36px 46px', cursor: 'pointer',
            background: dragging ? 'rgba(0,192,233,.06)' : '#fff',
            border: '2px dashed ' + (dragging ? 'var(--accent-cyan)' : 'var(--app-line-strong)'),
            boxShadow: dragging ? '0 16px 50px rgba(0,192,233,.18)' : 'var(--shadow-node)',
            transition: 'background .18s, border-color .18s, box-shadow .18s', overflow: 'hidden' }}>

          {/* radar emblem */}
          <div style={{ position: 'relative', width: 92, height: 92, margin: '0 auto 26px',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ position: 'absolute', width: 56, height: 56, borderRadius: '50%',
                border: '2px solid rgba(0,192,233,.4)', animation: `sonarPing 2.6s var(--ease-serene) ${i * 0.85}s infinite` }} />
            ))}
            <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 18,
              background: 'var(--orca-gradient-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 26px rgba(38,51,63,.28)' }}>
              <Icon name="radar" size={32} color="#fff" stroke={2} />
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 800, color: 'var(--app-ink)',
            margin: '0 0 12px', letterSpacing: '-.01em', lineHeight: 1.15 }}>
            {dragging ? 'Drop it — Sonar will read it' : 'Drop a document. Sonar reads it.'}
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--app-ink-2)', fontWeight: 400,
            margin: '0 auto', maxWidth: 400 }}>
            Sonar automatically extracts entity data from legal documents, spreadsheets and sketches — so you don&rsquo;t have to.
          </p>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Button variant="app" icon="upload">Browse files</Button>
          </div>

          <div style={{ marginTop: 18, fontSize: 11.5, color: 'var(--app-ink-3)', letterSpacing: '.01em' }}>
            Word · PDF · Excel · CSV · text — processed privately in your browser
          </div>

          <input ref={inputRef} type="file" accept=".docx,.pdf,.xlsx,.xls,.csv,.txt,.md" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files && e.target.files[0]; if (f) onFile(f); e.target.value = ''; }} />
        </div>

        {/* samples */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'var(--app-ink-3)', marginBottom: 12 }}>Or read a sample document</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {samples.map(s => (
              <button key={s.id} data-sample-id={s.id} onClick={() => onSample(s.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 15px 10px 11px',
                  borderRadius: 999, border: '1.5px solid var(--app-line)', background: '#fff', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--app-ink)',
                  transition: 'border-color .14s, box-shadow .14s, transform .12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,192,233,.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--app-line)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: '#eef1f8', flex: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={15} color="var(--app-slate-icon)" stroke={2} />
                </span>
                {s.chipLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.DropZone = DropZone;
