import { memo } from "react";

/**
 * Base SVG icon wrapper component
 * Provides consistent structure for all icons with currentColor support
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Accessible title for the icon
 * @param {string} props.className - Additional Tailwind or custom classes
 * @param {React.ReactNode} props.children - SVG path elements
 * @param {string} props.viewBox - SVG viewBox (defaults to "0 0 24 24")
 * @param {Object} props.rest - Additional props passed to the SVG
 */
const Icon = ({ title, className = "", children, viewBox = "0 0 24 24", ...props }) => (
    <svg
        viewBox={viewBox}
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>{title}</title>
        {children}
    </svg>
);

export default memo(Icon);
