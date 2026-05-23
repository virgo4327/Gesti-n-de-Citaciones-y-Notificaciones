import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
          <h1 className="text-3xl font-black text-police">Algo salió mal</h1>
          <p className="text-sm leading-6 text-slate-600">
            Ocurrió un error inesperado. Puedes recargar la página para volver a intentarlo.
          </p>
          <Button onClick={() => location.reload()}>Recargar página</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
