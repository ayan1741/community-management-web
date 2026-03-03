import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Building2, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
                  <Building2 className="h-7 w-7 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Bir hata oluştu</h2>
                <p className="text-sm text-muted-foreground">
                  Beklenmedik bir sorun meydana geldi. Sayfayı yenileyerek tekrar deneyin.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Sayfayı Yenile
              </button>
              <p className="text-xs text-muted-foreground/60">
                Sorun devam ederse yönetici ile iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
