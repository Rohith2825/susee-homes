'use client';

import { useEffect, useState } from 'react';

/** Live copyright year — SSG would otherwise freeze it at build time. */
export default function YearStamp({ initial }: { initial: number }) {
  const [year, setYear] = useState(initial);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year}</>;
}
