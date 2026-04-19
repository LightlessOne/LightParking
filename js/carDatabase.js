import { populateObstacleDropdown } from './editor.js';

export const PRESET_CARS = [
    {
        id: 'j7',
        name: 'JAC J7',
        length: 4.77,
        width: 1.82,
        wheelbase: 2.760,
        track: 1.63,
        wheelRadius: 16,
        color: '#5A5E62',
        maxSteerAngle: 35.0,
    },
    {
        id: 'vitz',
        name: 'Toyota Vitz II',
        length: 3.750,
        width: 1.695,
        wheelbase: 2.460,
        track: 1.48,
        wheelRadius: 14,
        color: '#C0C2C5',
        maxSteerAngle: 35.0,
    },
    {
        id: 'camry',
        name: 'Toyota Camry',
        length: 4.90,
        width: 1.84,
        wheelbase: 2.825,
        track: 1.58,
        wheelRadius: 16,
        color: '#252525',
        maxSteerAngle: 35.0,
    },
    {
        id: 'outlander',
        name: 'Mitsubishi Outlander',
        length: 4.665,
        width: 1.80,
        wheelbase: 2.67,
        track: 1.54,
        wheelRadius: 18,
        color: '#C0C2C5',
        maxSteerAngle: 33.0,
    },
    {
        id: 'landcruiser',
        name: 'Toyota Land Cruiser',
        length: 4.95,
        width: 1.97,
        wheelbase: 2.85,
        track: 1.64,
        wheelRadius: 17,
        color: '#959525',
        maxSteerAngle: 38.0,
    },
    {
        id: 'mini',
        name: 'Mini Cooper',
        length: 3.85,
        width: 1.72,
        wheelbase: 2.49,
        track: 1.48,
        wheelRadius: 15,
        color: '#c0392b',
        maxSteerAngle: 38.0,
    }
];

export let customCars = [];
export let currentCar = null;

const carSelector = document.getElementById('car-selector');
const carDetailsDiv = document.getElementById('car-details');

export function initCarDatabaseListeners() {
    carSelector.addEventListener('change', (e) => { selectCar(e.target.value); e.target.blur(); });
    document.getElementById('add-car-btn').addEventListener('click', addCustomCar);
    document.getElementById('export-car-btn').addEventListener('click', exportCurrentCar);
    document.getElementById('import-car-btn').addEventListener('click', importCarFromJSON);
    document.getElementById('remove-car-btn').addEventListener('click', removeCurrentCar);
}

export function getCurrentCar() {
    return currentCar || PRESET_CARS[0];
}

export function addCustomCar() {
    const name = document.getElementById('new-car-name').value.trim() || 'Custom';
    const length = parseFloat(document.getElementById('new-car-length').value);
    const width = parseFloat(document.getElementById('new-car-width').value);
    const wheelbase = parseFloat(document.getElementById('new-car-wheelbase').value);
    const track = parseFloat(document.getElementById('new-car-track').value);
    const wheelRadius = document.getElementById('new-car-wheel-radius').value || 16;
    const color = document.getElementById('new-car-color').value;
    const maxSteer = parseFloat(document.getElementById('new-car-maxsteer').value) || 35.0;

    if (isNaN(length) || isNaN(width) || isNaN(wheelbase) || isNaN(track)) {
        alert('Please fill all numeric fields');
        return;
    }
    if (wheelbase >= length) { alert('Wheelbase must be less than length'); return; }
    if (track >= width) { alert('Track must be less than width'); return; }

    const newCar = {
        id: 'custom_' + Date.now(),
        name,
        length,
        width,
        wheelbase,
        track,
        wheelRadius,
        color,
        maxSteerAngle: maxSteer,
    };
    customCars.push(newCar);
    rebuildCarList();

    // Select the new car
    const allCars = [...PRESET_CARS, ...customCars];
    carSelector.value = allCars.length - 1;
    currentCar = newCar;
    updateCarDetailsUI();
}

// ----- Import/Export -----
export function exportCurrentCar() {
    const car = getCurrentCar();
    const exportData = JSON.stringify(car, null, 2);
    navigator.clipboard?.writeText(exportData).then(() => alert('Car JSON copied to clipboard'));
    document.getElementById('import-export-area').value = exportData;
}

export function importCarFromJSON() {
    const text = document.getElementById('import-export-area').value.trim();
    if (!text) return;
    try {
        const imported = JSON.parse(text);
        // Basic validation
        if (!imported.name || !imported.length) throw new Error('Invalid car data');
        imported.id = 'imported_' + Date.now();
        customCars.push(imported);
        rebuildCarList();
        const allCars = [...PRESET_CARS, ...customCars];
        carSelector.value = allCars.length - 1;
        currentCar = imported;
        updateCarDetailsUI();
        document.getElementById('import-export-area').value = '';
    } catch (e) {
        alert('Invalid JSON: ' + e.message);
    }
}

export function removeCurrentCar() {
    const car = getCurrentCar();
    const isPreset = PRESET_CARS.some(p => p.id === car.id);
    if (isPreset) {
        alert('Cannot remove preset cars.');
        return;
    }
    customCars = customCars.filter(c => c.id !== car.id);
    rebuildCarList();
    currentCar = [...PRESET_CARS, ...customCars][0];
    updateCarDetailsUI();
}

export function rebuildCarList() {
    const allCars = [...PRESET_CARS, ...customCars];
    carSelector.innerHTML = '';
    allCars.forEach((c, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = c.name;
        carSelector.appendChild(option);
    });
    if (currentCar) {
        const idx = allCars.findIndex(c => c.id === currentCar.id);
        carSelector.value = idx >= 0 ? idx : 0;
    } else {
        carSelector.value = 0;
        currentCar = allCars[0];
    }
    updateCarDetailsUI();
    populateObstacleDropdown();
}

function updateCarDetailsUI() {
    const c = getCurrentCar();
    carDetailsDiv.innerHTML = `
        <div style="display:flex; justify-content: space-between;">${c.length.toFixed(2)}m x ${c.width.toFixed(2)}m <div style="width:100px; height:24px; background:${c.color}; border-radius:4px; border:1px solid #aaa;"></div></div> 
        <div>Wheelbase: ${c.wheelbase.toFixed(2)}m · Track: ${c.track.toFixed(2)}m</div>
        <div>Tires: R${c.wheelRadius} · Max steer: ${c.maxSteerAngle}°</div>
      `;
}

function selectCar(index) {
    const allCars = [...PRESET_CARS, ...customCars];
    currentCar = allCars[index] || PRESET_CARS[0];
    updateCarDetailsUI();
}