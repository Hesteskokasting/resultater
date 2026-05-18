// Variant 2 — WIDE / landscape.
// Props:
//   state = 'in-progress' | 'completed'
//   round = current round number (when in-progress)
//   nextPlayer = 'left' | 'right' — which side gets the turn arrow
function Variant2Wide({ dark, state = 'completed', round = 5, nextPlayer = 'left' }) {
  const bg = dark ? '#0d0d0f' : '#f4f4f0';
  const fg = dark ? '#f4f4f0' : '#0d0d0f';
  const accent = dark ? '#d8ff3a' : '#1a4d2e';
  const accentFg = dark ? '#0d0d0f' : '#f4f4f0';
  const completed = state === 'completed';

  const Side = ({ name, score, hits, total, isLeader, lastRound }) => {
    const cardBg = isLeader ? fg : bg;
    const cardFg = isLeader ? bg : fg;
    const showLastRound = !completed && lastRound > 0;

    return (
      <div style={{
        flex: 1,
        background: cardBg,
        color: cardFg,
        padding: '24px 40px 28px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* name */}
        <div style={{
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: '-0.025em',
          lineHeight: 1.0,
          marginTop: 4,
          marginBottom: 4
        }}>{name}</div>

        {/* big score + last-round annotation, baseline-aligned */}
        <div style={{
          marginTop: 'auto',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'baseline',
          gap: 28,
        }}>
          <div style={{
            fontSize: 320,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: '-0.08em',
            fontVariantNumeric: 'tabular-nums',
          }}>{score}</div>
          {showLastRound && (
            <div style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 0.85,
              fontVariantNumeric: 'tabular-nums',
              color: accent,
              whiteSpace: 'nowrap',
            }}>+{lastRound}</div>
          )}
        </div>

        {/* stats row */}
        <div style={{
          display: 'flex',
          gap: 0,
          fontVariantNumeric: 'tabular-nums',
          marginTop: 18,
          borderTop: `1px solid ${cardFg}28`,
          paddingTop: 14
        }}>
          <div style={{ flex: 1, paddingRight: 18, borderRight: `1px solid ${cardFg}28` }}>
            <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: '0.18em', fontWeight: 800, marginBottom: 4 }}>RING</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{hits} / {total}</div>
          </div>
          <div style={{ flex: 1, paddingLeft: 18 }}>
            <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: '0.18em', fontWeight: 800, marginBottom: 4 }}>PROSENT</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{Math.round(hits / total * 100)}%</div>
          </div>
        </div>
      </div>);

  };

  // Demo data
  const sondre = { name: 'Sondre Torgersen', score: 12, hits: 4, total: 16, lastRound: 0 };
  const petter = { name: 'Petter Lyngroth', score: 23, hits: 7, total: 16, lastRound: 3, isLeader: true };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bg,
      color: fg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* top bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${fg}20`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={{
            background: 'none',
            border: `2px solid ${fg}`,
            color: fg,
            width: 38, height: 38,
            fontSize: 18,
            fontWeight: 800,
            borderRadius: 10
          }}>←</button>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', opacity: 0.7 }}>ØSTLANDSMESTERSKAP</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.02em' }}>Runde 1 · Bane 3</div>
      </div>

      {/* centered round / fullført banner */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: `1px solid ${fg}15`,
        flexShrink: 0
      }}>
        {completed ?
        <div style={{
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: '0.24em',
          padding: '8px 18px',
          background: accent,
          color: accentFg,
          borderRadius: 6
        }}>FULLFØRT</div> :

        <div style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 12
        }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.26em', opacity: 0.55 }}>OMGANG</span>
            <span style={{ fontSize: 32, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>{round}</span>
          </div>
        }
      </div>

      {/* split body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', minHeight: 0 }}>
        <Side {...sondre} />
        <Side {...petter} />

        {/* turn arrow — sits entirely inside the next player's card, hugging the inner edge */}
        {!completed &&
        <div style={{
          position: 'absolute',
          top: '50%',
          ...(nextPlayer === 'left'
            ? { left: 'calc(50% - 18px)', transform: 'translate(-100%, -50%)' }
            : { left: 'calc(50% + 18px)', transform: 'translate(0%, -50%)' }),
          pointerEvents: 'none',
          width: 110, height: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
            <svg width="110" height="110" viewBox="0 0 100 100" style={{ display: 'block' }}>
              {nextPlayer === 'left' ?
            <polygon
              points="78,8 78,92 14,50"
              fill={accent}
              stroke={bg}
              strokeWidth="5"
              strokeLinejoin="round" /> :


            <polygon
              points="22,8 22,92 86,50"
              fill={accent}
              stroke={bg}
              strokeWidth="5"
              strokeLinejoin="round" />

            }
            </svg>
          </div>
        }
      </div>
    </div>);

}