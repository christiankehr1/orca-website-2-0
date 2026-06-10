/* ORCA Sonar demo — review & approve panel
   Extracted fields surface here one by one as Sonar reads. They arrive
   pre-filled and ready to confirm — the "doer → checker" promise, implicit. */

function ApproveDot({ on, onClick }) {
  return (
    <button onClick={onClick} title={on ? 'Approved' : 'Approve'}
      style={{ width: 26, height: 26, flex: 'none', borderRadius: 999, cursor: 'pointer',
        border: on ? '0' : '1.5px solid var(--app-line-strong)',
        background: on ? 'var(--accent-cyan)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .16s, border-color .16s', padding: 0 }}
      onMouseEnter={e => { if (!on) e.currentTarget.style.borderColor = 'var(--accent-cyan)'; }}
      onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = 'var(--app-line-strong)'; }}>
      <Icon name="check" size={14} stroke={3} color={on ? '#072a33' : 'var(--app-ink-3)'} />
    </button>
  );
}

function FieldCard({ field, approved, active, showConfidence, onHover, onToggle }) {
  return (
    <div data-field-id={field.id}
      onMouseEnter={() => onHover(field.id)} onMouseLeave={() => onHover(null)}
      style={{ display: 'flex', gap: 12, padding: '13px 14px', borderRadius: 12,
        background: active ? 'var(--app-select-soft)' : '#fff',
        border: '1px solid ' + (active ? 'var(--accent-cyan)' : 'var(--app-line)'),
        boxShadow: active ? '0 4px 16px rgba(0,192,233,.14)' : 'var(--shadow-node)',
        cursor: 'default', transition: 'background .16s, border-color .16s, box-shadow .16s' }}>
      <CategoryTile category={field.category} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
            color: 'var(--app-ink-3)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{field.label}</span>
          {showConfidence && <ConfidencePill value={field.confidence} />}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-ink)', lineHeight: 1.3, marginBottom: 6 }}>{field.value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--app-ink-3)' }}>
          <Icon name="quote" size={12} color="var(--app-slate-icon)" />
          <span style={{ fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{field.quote || 'from document'}</span>
        </div>
      </div>
      <ApproveDot on={approved} onClick={() => onToggle(field.id)} />
    </div>
  );
}

function ReviewPanel({ docType, fields, revealedIds, approvedIds, activeId, scanState,
  showConfidence, error, filed, onHover, onToggle, onConfirm, onReset }) {

  const shown = (fields || []).filter(f => revealedIds.has(f.id));
  const total = (fields || []).length;
  const approvedCount = (fields || []).filter(f => approvedIds.has(f.id)).length;
  const scanning = scanState === 'scanning';

  return (
    <aside style={{ width: 396, flex: 'none', borderLeft: '1px solid var(--app-line)', background: '#fafbfc',
      display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* header */}
      <div style={{ padding: '17px 20px 14px', borderBottom: '1px solid var(--app-line)', flex: 'none', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--orca-gradient-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Icon name="radar" size={15} color="#fff" stroke={2.2} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-ink)', fontFamily: 'var(--font-display)' }}>Sonar extraction</div>
          <div style={{ flex: 1 }} />
          {scanning
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 600, color: 'var(--app-ink-2)' }}>reading<Dots /></span>
            : total > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--app-ink-2)', fontVariantNumeric: 'tabular-nums' }}>{shown.length} found</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {docType && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-ink-2)', background: 'var(--app-surface-sunken)',
              border: '1px solid var(--app-line)', borderRadius: 999, padding: '3px 11px' }}>{docType}</span>
          )}
          <span style={{ fontSize: 11.5, color: 'var(--app-ink-3)' }}>Pre-filled · ready to check</span>
        </div>
      </div>

      {/* list */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && (
          <div style={{ padding: '14px 15px', borderRadius: 12, background: 'rgba(233,66,0,.06)',
            border: '1px solid rgba(233,66,0,.25)', color: '#b23500', fontSize: 12.5, lineHeight: 1.5,
            display: 'flex', gap: 9 }}>
            <Icon name="alert-triangle" size={16} color="var(--accent-red)" />
            <span>{error}</span>
          </div>
        )}

        {!error && shown.length === 0 && (
          <div style={{ marginTop: 18, textAlign: 'center', color: 'var(--app-ink-3)' }}>
            <div style={{ display: 'inline-flex', marginBottom: 12, opacity: .8 }}>
              <Icon name="radar" size={30} color="var(--app-slate-icon)" stroke={1.5} />
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>
              {scanning ? 'Listening for entities, dates, ownership and values…' : 'Extracted fields will appear here.'}
            </div>
          </div>
        )}

        {shown.map(f => (
          <FieldCard key={f.id} field={f} approved={approvedIds.has(f.id)} active={activeId === f.id}
            showConfidence={showConfidence} onHover={onHover} onToggle={onToggle} />
        ))}
      </div>

      {/* footer */}
      <div style={{ flex: 'none', borderTop: '1px solid var(--app-line)', padding: '14px 16px', background: '#fff' }}>
        {filed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
              background: 'rgba(0,233,186,.10)', border: '1px solid rgba(0,233,186,.4)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--accent-green)', flex: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={17} stroke={3} color="#063b30" />
              </div>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-ink)' }}>Filed to Smart Folders</div>
                <div style={{ fontSize: 11.5, color: 'var(--app-ink-2)' }}>{approvedCount} entries added · document auto-filed</div>
              </div>
            </div>
            <Button variant="secondary" icon="rotate-ccw" onClick={onReset} style={{ width: '100%', justifyContent: 'center' }}>Read another document</Button>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
              <span style={{ fontSize: 12, color: 'var(--app-ink-2)', fontWeight: 500 }}>
                {approvedCount} of {total || 0} approved
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--app-ink-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon name="shield-check" size={13} color="var(--app-slate-icon)" />encrypted in-browser
              </span>
            </div>
            <div data-tour="confirm">
              <Button variant="cyan" icon="folder-check" onClick={onConfirm}
                disabled={scanning || total === 0}
                style={{ width: '100%', justifyContent: 'center' }}>
                Confirm all & file to Smart Folders
              </Button>
            </div>
          </React.Fragment>
        )}
      </div>
    </aside>
  );
}
window.ReviewPanel = ReviewPanel;
