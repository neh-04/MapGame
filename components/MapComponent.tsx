import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GeoFeature, MapData, MapRegion } from '../types';

interface MapComponentProps {
  region: MapRegion;
  onRegionClick: (feature: GeoFeature) => void;
  highlightName: string | null;
  correctName: string | null;
  errorName: string | null;
  hintName?: string | null;
  showLabels?: boolean;
}

import { mapService } from '../services/mapService';

// ... imports remain same

const MapComponent: React.FC<MapComponentProps> = ({
  region,
  onRegionClick,
  correctName,
  errorName,
  hintName,
  showLabels = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  const [geoData, setGeoData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeRegion, setActiveRegion] = useState<MapRegion | null>(null);

  const colors = useMemo(() => [
    '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
  ], []);

  // Handle Resize (Keep same)
  useEffect(() => {
    // ... existing resize logic
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions(prev => {
          if (Math.abs(prev.width - width) < 5 && Math.abs(prev.height - height) < 5) return prev;
          return { width, height };
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Fetch Data (Updated to use Service)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await mapService.getMapData(region);
        let processedData: MapData = data;

        if (region === MapRegion.ASIA) {
          // ... filtering logic kept same
          const asiaCountries = ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"];
          processedData = {
            type: 'FeatureCollection',
            features: data.features.filter((f: any) => asiaCountries.includes(f.properties.name))
          };
        } else if (region === MapRegion.INDIA) {
          // ... processing logic kept same
          processedData.features = processedData.features.map((f: any) => ({
            ...f,
            properties: {
              ...f.properties,
              name: f.properties.NAME_1 || f.properties.name || f.properties.st_nm
            }
          }));
        }
        setGeoData(processedData);
        setActiveRegion(region);
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeRegion !== region) {
      fetchData();
    }
  }, [region, activeRegion]);

  // Initial Draw (Mount or Region/Size Change) - Expensive
  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    // Clear previous
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const projection = d3.geoMercator().fitSize([width, height], geoData as any);
    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append("g");
    gRef.current = g; // Save ref for updates

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        g.selectAll("path").attr("stroke-width", 1.5 / event.transform.k);
      });

    svg.call(zoom);

    // Filter for shadow
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "drop-shadow").attr("height", "130%");
    filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 3);
    filter.append("feOffset").attr("dx", 2).attr("dy", 2).attr("result", "offsetblur");
    filter.append("feComponentTransfer").append("feFuncA").attr("type", "linear").attr("slope", 0.3);
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "offsetblur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Draw Paths (Base State)
    g.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator as any)
      .attr("class", "country-path cursor-pointer")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .style("filter", "url(#drop-shadow)")
      .attr("fill", (d, i) => colors[i % colors.length]) // Initial color
      .on("click", (event, d) => {
        event.stopPropagation();
        onRegionClick(d);
      });

    // Draw Labels
    g.selectAll("text")
      .data(geoData.features)
      .join("text")
      .attr("transform", (d: any) => {
        const centroid = pathGenerator.centroid(d);
        if (isNaN(centroid[0]) || isNaN(centroid[1])) return "translate(-9999, -9999)";
        return `translate(${centroid[0]},${centroid[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text((d: any) => {
        const name = d.properties.name;
        // Logic for labels
        const area = pathGenerator.area(d);
        if (area < 300) return "";
        if (region === MapRegion.WORLD && area < 800) return "";
        return name && name.length > 15 ? name.substring(0, 12) + '...' : name;
      })
      .attr("class", "map-label")
      .style("font-family", "Fredoka")
      .style("font-size", "10px")
      .style("fill", "#1f2937")
      .style("pointer-events", "none")
      .style("text-shadow", "2px 0 rgba(255,255,255,0.8), -2px 0 rgba(255,255,255,0.8), 0 2px rgba(255,255,255,0.8), 0 -2px rgba(255,255,255,0.8)")
      .style("font-weight", "600")
      .style("opacity", showLabels ? 0.9 : 0); // Use opacity for transition

  }, [geoData, dimensions]); // Only redraw if data or size changes


  // Fast Updates (Color/Labels/Hints) - Cheap
  useEffect(() => {
    if (!gRef.current) return;
    const g = gRef.current;

    // Update Colors
    g.selectAll<SVGPathElement, GeoFeature>("path")
      .transition().duration(300) // Smooth transition
      .attr("fill", (d, i) => {
        const name = d.properties.name;
        if (name === correctName) return "#4ade80"; // Green
        if (name === errorName) return "#ef4444"; // Red
        return colors[i % colors.length];
      });

    // Hint Animation Logic
    g.selectAll<SVGPathElement, GeoFeature>("path")
      .on("end", null) // Stop previous loops
      .filter(d => {
        const name = d.properties.name;
        return !!(name && hintName && (name.toLowerCase() === hintName.toLowerCase() || name.includes(hintName)));
      })
      .transition().duration(500)
      .attr("fill", "#FDE047") // Yellow
      .transition().duration(500)
      .attr("fill", (d: any, i: number) => colors[i % colors.length])
      .on("end", function repeat(this: any) {
        d3.select(this)
          .transition().duration(500)
          .attr("fill", "#FDE047")
          .transition().duration(500)
          .attr("fill", (d: any, i: number) => colors[i % colors.length]) // Just reuse base color logic approx
          .on("end", repeat);
      });

    // Toggle Labels
    g.selectAll(".map-label")
      .style("opacity", (d: any) => {
        // Always show correct name label if defined
        if (d.properties.name === correctName) return 1;
        return showLabels ? 0.9 : 0;
      });

  }, [correctName, errorName, hintName, showLabels, colors]); // Runs on game interactions

  return (
    <div ref={containerRef} className="w-full h-full relative bg-sky-200 rounded-3xl overflow-hidden shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)] border-8 border-white touch-none">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-sm">
          <p className="text-3xl font-black text-sky-500 animate-bounce">Loading Map... 🌍</p>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full touch-none" style={{ cursor: 'grab' }} />
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs text-gray-500 pointer-events-none z-10">
        Pinch/Scroll to Zoom 🔍
      </div>
    </div>
  );
};

export default MapComponent;