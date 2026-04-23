import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("UI rendering error", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="errorBoundaryFallback" role="alert">
          <h3>{this.props.title ?? "Что-то пошло не так"}</h3>
          <p>
            {this.props.description ??
              "Компонент не удалось отрисовать. Попробуйте повторить действие."}
          </p>
          <button className="btn btnPrimary" type="button" onClick={this.handleRetry}>
            {this.props.retryLabel ?? "Повторить"}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
