import type { SVGProps } from "react";
type Props = SVGProps<SVGSVGElement> & { size?: number };
function icon(path: string) {
  return function Icon({ size = 24, children, ...props }: Props) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d={path} />
        {children}
      </svg>
    );
  };
}
export const ArrowRight = icon("M5 12h14m-6-6 6 6-6 6");
export const ArrowLeft = icon("M19 12H5m6-6-6 6 6 6");
export const ArrowUpRight = icon("M7 17 17 7M7 7h10v10");
export const ArrowDown = icon("M12 5v14m-6-6 6 6 6-6");
export const Check = icon("m5 12 4 4L19 6");
export const Pencil = icon(
  "m16 3 5 5M4 15 16 3a2.8 2.8 0 0 1 5 5L9 20l-6 1 1-6Z",
);
export const LoaderCircle = icon("M21 12a9 9 0 1 1-9-9");
export const X = icon("m6 6 12 12M18 6 6 18");
