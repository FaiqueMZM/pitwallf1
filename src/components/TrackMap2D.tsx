import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import type { TrackData } from "@/data/tracks";
import { getGeoJsonUrl } from "@/data/tracks";

export interface CarPosition {
  driverNumber: number;
  position: number;
  nameAcronym: string;
  teamColour: string;
  trackProgress?: number;
}

interface TrackMap2DProps {
  track: TrackData;
  carPositions?: CarPosition[];
  height?: number;
  className?: string;
}

interface GeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

interface GeoJson {
  type: string;
  features: GeoJsonFeature[];
}

export default function TrackMap2D({
  track,
  carPositions = [],
  height = 350,
  className = "",
}: TrackMap2DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    // Wait for the SVG to be laid out so clientWidth is accurate
    const el = svgRef.current;
    const container = el.parentElement;

    function draw(W: number) {
      setLoading(true);
      setError(false);

      const svg = d3.select(el);
      svg.selectAll("*").remove();

      const H = height;
      // Generous padding so thick strokes + glow never clip
      const PAD = 48;

      // Fetch GeoJSON from bacinger/f1-circuits
      fetch(getGeoJsonUrl(track.geojsonId))
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<GeoJson>;
        })
        .then((geojson) => {
          // D3 geo projection — fit the track to the SVG bounds with generous padding
          const projection = d3.geoMercator().fitExtent(
            [
              [PAD, PAD],
              [W - PAD, H - PAD],
            ],
            geojson as any,
          );

          const pathGen = d3.geoPath().projection(projection);

          const defs = svg.append("defs");

          // Glow filter for the racing line
          const filter = defs.append("filter").attr("id", `glow-${track.id}`);
          filter
            .append("feGaussianBlur")
            .attr("stdDeviation", "3")
            .attr("result", "blur");
          const merge = filter.append("feMerge");
          merge.append("feMergeNode").attr("in", "blur");
          merge.append("feMergeNode").attr("in", "SourceGraphic");

          const g = svg.append("g");

          // Draw each feature in the GeoJSON
          g.selectAll("path.track-base")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("class", "track-base")
            .attr("d", (d) => pathGen(d as any) ?? "")
            .attr("fill", "none")
            .attr("stroke", "#1e1e1e")
            .attr("stroke-width", 20)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");

          g.selectAll("path.track-surface")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("class", "track-surface")
            .attr("d", (d) => pathGen(d as any) ?? "")
            .attr("fill", "none")
            .attr("stroke", "#2d2d2d")
            .attr("stroke-width", 14)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");

          // White kerb dashes
          g.selectAll("path.track-kerb")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("class", "track-kerb")
            .attr("d", (d) => pathGen(d as any) ?? "")
            .attr("fill", "none")
            .attr("stroke", "#404040")
            .attr("stroke-width", 16)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-dasharray", "6 28")
            .attr("stroke-opacity", "0.4");

          // Red racing line
          g.selectAll("path.track-line")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("class", "track-line")
            .attr("d", (d) => pathGen(d as any) ?? "")
            .attr("fill", "none")
            .attr("stroke", "#e8002d")
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-opacity", "0.75")
            .attr("filter", `url(#glow-${track.id})`);

          // Start/finish dot — use the first coordinate of the first feature
          const firstFeature = geojson.features[0];
          if (firstFeature?.geometry?.coordinates) {
            let firstCoord: number[] | null = null;
            const coords = firstFeature.geometry.coordinates;
            if (firstFeature.geometry.type === "LineString") {
              firstCoord = (coords as number[][])[0];
            } else if (firstFeature.geometry.type === "MultiLineString") {
              firstCoord = (coords as number[][][])[0][0];
            }
            if (firstCoord) {
              const [px, py] = projection(firstCoord as [number, number]) ?? [
                0, 0,
              ];
              g.append("circle")
                .attr("cx", px)
                .attr("cy", py)
                .attr("r", 5)
                .attr("fill", "#ffffff")
                .attr("opacity", 0.9);
              g.append("circle")
                .attr("cx", px)
                .attr("cy", py)
                .attr("r", 8)
                .attr("fill", "none")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1.5)
                .attr("opacity", 0.5);
            }
          }

          // Car markers — spaced evenly along the track path for now
          // (real GPS coords from OpenF1 /location will replace this)
          if (carPositions.length > 0) {
            const trackPath = svgRef.current?.querySelector(
              "path.track-line",
            ) as SVGPathElement | null;
            if (trackPath) {
              const totalLength = trackPath.getTotalLength();
              carPositions.forEach((car) => {
                const progress = car.trackProgress ?? (car.position - 1) / 20;
                const pt = trackPath.getPointAtLength(progress * totalLength);
                const color = car.teamColour
                  ? `#${car.teamColour.replace("#", "")}`
                  : "#888888";
                const r = car.position === 1 ? 7 : 5;

                const carGrp = g.append("g");
                carGrp
                  .append("circle")
                  .attr("cx", pt.x)
                  .attr("cy", pt.y)
                  .attr("r", r + 2)
                  .attr("fill", color)
                  .attr("opacity", 0.3);
                carGrp
                  .append("circle")
                  .attr("cx", pt.x)
                  .attr("cy", pt.y)
                  .attr("r", r)
                  .attr("fill", color)
                  .attr("opacity", 0.95);
                carGrp
                  .append("text")
                  .attr("x", pt.x)
                  .attr("y", pt.y - r - 3)
                  .attr("text-anchor", "middle")
                  .attr("font-size", "9px")
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("fill", "#ffffff")
                  .text(car.nameAcronym);
              });
            }
          }

          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }

    // Use ResizeObserver to get accurate width and re-draw on resize
    const observer = new ResizeObserver((entries) => {
      const W = entries[0]?.contentRect.width ?? el.clientWidth ?? 800;
      if (W > 0) draw(W);
    });
    if (container) observer.observe(container);
    else draw(el.clientWidth || 800);

    return () => observer.disconnect();
  }, [track.id, track.geojsonId, height]);

  // Re-draw cars when positions update (without refetching GeoJSON)
  useEffect(() => {
    if (!svgRef.current || carPositions.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("g.car-marker").remove();

    const trackPath = svgRef.current.querySelector(
      "path.track-line",
    ) as SVGPathElement | null;
    if (!trackPath) return;

    const totalLength = trackPath.getTotalLength();
    const g = svg.select("g");

    carPositions.forEach((car) => {
      const progress = car.trackProgress ?? (car.position - 1) / 20;
      const pt = trackPath.getPointAtLength(progress * totalLength);
      const color = car.teamColour
        ? `#${car.teamColour.replace("#", "")}`
        : "#888888";
      const r = car.position === 1 ? 7 : 5;

      const carGrp = g.append("g").attr("class", "car-marker");
      carGrp
        .append("circle")
        .attr("cx", pt.x)
        .attr("cy", pt.y)
        .attr("r", r + 2)
        .attr("fill", color)
        .attr("opacity", 0.3);
      carGrp
        .append("circle")
        .attr("cx", pt.x)
        .attr("cy", pt.y)
        .attr("r", r)
        .attr("fill", color)
        .attr("opacity", 0.95);
      carGrp
        .append("text")
        .attr("x", pt.x)
        .attr("y", pt.y - r - 3)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("fill", "#ffffff")
        .text(car.nameAcronym);
    });
  }, [carPositions]);

  return (
    <div
      className={`relative w-full bg-[#0a0a0a] flex items-center justify-center ${className}`}
      style={{ height }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-f1-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-f1-gray-3 text-xs">Loading {track.circuit}...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-f1-gray-3 text-xs text-center px-4">
            Couldn't load track map.
            <br />
            <span className="text-f1-gray-2">
              Check your internet connection.
            </span>
          </p>
        </div>
      )}
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ display: loading || error ? "none" : "block" }}
      />
      {/* Legend */}
      {!loading && !error && (
        <div className="absolute bottom-3 left-3 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-white rounded-full opacity-60" />
            <span className="text-white/40 text-xs">S/F</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[#e8002d] rounded-full" />
            <span className="text-white/40 text-xs">Racing line</span>
          </div>
        </div>
      )}
    </div>
  );
}
