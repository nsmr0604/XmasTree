// 出典: 本プロジェクト独自実装。3Dシーンの描画と画面操作を担う。
// 処理: 設定からシーンを構築し、アニメーション、カメラ、昼夜を管理する。舞台組み立てと印刷レイアウトは専用モジュールへ委譲する。
import * as THREE from '../three/three.module.js';
import createChristmasTree from './scene/christmas-tree.js';
import createLandscape from './scene/landscape.js';
import PrintLayout from './print-layout.js';

export default class SceneView {
    constructor(settings, canvas) {
        // Three.jsのシーンと常設オブジェクトを組み立て、描画環境を保持する。
        this.settings = settings;
        this.scene = new THREE.Scene();
        this.scene.name = 'christmas-scene';
        document.body.style.setProperty('--scene-background', settings.background.day);

        this.camera = new THREE.PerspectiveCamera(
            settings.camera.fov,
            window.innerWidth / window.innerHeight,
            settings.camera.near,
            settings.camera.far
        );
        this.cameraTarget = new THREE.Vector3(...settings.camera.homeTarget);
        this.camera.position.set(...settings.camera.homePosition);
        this.camera.lookAt(this.cameraTarget);

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            preserveDrawingBuffer: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const { tree, leaves } = createChristmasTree();
        this.tree = tree;
        this.leaves = leaves;
        this.scene.add(tree);

        this.floorRadius = settings.floor.radius;
        const landscape = createLandscape(this.scene);
        this.clockTower = landscape.clockTower;
        this.updateSnowfall = landscape.updateSnowfall;
        this.printLayout = new PrintLayout(this);

        const ambientLight = new THREE.AmbientLight(
            settings.lighting.ambientColor,
            settings.lighting.ambientIntensity
        );
        ambientLight.name = 'ambient-light';
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(
            settings.lighting.directionalColor,
            settings.lighting.directionalIntensity
        );
        directionalLight.name = 'directional-light';
        directionalLight.position.set(...settings.lighting.directionalPosition);
        this.scene.add(directionalLight);
    }

    render() {
        // 現在のカメラとシーンの状態をキャンバスへ描画する。
        this.renderer.render(this.scene, this.camera);
    }

    startAnimation() {
        // 雪と時計を更新してから各フレームを描画する。
        const animate = () => {
            requestAnimationFrame(animate);
            this.updateSnowfall();
            this.clockTower.updateTime();
            this.render();
        };
        animate();
    }

    resize() {
        // 表示領域に合わせて描画サイズとカメラの縦横比を更新する。
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.render();
    }

    moveCamera(key) {
        // 設定された操作キーに応じてカメラを水平移動または回転させる。
        const camera = this.camera;
        const controls = this.settings.controls;
        const keys = controls.keys;
        const moveStep = controls.moveStep;
        const minimumRadius = Math.max(
            ...this.leaves.map(leaf => leaf.userData.coneRadius)
        ) + this.settings.camera.minimumTreeClearance;

        if (key === keys.rotateLeft || key === keys.rotateRight) {
            const angle = THREE.MathUtils.degToRad(controls.rotateStepDegrees)
                * (key === keys.rotateLeft ? -1 : 1);
            const cosine = Math.cos(angle);
            const sine = Math.sin(angle);
            const x = camera.position.x;
            const z = camera.position.z;
            camera.position.x = x * cosine - z * sine;
            camera.position.z = x * sine + z * cosine;
        } else {
            const radial = camera.position.clone();
            radial.y = 0;
            const currentRadius = radial.length();
            radial.normalize();
            const radiusChange = key === keys.zoomIn ? -moveStep : moveStep;
            const nextRadius = THREE.MathUtils.clamp(
                currentRadius + radiusChange,
                minimumRadius,
                this.floorRadius * this.settings.camera.maximumFloorRadiusMultiplier
            );
            camera.position.x = radial.x * nextRadius;
            camera.position.z = radial.z * nextRadius;
        }
        camera.lookAt(this.cameraTarget);
        this.render();
    }

    setNight(isNight) {
        // 背景色とCSS状態を切り替える。
        document.body.classList.toggle('is-night', isNight);
        document.body.style.setProperty(
            '--scene-background',
            isNight ? this.settings.background.night : this.settings.background.day
        );
    }

    preparePrint(image, dateElement) {
        // 印刷レイアウトへA4縦構図での画像書き出しを委譲する。
        this.printLayout.prepare(image, dateElement);
    }

    restoreScreen() {
        // 印刷レイアウトへ画面表示への復帰を委譲する。
        this.printLayout.restore();
    }
}

