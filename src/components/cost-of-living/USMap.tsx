"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import cities from "@/data/cities-col.json";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

type City = (typeof cities)[number];

const SPENDING_WEIGHTS = {
  housing: 0.30,
  groceries: 0.10,
  healthcare: 0.08,
  transportation: 0.12,
  utilities: 0.08,
};

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

function getCategoryImpact(salary: number, homeCity: City, targetCity: City) {
  return Object.entries(SPENDING_WEIGHTS).map(([key, weight]) => {
    const homeIdx = homeCity[key as keyof typeof SPENDING_WEIGHTS];
    const targetIdx = targetCity[key as keyof typeof SPENDING_WEIGHTS];
    const ratio = targetIdx / homeIdx;
    const impact = salary * weight * (ratio - 1);
    return { category: key, ratio, impact };
  });
}

interface TooltipData {
  city: City;
  equivalentSalary: number;
  breakdown: ReturnType<typeof getCategoryImpact>;
  x: number;
  y: number;
}

interface Props {
  salary: number;
  homeCity: City | null;
}

export default function USMap({ salary, homeCity }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  function handleEnter(city: City, e: React.MouseEvent) {
    if (!homeCity || city.id === homeCity.id || salary <= 0) return;
    const equivalentSalary = salary * (city.overall / homeCity.overall);
    const breakdown = getCategoryImpact(salary, homeCity, city);
    setTooltip({ city, equivalentSalary, breakdown, x: e.clientX, y: e.clientY });
  }

  function handleMove(e: React.MouseEvent) {
    if (tooltip) setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY });
  }

  return (
    <div className="relative" onMouseMove={handleMove} onMouseLeave={() => setTooltip(null)}>
      <ComposableMap projection="geoAlbersUsa" className="w-full">
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e2e8f0"
                stroke="#cbd5e1"
                strokeWidth={0.5}
                style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
              />
            ))
          }
        </Geographies>

        {cities.map((city) => {
          const isHome = homeCity?.id === city.id;
          const active = homeCity && salary > 0 && !isHome;
          return (
            <Marker key={city.id} coordinates={[city.lng, city.lat]}>
              <circle
                r={isHome ? 7 : 5}
                fill={isHome ? "#0f172a" : active ? "#3b82f6" : "#94a3b8"}
                stroke="white"
                strokeWidth={1.5}
                className="cursor-pointer transition-all"
                onMouseEnter={(e) => handleEnter(city, e as unknown as React.MouseEvent)}
                onMouseLeave={() => setTooltip(null)}
              />
              {isHome && (
                <text textAnchor="middle" y={-10} style={{ fontSize: 9, fill: "#0f172a", fontWeight: 600 }}>
                  {city.city}
                </text>
              )}
            </Marker>
          );
        })}
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-lg border bg-white p-3 shadow-lg text-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-foreground mb-1">
            {tooltip.city.city}, {tooltip.city.state}
          </p>
          <p className="text-base font-bold text-blue-600 mb-2">
            Equivalent: {fmt(tooltip.equivalentSalary)}/yr
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            {tooltip.breakdown.map(({ category, ratio, impact }) => (
              <div key={category} className="flex justify-between gap-4">
                <span className="capitalize">{category}</span>
                <span className={impact > 0 ? "text-red-500" : impact < 0 ? "text-green-600" : ""}>
                  {ratio.toFixed(2)}x &nbsp;
                  {impact !== 0 && (
                    <span>({impact > 0 ? "+" : ""}{fmt(impact)}/yr)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground border-t pt-1">
            COL index: {tooltip.city.overall} vs {homeCity?.overall} (your city)
          </p>
        </div>
      )}
    </div>
  );
}
