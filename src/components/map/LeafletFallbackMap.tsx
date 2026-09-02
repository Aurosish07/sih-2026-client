"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Storm, TrackPoint } from "@/lib/types";
import { formatCoord, formatWind } from "@/lib/formatters";
import { getCategoryColor, windToCategory } from "@/lib/types";
import type { ConeCircle } from "./CycloneMap";
import type { BasemapKind } from "./CycloneMap";
import { BASEMAP_STYLES } from "./CycloneMap";

interface LeafletFallbackMapProps {
  track: TrackPoint[];
  forecastTrack?: TrackPoint[];
  cone?: ConeCircle[];
  storms?: Storm[];
  onSelectStorm?: (stormId: string) => void;
  basemap?: BasemapKind;
}

export default function LeafletFallbackMap({
  track,
  forecastTrack = [],
  cone = [],
  storms = [],
  onSelectStorm,
  basemap = "satellite",
}: LeafletFallbackMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const basemapRef = useRef<BasemapKind>(basemap);
  useEffect(() => {
    basemapRef.current = basemap;
  }, [basemap]);
  const trackLayerRef = useRef<L.Polyline | null>(null);
  const trackDotsRef = useRef<L.LayerGroup | null>(null);
  const forecastLayerRef = useRef<L.Polyline | null>(null);
  const forecastDotsRef = useRef<L.LayerGroup | null>(null);
  const stormsLayerRef = useRef<L.LayerGroup | null>(null);
  const coneLayerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef<((id: string) => void) | undefined>(undefined);
  useEffect(() => {
    onSelectRef.current = onSelectStorm;
  }, [onSelectStorm]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [15, 80],
      zoom: 4,
    });

    tileLayerRef.current = L.tileLayer(
      BASEMAP_STYLES[basemapRef.current]?.tiles[0] ?? BASEMAP_STYLES.satellite.tiles[0],
      {
        maxZoom: 20,
        attribution: "&copy; NASA GIBS &copy; Esri &copy; OpenStreetMap &copy; CARTO",
      },
    ).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const url = BASEMAP_STYLES[basemap]?.tiles[0] ?? BASEMAP_STYLES.satellite.tiles[0];
    const existing = tileLayerRef.current;
    const layer = L.tileLayer(url, {
      maxZoom: 20,
      attribution: "&copy; NASA GIBS &copy; Esri &copy; OpenStreetMap &copy; CARTO",
    }).addTo(map);
    if (existing) existing.remove();
    tileLayerRef.current = layer;
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (trackLayerRef.current) trackLayerRef.current.remove();
    if (trackDotsRef.current) trackDotsRef.current.remove();
    if (forecastLayerRef.current) forecastLayerRef.current.remove();
    if (forecastDotsRef.current) forecastDotsRef.current.remove();

    const latLngs = track.map((p) => [p.lat, p.lon] as [number, number]);
    const foreLatLngs = forecastTrack.map((p) => [p.lat, p.lon] as [number, number]);

    if (latLngs.length > 1) {
      trackLayerRef.current = L.polyline(latLngs, {
        color: "#ea580c",
        weight: 4,
        opacity: 0.9,
      }).addTo(map);
    }

    if (foreLatLngs.length > 0) {
      forecastLayerRef.current = L.polyline(foreLatLngs, {
        color: "#0284c7",
        weight: 3,
        dashArray: "6 8",
        opacity: 0.9,
      }).addTo(map);
    }

    const dots = L.layerGroup();
    track.forEach((p) => {
      L.circleMarker([p.lat, p.lon], {
        radius: 5,
        color: "#ffffff",
        weight: 1.5,
        fillColor: "#ea580c",
        fillOpacity: 1,
      })
        .addTo(dots)
        .bindPopup(
          `<strong>${formatCoord(p.lat, p.lon)}</strong><br/>Wind ${p.wind_kt} kt · Pressure ${p.pressure_hpa} hPa<br/>${p.movement_direction}`,
        );
    });
    trackDotsRef.current = dots.addTo(map);

    const foreDots = L.layerGroup();
    forecastTrack.forEach((p) => {
      L.circleMarker([p.lat, p.lon], {
        radius: 4,
        color: "#ffffff",
        weight: 1,
        fillColor: "#0284c7",
        fillOpacity: 0.9,
      })
        .addTo(foreDots)
        .bindPopup(
          `<strong>Forecast ${formatCoord(p.lat, p.lon)}</strong><br/>Wind ${p.wind_kt} kt`,
        );
    });
    forecastDotsRef.current = foreDots.addTo(map);

    const pts = track[track.length - 1];
    if (pts) {
      L.circleMarker([pts.lat, pts.lon], {
        radius: 12,
        color: "#ea580c",
        weight: 2.5,
        fillColor: "#ffffff",
        fillOpacity: 0.35,
      }).addTo(map);
    }

    const all = track.length ? track : forecastTrack;
    if (all.length > 0) {
      map.fitBounds(
        L.latLngBounds(all.map((p) => [p.lat, p.lon] as [number, number])),
        {
          padding: [48, 48],
        },
      );
    }

    return () => {
      if (trackLayerRef.current) trackLayerRef.current.remove();
      if (trackDotsRef.current) trackDotsRef.current.remove();
      if (forecastLayerRef.current) forecastLayerRef.current.remove();
      if (forecastDotsRef.current) forecastDotsRef.current.remove();
      trackLayerRef.current = null;
      trackDotsRef.current = null;
      forecastLayerRef.current = null;
      forecastDotsRef.current = null;
    };
  }, [track, forecastTrack]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (stormsLayerRef.current) stormsLayerRef.current.remove();

    const layer = L.layerGroup();
    storms.forEach((s) => {
      const color = getCategoryColor(s.category ?? windToCategory(s.wind_kt ?? s.maxWind ?? 0));
      L.circleMarker([s.lat, s.lon], {
        radius: 12,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.85,
      })
        .addTo(layer)
        .bindPopup(
          `<strong>${s.name}</strong><br/>${s.category ?? windToCategory(s.wind_kt ?? s.maxWind ?? 0)} · ${formatWind(s.wind_kt ?? s.maxWind ?? 0)}<br/>${formatCoord(s.lat, s.lon)}`,
        )
        .on("click", () => onSelectRef.current?.(s.id));
    });
    stormsLayerRef.current = layer.addTo(map);

    return () => {
      if (stormsLayerRef.current) stormsLayerRef.current.remove();
      stormsLayerRef.current = null;
    };
  }, [storms]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (coneLayerRef.current) coneLayerRef.current.remove();

    const layer = L.layerGroup();
    cone.forEach((c) => {
      const radiusMeters = c.radiusKm * 1000;
      L.circle([c.lat, c.lon], {
        radius: radiusMeters,
        color: "#0ea5e9",
        weight: 1.5,
        dashArray: "4 6",
        fillColor: "#38bdf8",
        fillOpacity: 0.16,
      }).addTo(layer);
    });
    coneLayerRef.current = layer.addTo(map);

    return () => {
      if (coneLayerRef.current) coneLayerRef.current.remove();
      coneLayerRef.current = null;
    };
  }, [cone]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
