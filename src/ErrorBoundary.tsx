import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) { super(props); this.state = { error: null }; }

  static getDerivedStateFromError(error: Error) { return { error }; }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <pre className="mt-2 text-sm whitespace-pre-wrap">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
