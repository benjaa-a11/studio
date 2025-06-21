import type { SVGProps } from "react";

export function PlanBLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <text
        x="0"
        y="18"
        fontFamily="Poppins, sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="currentColor"
      >
        Plan
      </text>
      <text
        x="45"
        y="18"
        fontFamily="Poppins, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        B
      </text>
    </svg>
  );
}
