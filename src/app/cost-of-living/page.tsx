"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import USMap from "@/components/cost-of-living/USMap";
import cities from "@/data/cities-col.json";

type City = (typeof cities)[number];

export default function CostOfLivingPage() {
  const [salary, setSalary] = useState<number>(0);
  const [homeCityId, setHomeCityId] = useState<string>("");

  const homeCity: City | null = cities.find((c) => c.id === homeCityId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cost of Living Comparison</h2>
        <p className="text-muted-foreground text-sm">
          Enter your salary and home city, then hover any city to see the equivalent salary and cost breakdown.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Annual Salary</label>
          <Input
            type="number"
            className="w-44"
            placeholder="e.g. 100000"
            value={salary || ""}
            onChange={(e) => setSalary(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Your Home City</label>
          <Select value={homeCityId} onValueChange={setHomeCityId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select city…" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.city}, {c.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {homeCity && salary > 0 && (
          <div className="flex items-end pb-0.5">
            <p className="text-sm text-muted-foreground">
              COL index for <span className="font-medium text-foreground">{homeCity.city}</span>: {homeCity.overall}
            </p>
          </div>
        )}
      </div>

      {(!homeCity || salary <= 0) && (
        <p className="text-muted-foreground text-sm italic">
          {!salary ? "Enter a salary" : "Select your home city"} to start comparing cities on the map.
        </p>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <USMap salary={salary} homeCity={homeCity} />
      </div>

      <div className="rounded-lg border p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">How this works</p>
        <p>
          COL indices are sourced from BLS Regional Price Parities. A national average of 100 is the baseline.
          The equivalent salary is calculated as: <code className="bg-muted px-1 rounded">your salary × (target index / home index)</code>.
        </p>
        <p>
          The breakdown shows each category&apos;s relative cost multiplier and estimated annual dollar impact based on
          typical US household spending weights (housing 30%, transportation 12%, groceries 10%, utilities 8%, healthcare 8%).
        </p>
      </div>
    </div>
  );
}
