import fs from 'fs';
import path from 'path';

const inputFile = path.join(process.cwd(), 'public/assets/maps/india.geojson');
const outputFile = path.join(process.cwd(), 'public/assets/maps/india.geojson'); // Overwrite

function optimizeGeoJSON() {
    console.log(`Reading ${inputFile}...`);
    const raw = fs.readFileSync(inputFile, 'utf-8');
    const data = JSON.parse(raw);

    console.log('Optimizing coordinates...');

    const processCoords = (coords) => {
        if (typeof coords[0] === 'number') {
            return coords.map(n => Math.round(n * 1000) / 1000); // 3 decimal places
        }
        return coords.map(processCoords);
    };

    if (data.features) {
        data.features.forEach(f => {
            if (f.geometry && f.geometry.coordinates) {
                f.geometry.coordinates = processCoords(f.geometry.coordinates);
            }
            // Remove unnecessary properties if needed, but keeping name/ID is usually enough
        });
    }

    console.log(`Writing optimized file to ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(data));

    const stats = fs.statSync(outputFile);
    console.log(`Done! New size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

optimizeGeoJSON();
