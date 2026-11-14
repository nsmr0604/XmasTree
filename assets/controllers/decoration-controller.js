// 出典: 本プロジェクト独自実装。飾り選択と配置のUI要件に基づく。
// 処理: DOMイベントを検証し、DecorationModelへ配置を依頼して結果やエラーを画面へ返す。保存番号の操作はSaveCodeControllerが担う。
import * as THREE from '../three/three.module.js';

export default class DecorationController {
    constructor(model, sceneView, appView) {
        // DOM入力を飾り選択・配置へ変換し、結果をViewへ表示する。
        this.model = model;
        this.sceneView = sceneView;
        this.view = appView;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.selectedType = model.settings.controls.initialDecoration;
    }

    start() {
        // 飾り選択と配置に必要なイベントを登録する。
        this.view.decorationMenu.addEventListener('click', event => this.selectDecoration(event));
        this.view.canvas.addEventListener('click', event => this.placeDecoration(event));
        this.view.canvas.addEventListener('wheel', event => this.cycleDecoration(event));
    }

    selectDecoration(event) {
        // メニューから選ばれた種類を保持し、選択状態を画面へ反映する。
        const button = event.target.closest('button[data-decoration]');
        if (!button?.dataset.decoration) {
            return;
        }
        this.selectDecorationButton(button);
    }

    selectDecorationButton(button) {
        // 選択中の種類を保持し、選択状態とステータス表示を更新する。
        this.selectedType = button.dataset.decoration;
        this.view.setSelectedDecoration(button);
        this.view.setStatus(`${button.textContent}を選択中`);
    }

    cycleDecoration(event) {
        // canvas上のホイール転がりで、飾りメニューの順序に沿って選択を前後へ切り替える。
        event.preventDefault();
        if (
            event.deltaY === 0
            || event.target instanceof HTMLInputElement
            || event.target instanceof HTMLTextAreaElement
        ) {
            return;
        }
        const buttons = Array.from(
            this.view.decorationMenu.querySelectorAll('button[data-decoration]')
        );
        const currentIndex = buttons.findIndex(
            (button) => button.dataset.decoration === this.selectedType
        );
        if (currentIndex === -1) {
            return;
        }
        const step = event.deltaY > 0 ? 1 : -1;
        const nextIndex = (currentIndex + step + buttons.length) % buttons.length;
        this.selectDecorationButton(buttons[nextIndex]);
    }

    placeDecoration(event) {
        // 画面上のクリックを葉との交差判定へ変換し、Modelへ配置を依頼する。
        const bounds = this.view.canvas.getBoundingClientRect();
        this.pointer.set(
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
            -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        );
        this.raycaster.setFromCamera(this.pointer, this.sceneView.camera);
        const intersections = this.raycaster.intersectObjects(this.sceneView.leaves);
        if (intersections.length === 0) {
            return;
        }

        const hit = intersections[0];
        this.sceneView.tree.updateMatrixWorld(true);
        hit.object.updateWorldMatrix(true, false);
        const localPoint = hit.object.worldToLocal(hit.point.clone());
        try {
            const code = this.model.add(this.selectedType, hit.object, localPoint);
            this.view.showSaveCode(code);
            this.view.setStatus('');
        } catch (error) {
            console.error('飾りの配置に失敗しました。', error);
            this.view.setStatus(error.message);
        }
    }
}
