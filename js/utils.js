import { canvas } from "./drawing.js";
import { car } from "./physics.js";
import { BASE_SCALE, getZoomFactor, cameraMode } from './controls.js';

export function lightenColor(color, percent = 0.15) {
    // HEX to RGB
    let r, g, b;
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16) / 255;
            g = parseInt(hex[1] + hex[1], 16) / 255;
            b = parseInt(hex[2] + hex[2], 16) / 255;
        } else {
            r = parseInt(hex.slice(0, 2), 16) / 255;
            g = parseInt(hex.slice(2, 4), 16) / 255;
            b = parseInt(hex.slice(4, 6), 16) / 255;
        }
    } else {
        return '#ff0000'; // fallback
    }

    // RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Modify lightness: increase by percent, but cap at 0.9 to avoid pure white
    l = Math.min(l + percent, 0.9);
    //s = Math.min(s * 1.1, 1.0);

    // HSL back to RGB
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    let r1, g1, b1;
    if (s === 0) {
        r1 = g1 = b1 = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r1 = hue2rgb(p, q, h + 1 / 3);
        g1 = hue2rgb(p, q, h);
        b1 = hue2rgb(p, q, h - 1 / 3);
    }

    // Convert to hex
    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

export function parseWheelRadiusToMeters(radius) {
    const inches = radius
    return (inches * 0.0254) / 2;
}

export function screenToWorld(x_percent, y_percent) {
    const screenX = canvas.width * x_percent;
    const screenY = canvas.height * y_percent;
    const currentScale = BASE_SCALE * getZoomFactor();
    let worldX = screenX / currentScale;
    let worldY = screenY / currentScale;

    if (cameraMode !== 'static') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (cameraMode === 'follow') {
            worldX = (screenX - centerX) / currentScale + car.x;
            worldY = (screenY - centerY) / currentScale + car.y;
        } else if (cameraMode === 'followRotate') {
            let dx = screenX - centerX;
            let dy = screenY - centerY;
            const angle = -(-car.heading - Math.PI / 2); // invert camera rotation
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