import { useEffect, useRef, useState } from "react";
import mapboxgl, { type LngLatLike } from "mapbox-gl";
import axios from "axios";
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = "pk.eyJ1IjoibGVnb2xvdmUwOCIsImEiOiJjbWhuMGtncHIyOTBrMmxwcWNvbHBoOHN5In0.Xeo7cg0pgka1Onzb143daQ";

interface ScheduleItem {
  type: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  visit_time: string;
  reason: string;
  cuisine_type?: string | null;
  meal_time?: string | null;
  accommodation_type?: string | null;
}

interface DailyPlan {
  day: number;
  date: string;
  schedule: ScheduleItem[];
  summary: string;
}

export interface Plans {
  daily_plans: DailyPlan[];
}

interface MapboxRouteProps {
  plans: Plans;
}

export default function MapboxRoute({ plans }: MapboxRouteProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const renderRoute = async (dayIndex: number) => {
    if (!plans) return;
    const dailyPlan = plans.daily_plans[dayIndex];
    if (!dailyPlan || !mapInstance.current) return;

    const coordinates: LngLatLike[] = dailyPlan.schedule.map(p => [p.longitude, p.latitude]);
    const coordString = coordinates.map(c => (c as [number, number]).join(",")).join(";");

    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordString}`;
    const res = await axios.get(url, {
      params: {
        alternatives: true,
        geometries: "geojson",
        overview: "full",
        steps: true,
        language: "ko",
        access_token: mapboxgl.accessToken,
      },
    });

    const route = res.data.routes[0].geometry;

    // Remove existing route layer and source
    if (mapInstance.current.getLayer("route-line")) {
      mapInstance.current.removeLayer("route-line");
    }
    if (mapInstance.current.getSource("route")) {
      mapInstance.current.removeSource("route");
    }

    // Add route polyline
    mapInstance.current.addSource("route", {
      type: "geojson",
      data: { type: "Feature", geometry: route, properties: {} },
    });
    mapInstance.current.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-width": 4, "line-color": "#141414" },
    });

    // Clear previous markers
    clearMarkers();

    // Add numbered markers
// 마커 반복문 안
// 마커 반복문 안
    dailyPlan.schedule.forEach((place, index) => {
    // 커스텀 div 생성
    const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerText = (index + 1).toString();
        el.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        el.style.border = '1px solid rgba(0, 0, 0, 0.1)';
        el.style.color = 'black';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = '400';
        

        const marker = new mapboxgl.Marker(el)
            .setLngLat([place.longitude, place.latitude]) 
            .addTo(mapInstance.current!);

        markersRef.current.push(marker);
    });


    // NavigationControl은 반복문 밖에서 한 번만
    mapInstance.current!.addControl(new mapboxgl.NavigationControl());


    // Fit map to route bounds
    const bounds = coordinates.reduce(
      (b, coord) => b.extend(coord),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );
    mapInstance.current.fitBounds(bounds, { padding: 50 });
  };

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [127.1699834, 35.31719414],
        zoom: 12,
      });

      mapInstance.current.on('load', () => {
        renderRoute(selectedDay);
      });
    } else {
      renderRoute(selectedDay);
    }
  }, [plans, selectedDay]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        {plans?.daily_plans.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              marginRight: 5,
              padding: '5px 10px',
              backgroundColor: selectedDay === index ? '#4CAF50' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 4
            }}
          >
            {day.day}일차
          </button>
        ))}
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: 10, overflow: 'hidden' }} />
    </div>
  );
}