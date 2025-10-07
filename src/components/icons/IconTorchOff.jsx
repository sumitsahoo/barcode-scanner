/**
 * SVG icon component for torch off. The stroke color is set to currentColor,
 * so it will inherit the color from the parent or Tailwind class (e.g. text-primary).
 *
 * @param {string} className - Additional Tailwind or custom classes
 * @param {object} props - Other props passed to the SVG
 */

import { memo } from "react";

const IconTorchOff = ({ className = "", ...props }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<title>Torch Off Icon</title>
		<path
			d="M9.18005 18.04V20.48C9.18005 22.16 10.0901 22.5 11.2001 21.24L18.7701 12.64C19.7001 11.59 19.3101 10.72 17.9001 10.72H16.9701"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeMiterlimit="10"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M14.82 8.84002V3.52002C14.82 1.84002 13.91 1.50002 12.8 2.76002L5.23 11.36C4.3 12.41 4.69 13.28 6.1 13.28H9.19V14.46"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeMiterlimit="10"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M22 2L2 22"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export default memo(IconTorchOff);
