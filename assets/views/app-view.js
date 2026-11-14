// 出典: 本プロジェクト独自実装。画面要素は main/index.html に定義。
// 処理: UI要素を参照し、選択状態、保存番号、通知パネルを更新する。
import settings from '../config/settings.js';

export default class AppView {
    constructor() {
        this.settings = settings;
        this.canvas = document.getElementById('mainCanvas');
        this.decorationMenu = document.getElementById('decorationMenu');
        const initialDecorationButton = this.decorationMenu.querySelector(
            `button[data-decoration="${settings.controls.initialDecoration}"]`
        );
        if (!initialDecorationButton) {
            throw new Error('初期選択する飾りがメニューにありません。');
        }
        this.setSelectedDecoration(initialDecorationButton);
        this.savedStatePanel = document.getElementById('savedStatePanel');
        this.decorationStatus = document.getElementById('decorationStatus');
        this.savedStateCodeDisplay = document.getElementById('savedStateCode');
        this.savedStateForm = document.getElementById('savedStateForm');
        this.savedStateCodeInput = document.getElementById('savedStateCodeInput');
        this.savedStateCodeInput.maxLength = settings.saveCode.length;
        this.savedStateCodeInput.pattern = `[0-9]{${settings.saveCode.length}}`;
        this.savedStateCodeLength = document.getElementById('savedStateCodeLength');
        this.savedStateCodeLength.textContent = settings.saveCode.length;
        this.cameraZoomInstruction = document.getElementById('cameraZoomInstruction');
        this.cameraRotationInstruction = document.getElementById('cameraRotationInstruction');
        this.deleteAllInstruction = document.getElementById('deleteAllInstruction');
        this.currentSaveCode = '';
        this.resetSavedStateButton = document.getElementById('resetSavedStateButton');
        this.savedStateKeyInstruction = document.getElementById('savedStateKeyInstruction');
        this.nightButton = document.getElementById('nightButton');
        this.nightKeyInstruction = document.getElementById('nightKeyInstruction');
        this.printButton = document.getElementById('printButton');
        this.printKeyInstruction = document.getElementById('printKeyInstruction');
        this.printImage = document.getElementById('printImage');
        this.printDate = document.getElementById('printDate');
        this.printSaveCode = document.getElementById('printSaveCode');
        this.updateOperationGuide();
    }

    updateOperationGuide() {
        const { keys } = this.settings.controls;
        const displayKey = key => key.length === 1 ? key.toUpperCase() : key;
        this.cameraZoomInstruction.textContent = (
            `${displayKey(keys.zoomIn)} / ${displayKey(keys.zoomOut)}：ズーム`
        );
        this.cameraRotationInstruction.textContent = (
            `${displayKey(keys.rotateLeft)} / ${displayKey(keys.rotateRight)}：回転`
        );
        this.deleteAllInstruction.textContent = (
            `${displayKey(keys.deleteAll)}：追加した飾りをすべて削除（2回押す）`
        );
        this.savedStateKeyInstruction.textContent = (
            `${displayKey(keys.savedState)}：呼び出し・初期化`
        );
        this.nightKeyInstruction.textContent = (
            `${displayKey(keys.toggleNight)}：昼夜切替`
        );
        this.printKeyInstruction.textContent = (
            `${displayKey(keys.print)}：印刷`
        );
    }

    setStatus(message) {
        this.decorationStatus.textContent = message;
        this.decorationStatus.hidden = !message;
        this.updateSavedStatePanel();
    }

    setSelectedDecoration(button) {
        this.decorationMenu.querySelectorAll('button[data-decoration]').forEach((option) => {
            option.setAttribute('aria-pressed', String(option === button));
        });
    }

    showSaveCode(code) {
        this.currentSaveCode = code;
        this.savedStateCodeDisplay.textContent = `保存番号: ${code}`;
        this.printSaveCode.textContent = `保存番号: ${code}`;
    }

    setSavedStateMenuOpen(isOpen) {
        this.savedStateForm.hidden = !isOpen;
        this.savedStateCodeDisplay.hidden = !isOpen;
        this.savedStateKeyInstruction.hidden = !isOpen;
        if (isOpen) {
            this.savedStateCodeInput.value = this.currentSaveCode;
        }
        this.updateSavedStatePanel();
    }

    updateSavedStatePanel() {
        this.savedStatePanel.hidden = (
            this.decorationStatus.hidden
            && this.savedStateCodeDisplay.hidden
            && this.savedStateForm.hidden
        );
    }
}

