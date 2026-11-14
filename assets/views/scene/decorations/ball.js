import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 生徒制作/学生A.js のカラーボールを参考に、本アプリ向けに再構成。
// 処理: 設定色の球体に金色の帯、キャップ、吊り輪を追加し、衝突回避半径を記録する。
export default function createBall(size, color) {
    const config = settings.decorations.ball;
    const decoration = new THREE.Group();
    decoration.name = 'decoration-ball';
    const material = new THREE.MeshStandardMaterial({
        color,
        metalness: config.metalness,
        roughness: config.roughness
    });

    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(size, ...config.segments),
        material
    );
    ball.name = 'decoration-ball-sphere';
    decoration.add(ball);

    // 球の表面に装飾帯を沿わせる。
    const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(
            size * config.stripeRadiusRatio,
            size * config.stripeTubeRadiusRatio,
            ...config.stripeSegments
        ),
        new THREE.MeshStandardMaterial({
            color: config.stripeColor,
            metalness: config.stripeMetalness,
            roughness: config.stripeRoughness
        })
    );
    stripe.name = 'decoration-ball-gold-stripe';
    stripe.position.z = size * Math.sqrt(
        1 - config.stripeRadiusRatio ** 2
    );
    decoration.add(stripe);

    const capMaterial = new THREE.MeshStandardMaterial({
        color: config.capColor,
        metalness: config.capMetalness,
        roughness: config.capRoughness
    });
    const cap = new THREE.Mesh(
        new THREE.SphereGeometry(
            size * config.capRadiusRatio,
            ...config.capSegments
        ),
        capMaterial
    );
    cap.name = 'decoration-ball-cap';
    cap.position.z = size * config.capDepthRatio;
    decoration.add(cap);

    const loop = new THREE.Mesh(
        new THREE.TorusGeometry(
            size * config.loopRadiusRatio,
            size * config.loopTubeRadiusRatio,
            ...config.loopSegments
        ),
        capMaterial
    );
    loop.name = 'decoration-ball-hanging-loop';
    loop.position.set(0, size * config.loopYRatio, size * config.loopDepthRatio);
    decoration.add(loop);
    decoration.userData.clearanceRadius = size * config.clearanceRatio;
    return decoration;
}

