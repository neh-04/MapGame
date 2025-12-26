import { MapRegion } from '../types';

const MAP_URLS = {
    [MapRegion.WORLD]: '/assets/maps/world.geojson',
    [MapRegion.INDIA]: '/assets/maps/india.geojson',
    [MapRegion.ASIA]: '/assets/maps/world.geojson', // Reuse world map
};

const cache: Record<string, any> = {};

export const mapService = {
    getMapData: async (region: MapRegion) => {
        const url = MAP_URLS[region];

        // Return cached if available
        if (cache[url]) {
            return JSON.parse(JSON.stringify(cache[url])); // Return copy to avoid mutation issues
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load map: ${url}`);

            const data = await response.json();

            // Store in cache
            cache[url] = data;
            return data;
        } catch (error) {
            console.error('Map loading error:', error);
            throw error;
        }
    },

    preloadMaps: () => {
        // Start fetching all maps in background
        Object.values(MapRegion).forEach(region => {
            mapService.getMapData(region as MapRegion).catch(err => {
                // Ignore errors during preload
                console.warn('Preload failed for', region);
            });
        });
    }
};
