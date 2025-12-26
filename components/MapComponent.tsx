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

const MAP_URLS = {
  [MapRegion.WORLD]: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
  [MapRegion.INDIA]: 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson',
  [MapRegion.ASIA]: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
};

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
  const [geoData, setGeoData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const colors = useMemo(() => [
    '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
  ], []);

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Only update if dimensions actually changed to avoid loop
        setDimensions(prev => {
            if (prev.width === width && prev.height === height) return prev;
            return { width, height };
        });
      }
    };

    // Initial measurement
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" error
      window.requestAnimationFrame(() => {
        updateDimensions();
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(MAP_URLS[region]);
        const data = await response.json();
        let processedData: MapData = data;

        if (region === MapRegion.ASIA) {
           const asiaCountries = ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"];
           processedData = {
             type: 'FeatureCollection',
             features: data.features.filter((f: any) => asiaCountries.includes(f.properties.name))
           };
        } else if (region === MapRegion.INDIA) {
            processedData.features = processedData.features.map(f => ({
                ...f,
                properties: {
                    ...f.properties,
                    name: f.properties.NAME_1 || f.properties.name || f.properties.st_nm 
                }
            }));
        }
        setGeoData(processedData);
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

  // Render D3 Map
  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const projection = d3.geoMercator().fitSize([width, height], geoData as any);
    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // 1x to 8x zoom
      .translateExtent([[0, 0], [width, height]]) // Limit panning roughly to container
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        // Semantic zoom: adjust stroke width based on zoom level
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

    // Draw Countries/States
    g.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator as any)
      .attr("class", "country-path cursor-pointer")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .style("filter", "url(#drop-shadow)")
      .attr("fill", (d, i) => {
         const name = d.properties.name;
         if (name === correctName) return "#4ade80"; // Bright Green
         if (name === errorName) return "#ef4444"; // Bright Red
         return colors[i % colors.length];
      })
      .on("click", (event, d) => {
          event.stopPropagation(); // prevent zoom trigger if conflict
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
         // Hide labels if showLabels is false, but allow the correctly found one to show as a reward
         if (!showLabels && name !== correctName) return "";

         // Calculate approximate area to decide if we show text
         // This prevents clutter on tiny islands
         const area = pathGenerator.area(d);
         // Lower threshold for zoomed in interaction, but initial view needs to be clean
         if (area < 800 && region === MapRegion.WORLD) return ""; 
         if (area < 300) return ""; 
         
         // Shorten very long names for display if needed
         return name && name.length > 15 ? name.substring(0, 12) + '...' : name;
      })
      .style("font-family", "Fredoka")
      .style("font-size", "10px") // Base size
      .style("fill", "#1f2937") // Gray-800
      .style("pointer-events", "none") // Click through text
      .style("text-shadow", "2px 0 rgba(255,255,255,0.8), -2px 0 rgba(255,255,255,0.8), 0 2px rgba(255,255,255,0.8), 0 -2px rgba(255,255,255,0.8)")
      .style("font-weight", "600")
      .style("opacity", 0.9);

    // Hint Animation
    if (hintName) {
        g.selectAll("path")
          .filter((d: any) => {
              const name = d.properties.name;
              return name && hintName && (name.toLowerCase() === hintName.toLowerCase() || name.includes(hintName));
          })
          .transition().duration(500)
          .attr("fill", "#FDE047")
          .transition().duration(500)
          .attr("fill", (d: any, i) => colors[i % colors.length])
          .on("end", function repeat(this: any) {
              d3.select(this)
                 .transition().duration(500)
                 .attr("fill", "#FDE047")
                 .transition().duration(500)
                 .attr("fill", (d: any) => "#FDE047") // Simplify for loop
                 .on("end", repeat);
          });
    }

  }, [geoData, region, colors, correctName, errorName, onRegionClick, hintName, showLabels, dimensions]);

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