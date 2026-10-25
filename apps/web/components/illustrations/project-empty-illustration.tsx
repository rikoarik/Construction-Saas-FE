import type { SVGProps } from "react";

export function ProjectEmptyIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 240 144"
      {...props}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        <path d="M46 103h149" opacity=".32" />
        <path d="M65 91V48l22-12 22 12v43H65Z" />
        <path d="M87 36v55M65 49h44" opacity=".55" />
        <path d="M112 91V59l22-12 30 12v32h-52Z" />
        <path d="M134 47v44M112 59h52" opacity=".55" />
        <path d="M72 101h102M76 109h93" opacity=".3" />
        <path d="M181 40h17v17h-17z" opacity=".65" />
        <path d="M185 49h9" strokeWidth="2.2" />
      </g>
    </svg>
  );
}
