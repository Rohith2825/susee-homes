import type { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  /** Survey index rendered before the label, e.g. "01". */
  index?: string;
  className?: string;
  reveal?: boolean;
}

/** Survey-style section label: hairline tick + mono tracked caps + index. */
export default function Eyebrow({ children, index, className = '', reveal = true }: EyebrowProps) {
  return (
    <p className={`eyebrow ${className}`} {...(reveal ? { 'data-reveal': '' } : {})}>
      {index && <span>S.{index}</span>}
      <span>{children}</span>
    </p>
  );
}
