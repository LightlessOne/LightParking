import { drawScene } from "./drawing.js";
import { car, resetCarPosition, resetSteering } from "./physics.js";

export const BASE_SCALE = 28.0;
let zoomFactor = 1;
export const keys = { w: false, a: false, s: false, d: false, space: false };
export let cameraMode = 'follow';

const resetBtn = document.getElementById('reset-btn');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValueSpan = document.getElementById('zoom-value');
const steeringSpan = document.getElementById('steering-indicator');
const speedSpan = document.getElementById('speed-indicator');

export function initControlsListeners() {
    zoomSlider.addEventListener('input', updateZoom);
    zoomSlider.addEventListener('input', () => { zoomFactor = parseFloat(zoomSlider.value); zoomValueSpan.textContent = zoomFactor.toFixed(2) + 'x'; });

    resetBtn.addEventListener('click', resetCarPosition);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    document.addEventListener('DOMContentLoaded', () => {
        const cameraSelect = document.getElementById('camera-mode-select');
        if (cameraSelect) {
            cameraSelect.addEventListener('change', (e) => {
                cameraMode = e.target.value;
                e.target.blur();
            });
        }
    });
}

export function getZoomFactor() {
    return zoomFactor;
}

export function setZoomFactor(value) {
    zoomFactor = value;
}

function updateZoom() {
    setZoomFactor(parseFloat(zoomSlider.value));
    drawScene();
    updateUI();
}

export function updateUI() {
    const speedKmh = car.speed * 3.6;
    speedSpan.innerHTML = `${speedKmh.toFixed(1)} km/h`;

    const steerVal = car.steerAngle.toFixed(1);
    const arrow = car.steerAngle > 1.0 ? '→' : (car.steerAngle < -1.0 ? '←' : '↑');
    steeringSpan.innerHTML = `${steerVal}° ${arrow}`;

    zoomValueSpan.textContent = getZoomFactor().toFixed(2) + 'x';
}

export function handleKeyDown(e) {
    const code = e.code;
    const key = e.key;
    if (code.startsWith('Arrow') || code === 'Space' || key === ' ') {
        e.preventDefault();
    }
    switch (code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyD': keys.d = true; break;
        case 'Space': keys.space = true; break;
        case 'KeyR': resetSteering(); break;
    }
    switch (key) {
        case 'ArrowUp': keys.w = true; break;
        case 'ArrowDown': keys.s = true; break;
        case 'ArrowLeft': keys.a = true; break;
        case 'ArrowRight': keys.d = true; break;
    }
}

export function handleKeyUp(e) {
    const code = e.code;
    const key = e.key;
    if (code.startsWith('Arrow') || code === 'Space' || key === ' ') {
        e.preventDefault();
    }
    switch (code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyD': keys.d = false; break;
        case 'Space': keys.space = false; break;
    }
    switch (key) {
        case 'ArrowUp': keys.w = false; break;
        case 'ArrowDown': keys.s = false; break;
        case 'ArrowLeft': keys.a = false; break;
        case 'ArrowRight': keys.d = false; break;
    }
}
