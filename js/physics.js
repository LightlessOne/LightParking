import { getCurrentCar } from './carDatabase.js';
import { keys } from './controls.js';
import { obstacles } from './editor.js';
import { currentMap } from './maps.js';

export let car = { x: 0, y: 0, heading: 0, speed: 0, steerAngle: 0 }; resetCarPosition();
export const bounds = { minX: 1.0, maxX: 70.0, minY: 1.0, maxY: 63.0 };

const STEER_SPEED = 1.5;
const ACCEL_FORCE = 3.8;
const BRAKE_FORCE = 5.5;
const REVERSE_FORCE = 2.4;
const FRICTION = 1.2;
const MAX_SPEED = 25.0;
const HANDBRAKE_FORCE = 8.5;
const MIN_BOUNCE_SPEED = 2.0; // m/s (~1.8 km/h)
const BOUNCE_FACTOR = 0.4;

export const MIRROR_WIDTH = 0.18;
export const MIRROR_LENGTH = 0.28;
export const MIRROR_OFFSET_X = 0.7;
export const MIRROR_OFFSET_Y_FACTOR = 0.5; // multiplied by half width

export const BODY_FRONT_RADIUS = 0.85;
export const BODY_REAR_RADIUS = 0.6;

export function resetCarPosition() {
    car.x = currentMap.start.x; car.y = currentMap.start.y;
    car.heading = currentMap.start.heading;
    car.speed = 0; car.steerAngle = 0;
}

export function resetSteering() {
    car.steerAngle = 0;
}

export function updatePhysics(dt) {
    if (dt > 0.03) dt = 0.016;
    const c = getCurrentCar();

    // Steering
    if (keys.a) {
        car.steerAngle = Math.max(car.steerAngle - STEER_SPEED * dt * 60, -c.maxSteerAngle);
    }
    if (keys.d) {
        car.steerAngle = Math.min(car.steerAngle + STEER_SPEED * dt * 60, c.maxSteerAngle);
    }

    // Acceleration/Brake
    let accelInput = 0.0;
    if (keys.w) accelInput = ACCEL_FORCE;
    if (keys.s) {
        if (car.speed > 0.5) accelInput = -BRAKE_FORCE;
        else if (car.speed < -0.5) accelInput = -REVERSE_FORCE;
        else accelInput = -REVERSE_FORCE;
    }

    let handbrakeForce = 0.0;
    if (keys.space) {
        if (Math.abs(car.speed) > 0.1) handbrakeForce = -Math.sign(car.speed) * HANDBRAKE_FORCE;
        else car.speed = 0.0;
    }

    let frictionForce = Math.abs(car.speed) > 0.01 ? Math.sign(car.speed) * FRICTION : 0;
    const totalForce = accelInput + handbrakeForce - frictionForce;
    car.speed += totalForce * dt;
    car.speed = Math.min(Math.max(car.speed, -MAX_SPEED * 0.6), MAX_SPEED);
    if (Math.abs(car.speed) < 0.02 && !keys.w && !keys.s && !keys.space) car.speed = 0.0;

    // Steering geometry
    const steerRad = (car.steerAngle * Math.PI) / 180.0;
    if (Math.abs(car.speed) > 0.001) {
        const tanSteer = Math.tan(steerRad);
        const angularVel = (car.speed * tanSteer) / c.wheelbase;
        car.heading += angularVel * dt;
    }

    const dx = Math.cos(car.heading) * car.speed * dt;
    const dy = Math.sin(car.heading) * car.speed * dt;
    car.x += dx;
    car.y += dy;

    // Collision with boundary (uses current car dimensions)
    handleCollision(c);
}

// Collision (uses dynamic car specs)
function getCarCollisionPolygon(carSpec) {
    const points = [];
    const halfL = carSpec.length / 2;
    const halfW = carSpec.width / 2;
    const heading = car.heading;
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);

    function worldPoint(lx, ly) {
        return { x: car.x + lx * cosH - ly * sinH, y: car.y + lx * sinH + ly * cosH };
    }

    const rFront = BODY_FRONT_RADIUS;
    const rRear = BODY_REAR_RADIUS;
    const steps = 8;
    function addArcPoints(cx, cy, r, start, end) {
        for (let i = 0; i <= steps; i++) {
            const ang = start + (i / steps) * (end - start);
            points.push(worldPoint(cx + r * Math.cos(ang), cy + r * Math.sin(ang)));
        }
    }
    addArcPoints(halfL - rFront, halfW - rFront, rFront, 0, Math.PI / 2);
    addArcPoints(halfL - rFront, -halfW + rFront, rFront, -Math.PI / 2, 0);
    addArcPoints(-halfL + rRear, -halfW + rRear, rRear, Math.PI, 3 * Math.PI / 2);
    addArcPoints(-halfL + rRear, halfW - rRear, rRear, Math.PI / 2, Math.PI);

    // Mirrors
    // const mirrorY = halfW + MIRROR_WIDTH / 2;
    // const mirrorLeft = [
    //     { x: MIRROR_OFFSET_X, y: -mirrorY },
    //     { x: MIRROR_OFFSET_X + MIRROR_LENGTH, y: -mirrorY },
    //     { x: MIRROR_OFFSET_X + MIRROR_LENGTH, y: -halfW },
    //     { x: MIRROR_OFFSET_X, y: -halfW }
    // ];
    // const mirrorRight = [
    //     { x: MIRROR_OFFSET_X, y: mirrorY },
    //     { x: MIRROR_OFFSET_X + MIRROR_LENGTH, y: mirrorY },
    //     { x: MIRROR_OFFSET_X + MIRROR_LENGTH, y: halfW },
    //     { x: MIRROR_OFFSET_X, y: halfW }
    // ];
    // [...mirrorLeft, ...mirrorRight].forEach(p => points.push(worldPoint(p.x, p.y)));
    return points;
}

function handleCollision(carSpec) {
    const polygon = getCarCollisionPolygon(carSpec);

    // Boundary collision
    let collision = polygon.some(p => p.x < bounds.minX || p.x > bounds.maxX || p.y < bounds.minY || p.y > bounds.maxY);

    // Obstacle collision
    if (!collision) {
        for (let obs of obstacles) {
            if (checkPolygonCollision(polygon, obs)) {
                collision = true;
                break;
            }
        }
    }

    if (collision) {
        car.x -= Math.cos(car.heading) * car.speed * 0.016;
        car.y -= Math.sin(car.heading) * car.speed * 0.016;
        if (Math.abs(car.speed) > MIN_BOUNCE_SPEED) {
            car.speed = -car.speed * BOUNCE_FACTOR;
        } else {
            car.speed = 0;
        }
    }
}

function checkPolygonCollision(carPoly, obs) {
    if (obs.type === 'cone') {
        // Check distance from car polygon points to cone center
        const coneRadius = obs.radius;
        for (let p of carPoly) {
            const dx = p.x - obs.x;
            const dy = p.y - obs.y;
            if (Math.sqrt(dx * dx + dy * dy) <= coneRadius) {
                return true;
            }
        }
        return false;
    } else {
        // Car obstacle: same as before (AABB check)
        const obsHalfL = obs.length / 2;
        const obsHalfW = obs.width / 2;
        const cosH = Math.cos(-obs.heading);
        const sinH = Math.sin(-obs.heading);

        for (let p of carPoly) {
            const dx = p.x - obs.x;
            const dy = p.y - obs.y;
            const localX = dx * cosH - dy * sinH;
            const localY = dx * sinH + dy * cosH;
            if (Math.abs(localX) <= obsHalfL && Math.abs(localY) <= obsHalfW) {
                return true;
            }
        }
        return false;
    }
}