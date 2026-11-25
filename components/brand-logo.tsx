import { LOGO_SRC, SCHOOL_NAME } from '@/lib/config';

/**
 * School logo from /public. A plain <img> (not next/image) on purpose: next/image
 * lazy-loads, and a lazy image inside the hidden print copy may be missing on paper.
 */
export function BrandLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_SRC} alt={`${SCHOOL_NAME} logo`} className={`object-contain ${className}`} loading="eager" decoding="sync" />
  );
}
