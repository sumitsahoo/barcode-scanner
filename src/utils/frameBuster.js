/**
 * Frame-busting script to prevent clickjacking attacks
 * Redirects to the main window if the app is loaded in an iframe
 * @module frameBuster
 */

if (window.top !== window.self) {
	window.top.location = window.self.location;
}
