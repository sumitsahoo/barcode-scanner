/**
 * SVG icon component for rotate camera. The stroke color is set to currentColor,
 * so it will inherit the color from the parent or Tailwind class (e.g. text-primary).
 *
 * @param {string} className - Additional Tailwind or custom classes
 * @param {object} props - Other props passed to the SVG
 */
/** biome-ignore-all lint/nursery/useUniqueElementIds: This is just an SVG, unique ID is not needed */
const IconRotateCamera = ({ className = "", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Rotate Camera Icon</title>
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g id="SVGRepo_iconCarrier">
      <path
        d="M14.89 5.0799C14.02 4.8199 13.06 4.6499 12 4.6499C7.20996 4.6499 3.32996 8.5299 3.32996 13.3199C3.32996 18.1199 7.20996 21.9999 12 21.9999C16.79 21.9999 20.67 18.1199 20.67 13.3299C20.67 11.5499 20.13 9.8899 19.21 8.5099"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.13 5.32L13.24 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.13 5.32007L12.76 7.78007"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export default IconRotateCamera;
