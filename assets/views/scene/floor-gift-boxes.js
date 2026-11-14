import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';
import createGiftBox from './gift-box.js';

// 出典: 本プロジェクト独自実装。床ギフトの配置条件と個数決定を担う。
// 処理: 家などとの重なりを避けて床の前後へ箱を配置する。
function randomBetween(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
}

function isWithinFloor(bounds, floorRadius) {
    for (const x of [bounds.min.x, bounds.max.x]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
            if (Math.hypot(x, z) > floorRadius) {
                return false;
            }
        }
    }
    return true;
}

function isOutsideCanopy(bounds, canopyRadius) {
    const closestX = Math.max(bounds.min.x, Math.min(0, bounds.max.x));
    const closestZ = Math.max(bounds.min.z, Math.min(0, bounds.max.z));
    return Math.hypot(closestX, closestZ) >= canopyRadius;
}

function isAvailable(bounds, houseBounds, placedBounds, floorRadius, canopyRadius) {
    // 床・葉・家・既配置ギフトのいずれかに重なる候補を除外する。
    if (
        !isWithinFloor(bounds, floorRadius)
        || !isOutsideCanopy(bounds, canopyRadius)
        || bounds.intersectsBox(houseBounds)
    ) {
        return false;
    }
    return placedBounds.every(placed => !bounds.intersectsBox(placed));
}

function addGiftBoxes(parent, countRange, positions, floorTopY, houseBounds, floorRadius, canopyRadius, placedBounds) {
    // 家の前にあらかじめ用意した位置を順序を変えて試す。
    const [minimumCount, maximumCount] = countRange;
    const shuffledPositions = [...positions];
    for (let index = shuffledPositions.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffledPositions[index], shuffledPositions[swapIndex]] = [
            shuffledPositions[swapIndex],
            shuffledPositions[index]
        ];
    }
    const config = settings.floorGiftBoxes;
    const [minimumSize, maximumSize] = config.sizeRange;
    const requestedCount = Math.floor(randomBetween(minimumCount, maximumCount + 1));

    for (const [x, z] of shuffledPositions) {
        if (parent.children.length >= requestedCount) break;
        const variant = config.variants[
            Math.floor(Math.random() * config.variants.length)
        ];
        const size = randomBetween(minimumSize, maximumSize);
        const gift = createGiftBox(
            size,
            variant.boxColor,
            variant.ribbonColor,
            floorTopY
        );
        gift.position.x = x;
        gift.position.z = z;
        gift.updateMatrixWorld(true);
        const giftBounds = new THREE.Box3().setFromObject(gift);
        if (!isAvailable(giftBounds, houseBounds, placedBounds, floorRadius, canopyRadius)) {
            continue;
        }
        gift.name = `floor-gift-box-${parent.name}-${parent.children.length + 1}`;
        parent.add(gift);
        placedBounds.push(giftBounds);
    }
}

function addRandomBehindTreeGiftBoxes(parent, countRange, floorTopY, houseBounds, floorRadius, canopyRadius, placedBounds) {
    // ツリー後方を中心とする内側から候補を取り、条件を満たす位置だけ採用する。
    const config = settings.floorGiftBoxes;
    const [minimumSize, maximumSize] = config.sizeRange;
    const [minimumCount, maximumCount] = countRange;
    const requestedCount = Math.floor(randomBetween(minimumCount, maximumCount + 1));
    const centerZ = -floorRadius * config.rearCenterDepthRatio;
    const radius = floorRadius * config.rearCenterDepthRatio;

    for (let index = 0; index < requestedCount; index++) {
        const variant = config.variants[
            Math.floor(Math.random() * config.variants.length)
        ];
        const size = randomBetween(minimumSize, maximumSize);
        const gift = createGiftBox(
            size,
            variant.boxColor,
            variant.ribbonColor,
            floorTopY
        );
        let giftPlaced = false;

        for (let attempt = 0; attempt < config.rearPlacementAttempts; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * Math.sqrt(Math.random());
            gift.position.x = Math.sin(angle) * distance;
            gift.position.z = centerZ - Math.cos(angle) * distance;
            gift.updateMatrixWorld(true);
            const giftBounds = new THREE.Box3().setFromObject(gift);

            if (!isAvailable(giftBounds, houseBounds, placedBounds, floorRadius, canopyRadius)) {
                continue;
            }

            gift.name = `floor-gift-box-${parent.name}-${parent.children.length + 1}`;
            parent.add(gift);
            placedBounds.push(giftBounds);
            giftPlaced = true;
            break;
        }

        if (!giftPlaced) {
            throw new Error('床の内側に床のギフトボックスを配置できませんでした。');
        }
    }
}

export default function createFloorGiftBoxes(floorTopY, house) {
    // 家の境界と葉の投影範囲を先に計算し、配置判定に共有する。
    const config = settings.floorGiftBoxes;
    const floorRadius = settings.floor.radius;
    const canopyRadius = Math.max(...settings.tree.leaves.map(leaf => leaf.radius))
        + config.leafClearance;
    const houseBounds = new THREE.Box3()
        .setFromObject(house)
        .expandByScalar(config.houseClearance);
    const placedBounds = [];
    const group = new THREE.Group();
    group.name = 'floor-gift-boxes';

    const behindTree = new THREE.Group();
    behindTree.name = 'floor-gift-boxes-behind-tree';
    addRandomBehindTreeGiftBoxes(
        behindTree,
        config.behindTreeCountRange,
        floorTopY,
        houseBounds,
        floorRadius,
        canopyRadius,
        placedBounds
    );
    group.add(behindTree);

    const houseFront = new THREE.Group();
    houseFront.name = 'floor-gift-boxes-house-front';
    addGiftBoxes(
        houseFront,
        config.houseFrontCountRange,
        config.houseFrontPositions,
        floorTopY,
        houseBounds,
        floorRadius,
        canopyRadius,
        placedBounds
    );
    group.add(houseFront);

    return group;
}

