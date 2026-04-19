import { getCurrentCar } from './carDatabase.js';
import { car, bounds, BODY_FRONT_RADIUS, BODY_REAR_RADIUS, MIRROR_WIDTH, MIRROR_LENGTH, MIRROR_OFFSET_X } from './physics.js';
import { lightenColor } from './utils.js';
import { BASE_SCALE, getZoomFactor, cameraMode } from './controls.js';
import { obstacles, roadLines, selectedObject } from './editor.js';
import { parseWheelRadiusToMeters } from './utils.js';

export const canvas = document.getElementById('parkingCanvas');
const ctx = canvas.getContext('2d');

export function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentScale = BASE_SCALE * getZoomFactor();
    applyCameraTransform(currentScale)

    drawGrid(currentScale);
    drawBoundary();
    roadLines.forEach(line => drawRoadLine(line, currentScale));
    obstacles.forEach(obs => drawObstacle(obs, currentScale));
    drawCar(ctx, getCurrentCar(), car.x, car.y, car.heading, currentScale, true);

    ctx.restore();
}

function applyCameraTransform(currentScale) {
    ctx.save();
    if (cameraMode != 'static') {
        // Center of canvas in screen pixels
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (cameraMode === 'follow') {
            ctx.translate(centerX, centerY);
            ctx.scale(1, 1); // optional flip if needed
            ctx.translate(-car.x * currentScale, -car.y * currentScale);
        } else if (cameraMode === 'followRotate') {
            // Translate to car position, then rotate so car's heading points UP (negative Y)
            ctx.translate(centerX, centerY);
            ctx.rotate(-car.heading - Math.PI / 2);
            ctx.translate(-car.x * currentScale, -car.y * currentScale);
        }
    }
}

function drawGrid(currentScale) {
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 0.05;

    const stepMeters = 1;
    for (let x = bounds.minX; x <= bounds.maxX; x += stepMeters) {
        const screenX = x * currentScale;
        ctx.beginPath();
        ctx.moveTo(screenX, bounds.minY * currentScale);
        ctx.lineTo(screenX, bounds.maxY * currentScale);
        ctx.stroke();
    }

    for (let y = bounds.minY; y <= bounds.maxY; y += stepMeters) {
        const screenY = y * currentScale;
        ctx.beginPath();
        ctx.moveTo(bounds.minX * currentScale, screenY);
        ctx.lineTo(bounds.maxX * currentScale, screenY);
        ctx.stroke();
    }

    ctx.restore();
}

function drawBoundary() {
    const currentScale = BASE_SCALE * getZoomFactor();

    const x1 = bounds.minX * currentScale;
    const y1 = bounds.minY * currentScale;
    const x2 = bounds.maxX * currentScale;
    const y2 = bounds.maxY * currentScale;

    ctx.save();
    ctx.strokeStyle = "#e67e22";
    ctx.lineWidth = 3.0;
    ctx.setLineDash([12, 16]);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.setLineDash([]);
    ctx.restore();
}

function drawCar(ctx, carSpec, x, y, heading, scale, isPlayer = true, colorOverride = null) {
    drawRoundedBody(ctx, carSpec, x, y, heading, scale, isPlayer, colorOverride);
    drawMirrors(ctx, carSpec, x, y, heading, scale, isPlayer, colorOverride)
    drawWheels(ctx, carSpec, x, y, heading, scale, isPlayer, colorOverride)
}

function drawRoundedBody(ctx, carSpec, x, y, heading, currentScale, isPlayer, colorOverride) {
    const carScreenX = x * currentScale;
    const carScreenY = y * currentScale;
    const w = carSpec.length * currentScale;
    const h = carSpec.width * currentScale;
    const rFront = BODY_FRONT_RADIUS * currentScale;
    const rRear = BODY_REAR_RADIUS * currentScale;
    const bodyColor = colorOverride ?? carSpec.color;
    const outlineColor = lightenColor(bodyColor);

    ctx.save();
    ctx.translate(carScreenX, carScreenY);
    ctx.rotate(heading);
    const halfW = w / 2, halfH = h / 2;

    ctx.beginPath();
    ctx.moveTo(halfW - rFront, -halfH);
    ctx.lineTo(-halfW + rRear, -halfH);
    ctx.quadraticCurveTo(-halfW, -halfH, -halfW, -halfH + rRear);
    ctx.lineTo(-halfW, halfH - rRear);
    ctx.quadraticCurveTo(-halfW, halfH, -halfW + rRear, halfH);
    ctx.lineTo(halfW - rFront, halfH);
    ctx.quadraticCurveTo(halfW, halfH, halfW, halfH - rFront);
    ctx.lineTo(halfW, -halfH + rFront);
    ctx.quadraticCurveTo(halfW, -halfH, halfW - rFront, -halfH);
    ctx.closePath();

    ctx.fillStyle = bodyColor;
    ctx.shadowBlur = 14; ctx.shadowColor = "#0f1a0e"; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = outlineColor; ctx.lineWidth = 2.5; ctx.stroke();

    // Windshield
    ctx.fillStyle = "#697c80";
    ctx.beginPath();
    ctx.moveTo(halfW * 0.50, -halfH * 0.85);
    ctx.quadraticCurveTo(
        halfW * 0.50 + halfW * 0.15, 0,
        halfW * 0.50, halfH * 0.85
    );
    ctx.lineTo(0.40 * halfH, halfH * 0.75);
    ctx.quadraticCurveTo(
        0.58 * halfH, 0,
        0.4 * halfH, -halfH * 0.75
    );
    ctx.lineTo(halfW * 0.50, -halfH * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = outlineColor; ctx.lineWidth = 2.5; ctx.stroke();

    // ---------- HEADLIGHTS ----------
    const headlightRadius = halfW * 0.15;
    const offsetX = halfW - rFront * 0.52;
    const offsetY = halfH * 0.55;

    ctx.fillStyle = isPlayer ? "#fff9e6" : "#7f8c8d";
    ctx.shadowBlur = isPlayer ? 15 : 5;
    ctx.shadowColor = isPlayer ? "#ffdd88" : "#2c3e50";

    ctx.beginPath();
    ctx.arc(offsetX, -offsetY, headlightRadius, -Math.PI / 2, 0);
    ctx.lineTo(offsetX, -offsetY);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(offsetX, offsetY, headlightRadius, 0, Math.PI / 2);
    ctx.lineTo(offsetX, offsetY);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawMirrors(ctx, carSpec, x, y, heading, currentScale, isPlayer, colorOverride) {
    const carScreenX = x * currentScale;
    const carScreenY = y * currentScale;
    const bodyColor = colorOverride ?? carSpec.color;
    const outlineColor = lightenColor(bodyColor);

    ctx.save();
    ctx.translate(carScreenX, carScreenY);
    ctx.rotate(heading);

    const mirrorW = MIRROR_WIDTH * currentScale;
    const mirrorL = MIRROR_LENGTH * currentScale;
    const halfBodyWidth = (carSpec.width / 2) * currentScale;
    const attachX = MIRROR_OFFSET_X * currentScale;

    function drawOneMirror(side) {
        const attachY = side * halfBodyWidth;

        ctx.save();
        ctx.translate(attachX, attachY);

        let yOffset = (side < 0) ? -mirrorL : 0;
        let height = mirrorL;

        ctx.fillStyle = bodyColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#0f1a0e";
        ctx.fillRect(0, yOffset, mirrorW, height);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(0, yOffset, mirrorW, height);
        ctx.restore();
    }

    drawOneMirror(-1);
    drawOneMirror(1);

    ctx.restore();
}

function drawWheels(ctx, carSpec, x, y, heading, currentScale, isPlayer, colorOverride) {
    const carScreenX = x * currentScale;
    const carScreenY = y * currentScale;
    ctx.save();
    ctx.translate(carScreenX, carScreenY);
    ctx.rotate(heading);

    const wheelBasePx = carSpec.wheelbase * currentScale;
    const trackPx = carSpec.track * currentScale;
    const wheelProfileHeight = 0.11;

    const tireRadiusM = parseWheelRadiusToMeters(carSpec.wheelRadius);
    const tireWidthPx = 0.215 * currentScale;
    const tireLengthPx = (tireRadiusM * 2 + wheelProfileHeight * 2) * currentScale;

    const frontOffset = wheelBasePx / 2;
    const rearOffset = -wheelBasePx / 2;
    const leftOffset = -trackPx / 2;
    const rightOffset = trackPx / 2;

    function drawWheel(xOff, yOff, angleDeg = 0) {
        ctx.save();
        ctx.translate(xOff, yOff);
        ctx.rotate((angleDeg * Math.PI) / 180);
        ctx.fillStyle = "#151915";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#020302";
        ctx.fillRect(-tireLengthPx / 2, -tireWidthPx / 2, tireLengthPx, tireWidthPx);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#5a625a";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-tireLengthPx / 2, -tireWidthPx / 2, tireLengthPx, tireWidthPx);
        ctx.fillStyle = "#2e352e";
        ctx.fillRect(-tireLengthPx * 0.3, -tireWidthPx * 0.4, tireLengthPx * 0.6, tireWidthPx * 0.8);
        ctx.restore();
    }

    const steer = isPlayer ? car.steerAngle : 0;
    drawWheel(rearOffset, leftOffset, 0);
    drawWheel(rearOffset, rightOffset, 0);
    drawWheel(frontOffset, leftOffset, steer);
    drawWheel(frontOffset, rightOffset, steer);

    ctx.restore();
}

function drawObstacle(obs, scale) {
    const screenX = obs.x * scale;
    const screenY = obs.y * scale;

    if (obs.type === 'cone') {
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#0f1a0e";

        const size = obs.radius * 2 * scale;

        ctx.fillStyle = '#e67e22';
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size / 2, -size / 2, size, size);

        const whiteRadius = obs.radius * 0.7 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, whiteRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ecf0f1';
        ctx.fill();
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1;
        ctx.stroke();

        const innerOrangeRadius = obs.radius * 0.4 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, innerOrangeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#e67e22';
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (obs.type === 'car') {
        const carSpec = obs.carSpec;
        drawCar(ctx, carSpec, obs.x, obs.y, obs.heading, scale, false, obs.color);
    }

    // Highlight if selected
    if (selectedObject && selectedObject.type === 'obstacle' &&
        obstacles[selectedObject.index] === obs) {
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(obs.heading);
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        if (obs.type === 'cone') {
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius * scale, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            const w = obs.length * scale;
            const h = obs.width * scale;
            ctx.strokeRect(-w / 2, -h / 2, w, h);
        }
        ctx.restore();
    }
}

function drawRoadLine(line, scale) {
    ctx.save();
    ctx.strokeStyle = line.color ?? '#ecf0f1';
    ctx.lineWidth = 0.2 * scale;
    if (line.type === 'dashed') {
        ctx.setLineDash([1 * scale, 3 * scale]);
    } else {
        ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(line.x1 * scale, line.y1 * scale);
    ctx.lineTo(line.x2 * scale, line.y2 * scale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}
