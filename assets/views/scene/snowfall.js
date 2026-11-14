import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

// 出典: 本プロジェクト独自実装。
// 処理: 設定数の雪粒子を生成し、床の範囲内で風と揺れを加えて更新する。
export default function createSnowfall(scene, floorRadius, floorTopY) {
    const config = settings.snowfall;
    const snowTexture = createSnowTexture(config.texture);
    const snowLayers = config.layers.map((layer, layerIndex) => {
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(layer.count * 3);
        const snowData = [];

        // 各粒子の位置と運動量を保持し、次フレームの更新に使う。
        for (let i = 0; i < layer.count; i++) {
            placeInsideFloor(snowPositions, i, floorRadius, floorTopY);
            snowPositions[i * 3 + 1] += Math.random() * config.height;

            const isBlown = Math.random() < config.windProbability;
            snowData.push({
                speedY: randomBetween(config.speedY) * layer.speedMultiplier,
                windX: isBlown ? randomBetween(config.windX) : 0,
                windZ: isBlown ? randomBetween(config.windZ) : 0,
                angle: Math.random() * Math.PI * 2,
                swingSpeed: randomBetween(config.swingSpeed),
                isBlown
            });
        }

        snowGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(snowPositions, 3)
        );
        const snowMaterial = new THREE.PointsMaterial({
            color: config.color,
            map: snowTexture,
            size: layer.size,
            transparent: true,
            opacity: layer.opacity,
            alphaTest: config.alphaTest,
            depthWrite: false
        });
        const snowSystem = new THREE.Points(snowGeometry, snowMaterial);
        snowSystem.name = `snowfall-particles-${layerIndex + 1}`;
        scene.add(snowSystem);
        return { count: layer.count, geometry: snowGeometry, data: snowData };
    });

    return function updateSnowfall() {
        // 粒子が床面または床の外周を越えたら、床上の新しい位置へ戻す。
        for (const layer of snowLayers) {
            const positions = layer.geometry.attributes.position.array;
            for (let i = 0; i < layer.count; i++) {
                const data = layer.data[i];
                positions[i * 3 + 1] -= data.speedY;
                data.angle += data.swingSpeed;

                if (data.isBlown) {
                    positions[i * 3] += data.windX
                        + Math.sin(data.angle) * config.swingAmplitude;
                    positions[i * 3 + 2] += data.windZ
                        + Math.cos(data.angle) * config.swingAmplitude;
                } else {
                    positions[i * 3] += Math.sin(data.angle) * config.driftAmplitude;
                    positions[i * 3 + 2] += Math.cos(data.angle) * config.driftAmplitude;
                }

                const x = positions[i * 3];
                const z = positions[i * 3 + 2];
                if (
                    positions[i * 3 + 1] < floorTopY
                    || x * x + z * z > floorRadius * floorRadius
                ) {
                    placeInsideFloor(positions, i, floorRadius, floorTopY);
                    positions[i * 3 + 1] += config.height;
                }
            }
            layer.geometry.attributes.position.needsUpdate = true;
        }
    };
}

function randomBetween([minimum, range]) {
    return minimum + Math.random() * range;
}

function placeInsideFloor(positions, index, radius, floorTopY) {
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * Math.sqrt(Math.random());
    positions[index * 3] = Math.cos(angle) * distance;
    positions[index * 3 + 1] = floorTopY;
    positions[index * 3 + 2] = Math.sin(angle) * distance;
}

function createSnowTexture(config) {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    const context = canvas.getContext('2d');
    const center = config.size / 2;

    const glow = context.createRadialGradient(
        center,
        center,
        config.glowInnerRadius,
        center,
        center,
        config.glowOuterRadius
    );
    glow.addColorStop(0, config.glowInnerColor);
    glow.addColorStop(1, config.glowOuterColor);
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = config.strokeColor;
    context.lineWidth = config.lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (let arm = 0; arm < config.armCount; arm++) {
        const angle = arm * Math.PI * 2 / config.armCount;
        const endX = center + Math.cos(angle) * config.armLength;
        const endY = center + Math.sin(angle) * config.armLength;
        context.beginPath();
        context.moveTo(center, center);
        context.lineTo(endX, endY);

        const branchX = center + Math.cos(angle) * config.branchDistance;
        const branchY = center + Math.sin(angle) * config.branchDistance;
        for (const side of [-1, 1]) {
            const branchAngle = angle + side * config.branchAngleRadians;
            context.moveTo(branchX, branchY);
            context.lineTo(
                branchX + Math.cos(branchAngle) * config.branchLength,
                branchY + Math.sin(branchAngle) * config.branchLength
            );
        }
        context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

