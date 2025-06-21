import type { SVGProps } from "react";

export function PlanBLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 28"
      fill="none"
      {...props}
    >
      <text
        x="0"
        y="22"
        fontFamily="Poppins, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
      >
        Plan
      </text>
      <text
        x="50"
        y="22"
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
