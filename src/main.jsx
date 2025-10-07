/**
 * Application entry point
 * Initializes React root and renders the application with error boundary
 */

// Prevent clickjacking
import "./utils/frameBuster.js";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./main.css";

// Validate environment variables
import "./config/env.js";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</React.StrictMode>,
);
