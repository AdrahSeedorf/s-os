import { ImageResponse } from 'next/og';
import { site } from '@/lib/config/site';
import { getProfile } from '@/lib/content';

/**
 * The link preview image.
 *
 * Generated rather than designed in a graphics tool, so it stays in step with
 * the content registry and never has to be re-exported when a job title
 * changes. This is what appears when the URL is pasted into LinkedIn, Slack or
 * a job application — for a portfolio, it is the first impression before the
 * first impression.
 */
export const alt = `${getProfile().name} — ${getProfile().title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  const profile = getProfile();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'linear-gradient(150deg, #12212E 0%, #0A0D14 55%, #05070C 100%)',
        color: '#FFFFFF',
        fontFamily: 'sans-serif',
      }}
    >
      {/* The S curve, drawn inline — the OG renderer has no access to the
            design tokens or the component tree. */}
      <svg width="96" height="96" viewBox="0 0 100 100">
        <rect x="6" y="6" width="88" height="88" rx="20" fill="#1A86D6" />
        <path
          d="M66 36 C 62 25, 36 24, 35 37 C 34 50, 65 47, 64 60 C 63 73, 38 74, 33 65"
          fill="none"
          stroke="#E4FAFF"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 62, fontWeight: 600, letterSpacing: -1 }}>{profile.name}</div>
        <div style={{ fontSize: 34, color: '#8EF1FF' }}>{profile.title}</div>
        <div style={{ fontSize: 24, color: 'rgba(226,240,250,0.72)' }}>{profile.location}</div>
      </div>

      {/* One interpolated string rather than several. Satori requires an
          explicit display on any element with more than one child, and
          `{a} — {b}` is three text nodes. */}
      <div style={{ fontSize: 20, color: 'rgba(198,218,235,0.56)' }}>
        {`${site.name} — ${site.fullName}`}
      </div>
    </div>,
    size,
  );
}
