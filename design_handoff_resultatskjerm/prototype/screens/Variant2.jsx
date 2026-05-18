// Variant 2 — Split blocks (portrait). Now matches the wide version's behavior:
//   - state ('in-progress' | 'completed') + round + nextPlayer (top/bottom)
//   - centered "OMGANG N" / "FULLFØRT" banner below the header
//   - no rank pill / no LEDER-BAK labels
//   - last-round points "+3" baseline-aligned with the score
//   - turn arrow sits inside the next player's card, pointing at them
function Variant2({ dark, state = 'completed', round = 5, nextPlayer = 'bottom' }) {
  const bg = dark ? '#0d0d0f' : '#f4f4f0';
  const fg = dark ? '#f4f4f0' : '#0d0d0f';
  const accent = dark ? '#d8ff3a' : '#1a4d2e';
  const accentFg = dark ? '#0d0d0f' : '#f4f4f0';
  const completed = state === 'completed';

  const Card = ({ name, score, hits, total, isLeader, lastRound }) => {
    const cardBg = isLeader ? fg : bg;
    const cardFg = isLeader ? bg : fg;
    const showLastRound = !completed && lastRound > 0;

    return (
      <div style={{
        flex: 1,
        background: cardBg,
        color: cardFg,
        padding: '14px 24px 18px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* name */}
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          lineHeight: 1.0,
          marginBottom: 4,
        }}>{name}</div>

        {/* big score + last-round annotation, baseline-aligned */}
        <div style={{
          marginTop: 'auto',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'baseline',
          gap: 18,
        }}>
          <div style={{
            fontSize: 196,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: '-0.08em',
            fontVariantNumeric: 'tabular-nums',
          }}>{score}</div>
          {showLastRound && (
            <div style={{
              fontSize: 60,
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
          marginTop: 10,
          borderTop: `1px solid ${cardFg}28`,
          paddingTop: 10,
        }}>
          <div style={{ flex: 1, paddingRight: 14, borderRight: `1px solid ${cardFg}28` }}>
            <div style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.16em', fontWeight: 800, marginBottom: 3 }}>RING</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{hits} / {total}</div>
          </div>
          <div style={{ flex: 1, paddingLeft: 14 }}>
            <div style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.16em', fontWeight: 800, marginBottom: 3 }}>PROSENT</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{Math.round(hits / total * 100)}%</div>
          </div>
        </div>
      </div>
    );
  };

  // Demo data
  const petter = { name: 'Petter Lyngroth', score: 23, hits: 7, total: 16, lastRound: 3, isLeader: true };
  const sondre = { name: 'Sondre Torgersen', score: 12, hits: 4, total: 16, lastRound: 0 };

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
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${fg}20`,
        flexShrink: 0,
      }}>
        <button style={{
          background: 'none',
          border: `2px solid ${fg}`,
          color: fg,
          width: 36, height: 36,
          fontSize: 18,
          fontWeight: 800,
          borderRadius: 10,
        }}>←</button>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', opacity: 0.7 }}>ØSTLANDSMESTERSKAP</div>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>R1 · B3</div>
      </div>

      {/* centered round / fullført banner */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: `1px solid ${fg}15`,
        flexShrink: 0,
      }}>
        {completed ? (
          <div style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.24em',
            padding: '6px 14px',
            background: accent,
            color: accentFg,
            borderRadius: 6,
          }}>FULLFØRT</div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.24em', opacity: 0.55 }}>OMGANG</span>
            <span style={{ fontSize: 24, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>{round}</span>
          </div>
        )}
      </div>

      {/* split body — players stacked top/bottom */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
        <Card {...petter} />
        <Card {...sondre} />

        {/* turn arrow — sits inside the next player's card, on the right side near the divider (out of the name's path) */}
        {!completed && (
          <div style={{
            position: 'absolute',
            right: 24,
            ...(nextPlayer === 'top'
              ? { top: 'calc(50% - 16px)', transform: 'translateY(-100%)' }
              : { top: 'calc(50% + 16px)', transform: 'translateY(0%)' }),
            pointerEvents: 'none',
            width: 76, height: 76,
          }}>
            <svg width="76" height="76" viewBox="0 0 100 100" style={{ display: 'block' }}>
              {nextPlayer === 'top' ? (
                <polygon
                  points="8,78 92,78 50,14"
                  fill={accent}
                  stroke={bg}
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              ) : (
                <polygon
                  points="8,22 92,22 50,86"
                  fill={accent}
                  stroke={bg}
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
