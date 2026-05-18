// Variant 1 — Brutalist B&W. Max contrast, huge numbers.
function Variant1({ dark }) {
  const bg = dark ? '#000' : '#fff';
  const fg = dark ? '#fff' : '#000';
  const muted = dark ? '#777' : '#888';
  const rule = dark ? '#1a1a1a' : '#ececec';

  const Row = ({ name, score, hits, total, leading }) => (
    <div style={{
      flex: 1,
      padding: '18px 22px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      position: 'relative',
      background: leading ? fg : bg,
      color: leading ? bg : fg,
    }}>
      <div style={{
        fontSize: 38,
        fontWeight: 900,
        letterSpacing: '-0.02em',
        lineHeight: 1.0,
        marginBottom: 2,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>{name}</div>
      <div style={{
        fontSize: 184,
        fontWeight: 900,
        lineHeight: 0.9,
        letterSpacing: '-0.07em',
        fontVariantNumeric: 'tabular-nums',
        marginTop: 'auto',
        marginBottom: 6,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>{score}</div>
      <div style={{
        display: 'flex',
        gap: 18,
        fontSize: 15,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        opacity: leading ? 0.9 : 0.7,
      }}>
        <span>Ring: {hits}/{total}</span>
        <span>·</span>
        <span>{Math.round(hits/total*100)}%</span>
      </div>
      {leading && (
        <div style={{
          position: 'absolute',
          top: 18,
          right: 18,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.16em',
          padding: '6px 10px',
          border: `2px solid ${bg}`,
        }}>LEDER</div>
      )}
    </div>
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bg,
      color: fg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* top bar */}
      <div style={{
        padding: '14px 16px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${fg}`,
      }}>
        <button style={{
          background: 'none',
          border: `2px solid ${fg}`,
          color: fg,
          width: 36, height: 36,
          fontSize: 18,
          fontWeight: 800,
          padding: 0,
        }}>←</button>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.14em' }}>
          ØSTLANDSMESTERSKAP
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}>
          R1 · B3
        </div>
      </div>
      {/* status banner */}
      <div style={{
        padding: '10px 16px',
        background: fg,
        color: bg,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.16em',
        textAlign: 'center',
      }}>FULLFØRT</div>
      <Row name="Sondre Torgersen" score={12} hits={4} total={16} />
      <div style={{ height: 2, background: fg }} />
      <Row name="Petter Lyngroth" score={23} hits={7} total={16} leading />
    </div>
  );
}
