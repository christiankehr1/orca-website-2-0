/* ORCA Sonar demo — left sidebar */
function Sidebar() {
  const D = window.ORCA_SONAR;
  const [hover, setHover] = React.useState(null);
  return (
    <aside style={{ width: 240, flex: 'none', background: '#fff', borderRight: '1px solid var(--app-line)',
      display: 'flex', flexDirection: 'column', height: '100%', zIndex: 5 }}>

      {/* Wordmark */}
      <div style={{ padding: '20px 22px 12px', display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src={(window.ORCA_LOGOS && window.ORCA_LOGOS.black) || 'assets/orca-symbol-black.png'} alt="" style={{ height: 23, width: 'auto', transform: 'translateY(-1px)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
          letterSpacing: '.30em', paddingLeft: '.34em', color: 'var(--app-ink)' }}>RCA</span>
      </div>

      {/* Vault dropdown */}
      <div style={{ margin: '4px 14px 10px', padding: '10px 12px', borderRadius: 11, background: 'var(--app-surface-sunken)',
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{ width: 27, height: 27, borderRadius: 8, background: 'var(--orca-gradient-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={(window.ORCA_LOGOS && window.ORCA_LOGOS.white) || 'assets/orca-symbol-white.png'} alt="" style={{ height: 13 }} />
        </div>
        <div style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{D.workspace}</div>
          <div style={{ fontSize: 10.5, color: 'var(--app-ink-3)' }}>Zero-trust · Swiss</div>
        </div>
        <Icon name="chevron-down" size={16} color="var(--app-ink-3)" />
      </div>

      {/* Search */}
      <div style={{ margin: '0 14px 8px', display: 'flex', alignItems: 'center', gap: 9,
        border: '1.5px solid var(--app-line)', borderRadius: 10, padding: '9px 12px', color: 'var(--app-ink-3)' }}>
        <Icon name="search" size={16} color="var(--app-slate-icon)" />
        <span style={{ fontSize: 12.5 }}>Search</span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 12px 8px', display: 'flex', flexDirection: 'column', gap: 1,
        overflowY: 'auto', flex: 1 }}>
        {D.nav.map(item => {
          const active = item.active, hot = hover === item.id;
          return (
            <button key={item.id} onMouseEnter={() => setHover(item.id)} onMouseLeave={() => setHover(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, border: 0, cursor: 'pointer',
                padding: '9px 11px', borderRadius: 9, fontFamily: 'var(--font-sans)', fontSize: 13.5,
                fontWeight: active ? 600 : 500, textAlign: 'left', flex: 'none',
                background: active ? 'var(--app-select-soft)' : (hot ? '#f7f9fc' : 'transparent'),
                color: active ? 'var(--app-ink)' : 'var(--app-ink-2)', transition: 'background .14s' }}>
              <Icon name={item.icon} size={18} stroke={active ? 2 : 1.75}
                color={active ? 'var(--app-primary)' : 'var(--app-slate-icon)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'sonar' && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: 'var(--accent-cyan)',
                  background: 'rgba(0,192,233,.12)', padding: '2px 6px', borderRadius: 999 }}>AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Add */}
      <div style={{ padding: 14 }}>
        <Button variant="app" icon="plus" style={{ width: '100%', justifyContent: 'space-between' }}>
          <span style={{ flex: 1, textAlign: 'left', marginLeft: 2 }}>Add</span>
          <Icon name="chevron-right" size={16} stroke={2.2} />
        </Button>
      </div>

      {/* User */}
      <div style={{ padding: '11px 16px 16px', borderTop: '1px solid var(--app-line)',
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="user" size={18} color="var(--app-slate-icon)" />
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--app-ink)' }}>John</div>
        <Icon name="eye-off" size={16} color="var(--app-ink-3)" />
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;
