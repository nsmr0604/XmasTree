import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

// 出典: 本プロジェクト独自実装。
// 処理: Canvas 2Dで床面文字を描き、Three.jsのテクスチャとして配置する。
export default function createFloorText(text, centerRadius, color) {
    const textSettings = settings.floorText;
    const canvas = document.createElement('canvas');
    canvas.width = textSettings.canvasWidth;
    canvas.height = textSettings.canvasHeight;
    const context = canvas.getContext('2d');
    context.font = textSettings.font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // キャンバス幅に収まらない文字はフォントサイズを縮小する。
    const measuredWidth = context.measureText(text).width;
    if (measuredWidth > canvas.width * textSettings.maxWidthRatio) {
        const fontSize = Math.floor(
            textSettings.fontSize * (canvas.width * textSettings.maxWidthRatio / measuredWidth)
        );
        context.font = textSettings.font.replace(
            `${textSettings.fontSize}px`,
            `${fontSize}px`
        );
    }
    context.lineJoin = 'round';
    context.lineWidth = textSettings.outlineWidth;
    context.strokeStyle = textSettings.outlineColor;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const textMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(
            canvas.width * textSettings.scale,
            canvas.height * textSettings.scale
        ),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    textMesh.name = `floor-text-${text.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    textMesh.rotation.x = -Math.PI / 2;
    textMesh.position.set(
        0,
        textSettings.y,
        centerRadius - textSettings.radiusOffset
    );
    return textMesh;
}

