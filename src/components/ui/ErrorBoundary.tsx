'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered instead of the children if the subtree throws (default: nothing). */
  fallback?: ReactNode;
}
interface State {
  failed: boolean;
}

/**
 * A minimal error boundary for decorative, non-critical subtrees (e.g. a
 * lazily-loaded WebGL scene). If the child throws — most often a
 * ChunkLoadError when a code-split bundle fails to download — it renders the
 * fallback instead of letting the error bubble to the root and white-screen
 * the whole page. Purely presentational failures, so the error is swallowed.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch() {
    /* non-critical decorative subtree — nothing to report */
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
