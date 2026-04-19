import { PRESET_CARS, customCars } from './carDatabase.js';
import { BASE_SCALE, getZoomFactor, cameraMode } from './controls.js';
import { car } from './physics.js';
import { screenToWorld } from './utils.js'

export let obstacles = [];
export let roadLines = [];
export let selectedObject = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let isRotating = false;

const canvas = document.getElementById('parkingCanvas');

export function setObstacles(mapObstacles) {
    obstacles = mapObstacles;
}

export function setRoadLines(mapRoadLines) {
    roadLines = mapRoadLines;
}

export function addObstacle(typeValue) {
    const worldPos = screenToWorld(0.25, 0.25);
    const centerX = worldPos.x;
    const centerY = worldPos.y;

    if (typeValue === 'cone') {
        obstacles.push({
            type: 'cone',
            x: centerX,
            y: centerY,
            heading: 0,
            color: '#e67e22',
            radius: 0.3
        });
    } else if (typeValue.startsWith('car_')) {
        const carId = typeValue.replace('car_', '');
        const allCars = [...PRESET_CARS, ...customCars];
        const carSpec = allCars.find(c => c.id === carId);
        if (!carSpec) return;

        obstacles.push({
            type: 'car',
            carSpec: { ...carSpec }, // store a copy of the car's specs
            x: centerX,
            y: centerY,
            heading: 0,
            width: carSpec.width,
            length: carSpec.length,
            color: carSpec.color
        });
    }
}

export function initEditorListeners() {
    document.getElementById('add-object-btn').addEventListener('click', () => {
        const select = document.getElementById('obstacle-type-select');
        addObstacle(select.value);
    });
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    document.getElementById('delete-selected-btn').addEventListener('click', () => {
        if (!selectedObject) return;
        if (selectedObject.type === 'obstacle') {
            obstacles.splice(selectedObject.index, 1);
        } else {
            roadLines.splice(selectedObject.index, 1);
        }
        selectedObject = null;
        updateSelectedInfo();
    });
    document.getElementById('rotate-selected-btn').addEventListener('click', () => {
        if (selectedObject && selectedObject.type === 'obstacle') {
            obstacles[selectedObject.index].heading += Math.PI / 12;
        }
    });
    document.getElementById('clear-all-btn').addEventListener('click', () => {
        obstacles = [];
        roadLines = [];
        selectedObject = null;
        updateSelectedInfo();
    });
}

function getMouseWorldCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseCanvasX = (e.clientX - rect.left) * scaleX;
    const mouseCanvasY = (e.clientY - rect.top) * scaleY;
    const currentScale = BASE_SCALE * getZoomFactor();

    let worldX = mouseCanvasX / currentScale;
    let worldY = mouseCanvasY / currentScale;

    if (cameraMode !== 'static') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (cameraMode === 'follow') {
            worldX = (mouseCanvasX - centerX) / currentScale + car.x;
            worldY = (mouseCanvasY - centerY) / currentScale + car.y;
        } else if (cameraMode === 'followRotate') {
            let dx = mouseCanvasX - centerX;
            let dy = mouseCanvasY - centerY;

            const angle = -(-car.heading - Math.PI / 2);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const rotatedX = dx * cos - dy * sin;
            const rotatedY = dx * sin + dy * cos;

            worldX = rotatedX / currentScale + car.x;
            worldY = rotatedY / currentScale + car.y;
        }
    }

    return { x: worldX, y: worldY };
}

function onMouseDown(e) {
    const world = getMouseWorldCoords(e);

    let hitObstacle = false;
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (isPointInObstacle(world.x, world.y, obs)) {
            selectedObject = { type: 'obstacle', index: i };
            hitObstacle = true;
            isDragging = true;
            dragOffset.x = world.x - obs.x;
            dragOffset.y = world.y - obs.y;
            isRotating = e.shiftKey;
            break;
        }
    }

    if (!hitObstacle) {
        selectedObject = null;
    }
    updateSelectedInfo();
}

function onMouseMove(e) {
    const world = getMouseWorldCoords(e);

    if (isDragging && selectedObject) {
        if (selectedObject.type === 'obstacle') {
            const obs = obstacles[selectedObject.index];
            if (isRotating) {
                const dx = world.x - obs.x;
                const dy = world.y - obs.y;
                obs.heading = Math.atan2(dy, dx);
            } else {
                obs.x = world.x - dragOffset.x;
                obs.y = world.y - dragOffset.y;
            }
        }
    }
}

function onMouseUp(e) {
    isDragging = false;
    isRotating = false;
}

function isPointInObstacle(px, py, obs) {
    const cosH = Math.cos(-obs.heading);
    const sinH = Math.sin(-obs.heading);
    const dx = px - obs.x;
    const dy = py - obs.y;
    const localX = dx * cosH - dy * sinH;
    const localY = dx * sinH + dy * cosH;

    if (obs.radius) {
        return Math.abs(localX) <= obs.radius && Math.abs(localY) <= obs.radius;
    } else {
        return Math.abs(localX) <= obs.length / 2 && Math.abs(localY) <= obs.width / 2;
    }
}

function updateSelectedInfo() {
    const infoDiv = document.getElementById('selected-info');
    if (!selectedObject) {
        infoDiv.textContent = 'No object selected';
    } else if (selectedObject.type === 'obstacle') {
        infoDiv.textContent = `Selected: ${obstacles[selectedObject.index].type}`;
    } else {
        infoDiv.textContent = `Selected: ${roadLines[selectedObject.index].type} line`;
    }
}

export function populateObstacleDropdown() {
    const select = document.getElementById('obstacle-type-select');
    select.innerHTML = '<option value="cone">Traffic Cone</option>';
    const allCars = [...PRESET_CARS, ...customCars];
    allCars.forEach(car => {
        const option = document.createElement('option');
        option.value = `car_${car.id}`;
        option.textContent = `${car.name}`;
        select.appendChild(option);
    });
}
