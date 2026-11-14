// 出典: 本プロジェクト独自実装。個別オブジェクトの参考元は生成モジュールに記載。
// 処理: 設定から床・家・サンタ・時計塔・床ギフト・降雪の舞台を組み立て、シーンへ追加する。
import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';
import createBrickFloor from './brick-floor.js';
import createFloorText from './floor-text.js';
import createHouse from './house.js';
import createSanta from './santa.js';
import createClockTower from './clock-tower.js';
import createFloorGiftBoxes from './floor-gift-boxes.js';
import createSnowfall from './snowfall.js';

export default function createLandscape(scene) {
    // 床面上の高さを基準に各オブジェクトを配置し、常時更新する対象を返す。
    const floorTopY = settings.floor.topY;
    const floorRadius = settings.floor.radius;
    const landscape = new THREE.Group();
    landscape.name = 'landscape';
    landscape.add(createBrickFloor(floorRadius, floorTopY));

    const house = createHouse(floorTopY);
    scene.add(house);
    settings.floorText.items.forEach(({ text, radius, color }) => {
        landscape.add(createFloorText(text, radius, color));
    });

    const santa = createSanta();
    santa.scale.set(...settings.santa.scale);
    santa.position.set(
        settings.santa.position[0],
        floorTopY + settings.santa.position[1],
        settings.santa.position[2]
    );
    landscape.add(santa);

    const clockTower = createClockTower(floorTopY);
    landscape.add(clockTower.group);
    scene.add(landscape);
    scene.add(createFloorGiftBoxes(floorTopY, house));
    const updateSnowfall = createSnowfall(scene, floorRadius, floorTopY);

    return { clockTower, updateSnowfall };
}
