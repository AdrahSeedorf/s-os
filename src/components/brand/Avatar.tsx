import { getProfile } from '@/lib/content';
import { cn } from '@/lib/utils/cn';
import { ProgramIcon } from '@/components/icons';

export interface AvatarProps {
  size?: number;
  className?: string;
  /** Set when the surrounding text already names the person, which is the
   *  usual case — the login screen shows the name directly beneath. */
  decorative?: boolean;
}

/**
 * Seedorf's photo.
 *
 * A plain `<picture>` with pre-generated files rather than next/image. The
 * avatar is one fixed asset rendered at two known sizes, so build-time
 * conversion produces smaller files than runtime optimisation would, costs no
 * image transformations on Vercel, and works identically anywhere the site is
 * hosted. next/image earns its keep for project screenshots, not for this.
 *
 * The source photo was 1122×1402 at 2.1MB; the 400px AVIF is 8.7KB.
 *
 * Falls back to the generic profile glyph when no avatar is registered, so the
 * component is safe to use before a photo exists.
 */
export function Avatar({ size = 80, className, decorative = true }: AvatarProps) {
  const profile = getProfile();
  const avatar = profile.avatar;

  if (!avatar) {
    return (
      <ProgramIcon
        icon="about"
        size={Math.round(size * 0.5)}
        {...(className === undefined ? {} : { className })}
      />
    );
  }

  // The 96px crop is a separate file rather than a downscale of the large one:
  // menus render it at 40px, and shipping a 400px image for that wastes both
  // bytes and decode time on every Start-menu open.
  const variant = size <= 96 ? 'avatar-small' : 'avatar';

  return (
    <picture>
      <source srcSet={`/brand/${variant}.avif`} type="image/avif" />
      <source srcSet={`/brand/${variant}.webp`} type="image/webp" />
      <img
        src={`/brand/${variant}.jpg`}
        alt={decorative ? '' : avatar.alt}
        aria-hidden={decorative ? true : undefined}
        width={size}
        height={size}
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    </picture>
  );
}
