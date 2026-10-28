import logoSource from "./logo.svg?raw";

export type Point = { x: number; y: number };
export type Contour = Point & { d: string; radius: number; innerRadius: number };
export type LogoGeometry = {
  rings: Contour[];
  silhouettes: Contour[];
  network: string;
  ringPath: string;
};

let cached: LogoGeometry | undefined;

/** Read the original artwork, including its deliberately uneven contours. */
export function logoGeometry(): LogoGeometry {
  if (cached) return cached;
  const doc = new DOMParser().parseFromString(logoSource, "image/svg+xml");
  const paths = doc.querySelectorAll("path");
  const ringPath = paths[0]!.getAttribute("d")!;
  const network = paths[1]!.getAttribute("d")!;
  const measuring = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  measuring.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.append(measuring);
  const contours = (ringPath.match(/M[^M]+/g) ?? []).map((d) => {
    const path = document.createElementNS(measuring.namespaceURI, "path") as SVGPathElement;
    path.setAttribute("d", d);
    measuring.append(path);
    const box = path.getBBox();
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2;
    const length = path.getTotalLength();
    let innerRadius = Infinity;
    for (let sample = 0; sample < 96; sample++) {
      const point = path.getPointAtLength((length * sample) / 96);
      innerRadius = Math.min(innerRadius, Math.hypot(point.x - x, point.y - y));
    }
    return {
      d,
      x,
      y,
      radius: Math.max(box.width, box.height) / 2,
      innerRadius: innerRadius * 0.96,
      area: box.width * box.height,
    };
  });
  measuring.remove();
  const silhouettes = contours.filter(
    (a) => !contours.some((b) => b.area > a.area && Math.hypot(a.x - b.x, a.y - b.y) < 2),
  );
  const rings = silhouettes.map((outer) => ({
    ...outer,
    d:
      outer.d +
      contours
        .filter(
          (inner) =>
            inner.area < outer.area && Math.hypot(inner.x - outer.x, inner.y - outer.y) < 2,
        )
        .map((inner) => inner.d)
        .join(""),
  }));
  cached = { rings, silhouettes, network, ringPath };
  return cached;
}

/** Keep the seam inside the actual silhouette, even while the body squashes or grows. */
export function attachmentRadius(shape: Contour, radius: number, squash = 1) {
  return ((radius * shape.innerRadius) / shape.radius) * Math.min(squash, 1 / squash);
}

/** Centres follow the five connected components of the supplied N, not a regular grid. */
export const nodes = [
  [38, 11],
  [65, 37],
  [93, 62],
  [38, 153],
  [65, 129],
  [147, 153],
  [120, 129],
  [147, 11],
  [120, 38],
  [38, 38],
  [38, 68],
  [38, 97],
  [38, 126],
  [65, 59],
  [93, 82],
  [120, 106],
  [147, 126],
  [147, 97],
  [147, 68],
  [147, 38],
].map(([x, y], i) => ({ x: x!, y: y!, r: [1, 2, 13, 14, 15].includes(i) ? 9.7 : 10.6 }));

export const edges = [
  [0, 1],
  [1, 2],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [19, 18],
  [18, 17],
  [17, 16],
  [7, 8],
  [4, 3],
  [6, 5],
] as const;

export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const spring = (n: number) =>
  n <= 0 ? 0 : n >= 1 ? 1 : 1 - Math.exp(-7 * n) * Math.cos(10 * n);

export function silhouetteTransform(shape: Contour, p: Point, radius: number, angle = 0) {
  return `translate(${p.x} ${p.y}) rotate(${angle}) scale(${radius / shape.radius}) translate(${-shape.x} ${-shape.y})`;
}

/** Tangent handles make a fluid neck; the rounded tip can grow before reaching its neighbour. */
export function bridgePath(a: Point, b: Point, radius: number, amount = 1, tipRadius = radius) {
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  if (distance <= Math.abs(radius - tipRadius) + 0.001) return "";
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const overlap = distance < radius + tipRadius;
  const acos = (value: number) => Math.acos(Math.max(-1, Math.min(1, value)));
  const u1 = overlap
    ? acos((radius ** 2 + distance ** 2 - tipRadius ** 2) / (2 * radius * distance))
    : 0;
  const u2 = overlap
    ? acos((tipRadius ** 2 + distance ** 2 - radius ** 2) / (2 * tipRadius * distance))
    : 0;
  const spread = acos((radius - tipRadius) / distance);
  const tension = mix(0.22, 0.52, clamp(amount));
  const a1 = angle + u1 + (spread - u1) * tension;
  const a2 = angle - u1 - (spread - u1) * tension;
  const b1 = angle + Math.PI - u2 - (Math.PI - u2 - spread) * tension;
  const b2 = angle - Math.PI + u2 + (Math.PI - u2 - spread) * tension;
  const point = (center: Point, direction: number, r: number) => ({
    x: center.x + Math.cos(direction) * r,
    y: center.y + Math.sin(direction) * r,
  });
  const p1 = point(a, a1, radius),
    p2 = point(a, a2, radius);
  const p3 = point(b, b1, tipRadius),
    p4 = point(b, b2, tipRadius);
  const handle =
    Math.min(tension * 2.4, Math.hypot(p1.x - p3.x, p1.y - p3.y) / (radius + tipRadius)) *
    Math.min(1, distance / (radius + tipRadius));
  const c1 = point(p1, a1 - Math.PI / 2, radius * handle);
  const c2 = point(p3, b1 + Math.PI / 2, tipRadius * handle);
  const c3 = point(p4, b2 - Math.PI / 2, tipRadius * handle);
  const c4 = point(p2, a2 + Math.PI / 2, radius * handle);
  const xy = (p: Point) => `${p.x},${p.y}`;
  return `M${xy(p1)} C${xy(c1)} ${xy(c2)} ${xy(p3)} A${tipRadius},${tipRadius} 0 1 0 ${xy(p4)} C${xy(c3)} ${xy(c4)} ${xy(p2)} Z`;
}
