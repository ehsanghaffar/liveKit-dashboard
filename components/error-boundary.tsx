"use client"

import { Component } from "react"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="rounded-2xl bg-card ring-1 ring-border p-8 max-w-md text-center space-y-3">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">An unexpected error occurred. Try refreshing the page.</p>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
