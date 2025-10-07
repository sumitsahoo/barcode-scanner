import { Component } from "react";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 *
 * @class ErrorBoundary
 * @extends {Component}
 */
class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	/**
	 * Update state when an error is caught
	 * @static
	 * @param {Error} error - The error that was thrown
	 * @returns {Object} New state object
	 */
	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	/**
	 * Log error details for debugging
	 * @param {Error} error - The error that was thrown
	 * @param {Object} errorInfo - Information about component stack
	 */
	componentDidCatch(error, errorInfo) {
		console.error("Error Boundary caught an error:", error, errorInfo);
		this.setState({ errorInfo });
	}

	/**
	 * Reset error state and retry
	 */
	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center h-dvh w-full bg-base-100">
					<div className="card w-96 bg-base-200 shadow-xl">
						<div className="card-body">
							<h2 className="card-title text-error">
								Oops! Something went wrong
							</h2>
							<p className="text-base-content/70">
								The application encountered an unexpected error. Please try
								again.
							</p>
							{this.state.error && (
								<div className="mt-4">
									<details className="collapse collapse-arrow bg-base-300">
										<summary className="collapse-title text-sm font-medium">
											Error Details
										</summary>
										<div className="collapse-content">
											<p className="text-xs font-mono break-all">
												{this.state.error.toString()}
											</p>
										</div>
									</details>
								</div>
							)}
							<div className="card-actions justify-end mt-4">
								<button
									type="button"
									className="btn btn-primary"
									onClick={this.handleReset}
								>
									Try Again
								</button>
								<button
									type="button"
									className="btn btn-outline"
									onClick={() => window.location.reload()}
								>
									Reload Page
								</button>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
