'use client'
import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-4xl">😵</p>
            <h1 className="text-xl font-bold text-black">Algo salió mal</h1>
            <p className="text-neutral-400 text-sm">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-black text-white rounded-xl text-sm">
              Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
