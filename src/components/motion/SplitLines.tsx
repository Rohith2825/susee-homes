import { Fragment } from 'react';

interface SplitLinesProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'blockquote';
  /** When false, renders plain lines without the mask-reveal hooks. */
  animate?: boolean;
}

/**
 * Deterministic line-mask reveal: splits copy on `\n` (authored line breaks),
 * wrapping each line in an overflow-hidden mask. GSAP slides `.line-inner`
 * from 115% → 0 (see SiteMotion / Hero choreography).
 */
export default function SplitLines({ text, className, as: Tag = 'span', animate = true }: SplitLinesProps) {
  const lines = text.split('\n');

  if (!animate) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className} data-lines="">
      {lines.map((line, i) => (
        <span key={i} className="line block overflow-hidden pb-[0.14em] -mb-[0.14em]">
          <span className="line-inner block will-change-transform">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
