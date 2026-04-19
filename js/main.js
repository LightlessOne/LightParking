import { updatePhysics } from './physics.js';
import { drawScene } from './drawing.js';
import { rebuildCarList, initCarDatabaseListeners } from './carDatabase.js';
import { updateUI, initControlsListeners } from './controls.js';
import { initEditorListeners } from './editor.js';
import { initMapListeners } from './maps.js';

let lastTimestamp = 0;
function animationFrame(now) {
    requestAnimationFrame(animationFrame);

    if (lastTimestamp === 0) {
        lastTimestamp = now;
        return;
    }
    const dt = Math.min(0.025, (now - lastTimestamp) / 1000);
    if (dt > 0.001) {
        updatePhysics(dt);
    }

    drawScene();
    updateUI();
    lastTimestamp = now;
}

requestAnimationFrame(animationFrame);


function init() {
    rebuildCarList();
    initCarDatabaseListeners();
    initControlsListeners();
    initEditorListeners();
    initMapListeners();
}

init();
