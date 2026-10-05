'use client';

/**
 * The last resort.
 *
 * Replaces the root layout entirely, which means it runs when the layout
 * itself has failed — so it cannot assume the font files loaded, the design
 * tokens parsed, or the stylesheet was served at all. Everything here is
 * inline, in system fonts, with literal colour values rather than tokens.
 *
 * That is why it looks plainer than the rest of S-OS. A screen whose job is
 * to work when nothing else did should not depend on anything that could be
 * the reason nothing else did.
 *
 * It renders its own <html> and <body> because there is no layout above it.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-AU">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#05070c',
          color: 'rgba(255,255,255,0.95)',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <main style={{ maxWidth: '26rem', width: '100%' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '11.5px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(198,218,235,0.6)',
            }}
          >
            S-OS · Stop error
          </p>

          <h1 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 600 }}>
            S-OS failed to start.
          </h1>

          <p
            style={{
              margin: '0 0 20px',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(226,240,250,0.74)',
            }}
          >
            Something went wrong before the system could load. Reloading usually
            fixes it. If it does not, the plain-text version of this portfolio
            does not depend on the desktop at all.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.95)',
                backgroundColor: '#1a86d6',
              }}
            >
              Reload
            </button>

            <a
              href="/recruiter"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '36px',
                padding: '0 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                color: 'rgba(226,240,250,0.74)',
                border: '1px solid rgba(255,255,255,0.22)',
              }}
            >
              Overview
            </a>
          </div>

          {error.digest ? (
            <p
              style={{
                marginTop: '20px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '11px',
                color: 'rgba(198,218,235,0.4)',
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
