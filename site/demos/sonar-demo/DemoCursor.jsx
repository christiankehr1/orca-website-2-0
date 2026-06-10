/* ORCA demo — animated guide cursor (visual only; App drives position) */
function DemoCursor({ pos, visible, grab, label }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none',
      opacity: visible ? 1 : 0, transition: 'opacity .2s var(--ease-serene)' }}>
      <div style={{ position: 'absolute', left: pos.x, top: pos.y,
        transform: 'translate(-3px,-2px)', willChange: 'left, top' }}>
        {/* grab ripple */}
        {grab && (
          <div style={{ position: 'absolute', left: 2, top: 2, width: 30, height: 30,
            marginLeft: -15, marginTop: -15, borderRadius: 999,
            border: '2px solid rgba(0,192,233,.6)', animation: 'ripple 1.1s var(--ease-serene) infinite' }} />
        )}
        {/* pointer */}
        <svg width="26" height="26" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(38,51,63,.35))' }}>
          <path d="M5 3 L5 18 L9 14 L12 21 L15 19.5 L12 13 L18 13 Z"
            fill="#fff" stroke="#26333f" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        {/* caption chip */}
        {label && (
          <div style={{ position: 'absolute', left: 22, top: 20, whiteSpace: 'nowrap',
            background: 'var(--app-ink)', color: '#fff', fontSize: 11.5, fontWeight: 600,
            padding: '5px 10px', borderRadius: 8, boxShadow: 'var(--shadow-float)',
            animation: 'cardPop .2s var(--ease-serene)' }}>{label}</div>
        )}
      </div>
    </div>
  );
}
window.DemoCursor = DemoCursor;
