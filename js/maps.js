import { PRESET_CARS } from './carDatabase.js';
import { setObstacles, setRoadLines } from "./editor.js";
import { resetCarPosition } from "./physics.js";

export const MAPS = [
    {
        id: 'empty',
        name: 'Empty',
        start: { x: 14, y: 14, heading: 0 },
        obstacles: [],
        roadLines: []
    },
    {
        id: 'sample1',
        name: 'Practice Course',
        start: { x: 10, y: 10, heading: 0 },
        obstacles: [
            { type: 'cone', x: 20, y: 10, heading: 0, radius: 0.3 },
            { type: 'cone', x: 22, y: 12, heading: 0, radius: 0.3 },
            { type: 'cone', x: 18, y: 12, heading: 0, radius: 0.3 },
            { type: 'car', carModelId: 'camry', x: 30, y: 15, heading: 1.57, color: "#ff0000" },
        ],
        roadLines: [
            { type: 'solid', x1: 5, y1: 5, x2: 15, y2: 5 },
            { type: 'dashed', x1: 5, y1: 25, x2: 35, y2: 25 },
        ]
    },
    {
        id: 'twoLane',
        name: '2-Lane Road',
        start: { x: 10, y: 19, heading: 0 },
        obstacles: [],
        roadLines: [
            { type: 'solid', x1: -5, y1: 13.5, x2: 75, y2: 13.5 },
            { type: 'dashed', x1: -5, y1: 17, x2: 75, y2: 17 },
            { type: 'solid', x1: -5, y1: 20.5, x2: 75, y2: 20.5 }
        ]
    },
    {
        id: 'fourLane',
        name: '4-Lane Highway',
        start: { x: 10, y: 22.5, heading: 0 },
        obstacles: [],
        roadLines: [
            { type: 'solid', x1: -5, y1: 10, x2: 75, y2: 10 },
            { type: 'dashed', x1: -5, y1: 13.5, x2: 75, y2: 13.5 },
            { type: 'solid', x1: -5, y1: 16.85, x2: 75, y2: 16.85 },
            { type: 'solid', x1: -5, y1: 17.15, x2: 75, y2: 17.15 },
            { type: 'dashed', x1: -5, y1: 20.5, x2: 75, y2: 20.5 },
            { type: 'solid', x1: -5, y1: 24, x2: 75, y2: 24 }
        ]
    },
    {
        id: 'small_crossroad',
        name: 'Small Crossroad',
        start: { x: 17, y: 19, heading: 0 },
        obstacles: [],
        roadLines: [
            // Horizontal road - left side (before intersection)
            { type: 'solid', x1: -5, y1: 13.5, x2: 20.5, y2: 13.5 },
            { type: 'dashed', x1: -5, y1: 17, x2: 20.5, y2: 17 },
            { type: 'solid', x1: -5, y1: 20.5, x2: 20.5, y2: 20.5 },
            // Horizontal road - right side (after intersection)
            { type: 'solid', x1: 27.5, y1: 13.5, x2: 75, y2: 13.5 },
            { type: 'dashed', x1: 27.5, y1: 17, x2: 75, y2: 17 },
            { type: 'solid', x1: 27.5, y1: 20.5, x2: 75, y2: 20.5 },
            // Vertical road - top side (above intersection)
            { type: 'solid', x1: 20.5, y1: -5, x2: 20.5, y2: 13.5 },
            { type: 'dashed', x1: 24, y1: -5, x2: 24, y2: 13.5 },
            { type: 'solid', x1: 27.5, y1: -5, x2: 27.5, y2: 13.5 },
            // Vertical road - bottom side (below intersection)
            { type: 'solid', x1: 20.5, y1: 20.5, x2: 20.5, y2: 75 },
            { type: 'dashed', x1: 24, y1: 20.5, x2: 24, y2: 75 },
            { type: 'solid', x1: 27.5, y1: 20.5, x2: 27.5, y2: 75 }
        ]
    },
    {
        id: 'big_crossroad',
        name: 'Big Crossroad',
        start: { x: 17, y: 19, heading: 0 },
        obstacles: [],
        roadLines: [
            // Horizontal road - left side (before intersection)
            { type: 'solid', x1: -5, y1: 13, x2: 20, y2: 13 },
            { type: 'dashed', x1: -5, y1: 17, x2: 20, y2: 17 },
            { type: 'solid', x1: -5, y1: 21, x2: 20, y2: 21 },
            // Horizontal road - right side (after intersection)
            { type: 'solid', x1: 28, y1: 13, x2: 75, y2: 13 },
            { type: 'dashed', x1: 28, y1: 17, x2: 75, y2: 17 },
            { type: 'solid', x1: 28, y1: 21, x2: 75, y2: 21 },
            // Vertical road - top side (above intersection)
            { type: 'solid', x1: 20, y1: -5, x2: 20, y2: 13 },
            { type: 'dashed', x1: 24, y1: -5, x2: 24, y2: 13 },
            { type: 'solid', x1: 28, y1: -5, x2: 28, y2: 13 },
            // Vertical road - bottom side (below intersection)
            { type: 'solid', x1: 20, y1: 21, x2: 20, y2: 75 },
            { type: 'dashed', x1: 24, y1: 21, x2: 24, y2: 75 },
            { type: 'solid', x1: 28, y1: 21, x2: 28, y2: 75 }
        ]
    },
    {
        id: 'parkingLotEmpty',
        name: 'Parking Lot Empty',
        start: { x: 19, y: 17, heading: 0 },
        obstacles: [],
        roadLines: [
            // Perimeter solid lines
            { type: 'solid', x1: 8, y1: 8, x2: 40, y2: 8 },
            { type: 'solid', x1: 8, y1: 8, x2: 8, y2: 26 },
            { type: 'solid', x1: 40, y1: 8, x2: 40, y2: 26 },
            { type: 'solid', x1: 8, y1: 26, x2: 40, y2: 26 },

            // Top stalls (7 stalls, extending downward from top edge)
            { type: 'solid', x1: 10, y1: 8, x2: 10, y2: 13 },
            { type: 'solid', x1: 12.5, y1: 8, x2: 12.5, y2: 13 },
            { type: 'solid', x1: 15, y1: 8, x2: 15, y2: 13 },
            { type: 'solid', x1: 17.5, y1: 8, x2: 17.5, y2: 13 },
            { type: 'solid', x1: 20, y1: 8, x2: 20, y2: 13 },
            { type: 'solid', x1: 22.5, y1: 8, x2: 22.5, y2: 13 },
            { type: 'solid', x1: 25, y1: 8, x2: 25, y2: 13 },
            { type: 'solid', x1: 27.5, y1: 8, x2: 27.5, y2: 13 },

            // Horizontal line at the end of top stalls
            { type: 'solid', x1: 10, y1: 13, x2: 27.5, y2: 13 },

            // Bottom stalls (7 stalls, extending upward from bottom edge)
            { type: 'solid', x1: 10, y1: 26, x2: 10, y2: 21 },
            { type: 'solid', x1: 12.5, y1: 26, x2: 12.5, y2: 21 },
            { type: 'solid', x1: 15, y1: 26, x2: 15, y2: 21 },
            { type: 'solid', x1: 17.5, y1: 26, x2: 17.5, y2: 21 },
            { type: 'solid', x1: 20, y1: 26, x2: 20, y2: 21 },
            { type: 'solid', x1: 22.5, y1: 26, x2: 22.5, y2: 21 },
            { type: 'solid', x1: 25, y1: 26, x2: 25, y2: 21 },
            { type: 'solid', x1: 27.5, y1: 26, x2: 27.5, y2: 21 },

            // Horizontal line at the end of bottom stalls
            { type: 'solid', x1: 10, y1: 21, x2: 27.5, y2: 21 }
        ]
    },
    {
        id: 'parkingLotWithCars',
        name: 'Parking Lot With Cars',
        start: { x: 19, y: 17, heading: 0 },
        obstacles: [
            { type: 'car', carModelId: 'camry', x: 11.3, y: 10.5, heading: 1.57, color: '#A5A5A5' },
            { type: 'car', carModelId: 'outlander', x: 13.8, y: 10.5, heading: 1.57, color: '#2C2C2C' },
            { type: 'car', carModelId: 'vitz', x: 16.3, y: 10.5, heading: 1.57, color: '#A5A5A5' },
            { type: 'car', carModelId: 'landcruiser', x: 21.3, y: 10.5, heading: 1.57, color: '#2C2C2C' },
            { type: 'car', carModelId: 'outlander', x: 11.3, y: 23.5, heading: -1.57, color: '#2C2C2C' },
            { type: 'car', carModelId: 'camry', x: 16.3, y: 23.5, heading: -1.57, color: '#A5A5A5' },
            { type: 'car', carModelId: 'vitz', x: 18.9, y: 23.5, heading: -1.57, color: '#A5A5A5' },
            { type: 'car', carModelId: 'landcruiser', x: 23.8, y: 23.5, heading: -1.57, color: '#2C2C2C' },
            { type: 'car', carModelId: 'camry', x: 28.9, y: 23.5, heading: -1.57, color: '#A5A5A5' }
        ],
        roadLines: [
            // Perimeter solid lines
            { type: 'solid', x1: 8, y1: 8, x2: 40, y2: 8 },
            { type: 'solid', x1: 8, y1: 8, x2: 8, y2: 26 },
            { type: 'solid', x1: 40, y1: 8, x2: 40, y2: 26 },
            { type: 'solid', x1: 8, y1: 26, x2: 40, y2: 26 },

            // Top stalls (7 stalls, extending downward from top edge)
            { type: 'solid', x1: 10, y1: 8, x2: 10, y2: 13 },
            { type: 'solid', x1: 12.5, y1: 8, x2: 12.5, y2: 13 },
            { type: 'solid', x1: 15, y1: 8, x2: 15, y2: 13 },
            { type: 'solid', x1: 17.5, y1: 8, x2: 17.5, y2: 13 },
            { type: 'solid', x1: 20, y1: 8, x2: 20, y2: 13 },
            { type: 'solid', x1: 22.5, y1: 8, x2: 22.5, y2: 13 },
            { type: 'solid', x1: 25, y1: 8, x2: 25, y2: 13 },
            { type: 'solid', x1: 27.5, y1: 8, x2: 27.5, y2: 13 },

            // Horizontal line at the end of top stalls
            { type: 'solid', x1: 10, y1: 13, x2: 27.5, y2: 13 },

            // Bottom stalls (7 stalls, extending upward from bottom edge)
            { type: 'solid', x1: 10, y1: 26, x2: 10, y2: 21 },
            { type: 'solid', x1: 12.5, y1: 26, x2: 12.5, y2: 21 },
            { type: 'solid', x1: 15, y1: 26, x2: 15, y2: 21 },
            { type: 'solid', x1: 17.5, y1: 26, x2: 17.5, y2: 21 },
            { type: 'solid', x1: 20, y1: 26, x2: 20, y2: 21 },
            { type: 'solid', x1: 22.5, y1: 26, x2: 22.5, y2: 21 },
            { type: 'solid', x1: 25, y1: 26, x2: 25, y2: 21 },
            { type: 'solid', x1: 27.5, y1: 26, x2: 27.5, y2: 21 },

            // Horizontal line at the end of bottom stalls
            { type: 'solid', x1: 10, y1: 21, x2: 27.5, y2: 21 }
        ]
    },
    {
        id: 'parallelParking',
        name: 'Parallel Parking',
        start: { x: 8, y: 25, heading: 0 },
        obstacles: [
            { type: 'car', carModelId: 'camry', x: 10.4, y: 21.5, heading: 0, color: '#2C2C2C' },
            { type: 'car', carModelId: 'outlander', x: 23, y: 21.5, heading: 0, color: '#A5A5A5' }
        ],
        roadLines: [
            { type: 'solid', x1: 4, y1: 20, x2: 44, y2: 20 },
        ]
    }
];

export let currentMap = MAPS[0];

export function initMapListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        populateMapSelect();
        const mapSelect = document.getElementById('map-select');
        mapSelect.addEventListener('change', (e) => {
            loadMap(e.target.value);
            e.target.blur();
        });
    });
}

function createCarObstacle(carModel, x, y, heading, color) {
    return {
        type: 'car',
        x, y, heading,
        carSpec: { ...carModel },
        width: carModel.width,
        length: carModel.length,
        color: color
    };
}

function loadMap(mapId) {
    const map = MAPS.find(m => m.id === mapId);
    if (!map) return;

    currentMap = map;
    resetCarPosition();

    const loadedObstacles = map.obstacles.map(obs => {
        if (obs.type === 'car' && obs.carModelId) {
            const carModel = PRESET_CARS.find(c => c.id === obs.carModelId);
            if (carModel) {
                return createCarObstacle(carModel, obs.x, obs.y, obs.heading, obs.color);
            }
        }
        return obs;
    });

    setObstacles(loadedObstacles);
    setRoadLines(map.roadLines);
}

function populateMapSelect() {
    const select = document.getElementById('map-select');
    select.innerHTML = '';
    MAPS.forEach(map => {
        const option = document.createElement('option');
        option.value = map.id;
        option.textContent = map.name;
        select.appendChild(option);
    });
    select.value = 'empty';
}