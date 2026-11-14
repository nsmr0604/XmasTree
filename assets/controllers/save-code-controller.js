// 出典: 本プロジェクト独自実装。保存番号と初期化のUI要件に基づく。
// 処理: 保存状態の復元・読み込み・保存・初期化をDecorationModelへ依頼し、Deleteキーの2段階確認を管理する。
export default class SaveCodeController {
    constructor(model, appView) {
        // 保存番号の入出力と初期化の確認待ちを保持する。
        this.model = model;
        this.view = appView;
        this.confirmingReset = false;
    }

    start() {
        // 起動時の保存状態復元と、保存番号操作・確認待ち解除のイベントを登録する。
        this.restoreSavedState();
        this.view.savedStateForm.addEventListener('submit', event => this.loadByCode(event));
        this.view.savedStateCodeInput.addEventListener('input', () => {
            this.view.savedStateCodeInput.value = this.view.savedStateCodeInput.value
                .replace(/[^0-9]/g, '')
                .slice(0, this.model.settings.saveCode.length);
        });
        this.view.resetSavedStateButton.addEventListener('click', () => this.reset());
        window.addEventListener('keydown', event => this.handleKeyDown(event));
        // 飾り操作やメニュー選択があったら初期化の確認待ちを解除する。
        this.view.canvas.addEventListener('click', () => this.cancelResetConfirmation());
        this.view.canvas.addEventListener('wheel', () => this.cancelResetConfirmation());
        this.view.decorationMenu.addEventListener('click', event => {
            if (event.target.closest('button[data-decoration]')) {
                this.cancelResetConfirmation();
            }
        });
    }

    restoreSavedState() {
        // 前回状態を復元し、未保存または不正時には新しい空状態を作る。
        try {
            const code = this.model.loadActive();
            if (code) {
                this.view.showSaveCode(code);
                return;
            }
        } catch (error) {
            console.error('保存状態の復元に失敗しました。', error);
        }
        this.save();
    }

    loadByCode(event) {
        // 入力された保存番号のデータをModelで復元する。
        event.preventDefault();
        if (!this.view.savedStateForm.reportValidity()) {
            return;
        }
        const code = this.view.savedStateCodeInput.value;
        try {
            this.model.load(code);
            this.view.showSaveCode(code);
            this.view.setStatus('状態を読み込みました。');
            this.view.setSavedStateMenuOpen(false);
        } catch (error) {
            console.error('保存状態の読み込みに失敗しました。', error);
            this.view.setStatus(error.message);
        }
    }

    reset() {
        // 新しい保存番号を発行して飾りを消し、保存番号入力欄も閉じる。
        try {
            this.cancelResetConfirmation();
            const code = this.model.removeAll(true);
            this.view.showSaveCode(code);
            this.view.setSavedStateMenuOpen(false);
            this.view.savedStateCodeInput.value = '';
            this.view.setStatus('飾りをすべて削除しました。');
        } catch (error) {
            console.error('飾りの初期化に失敗しました。', error);
            this.view.setStatus(error.message);
        }
    }

    save() {
        // Modelの現在状態を保存し、確定した番号を表示する。
        try {
            this.view.showSaveCode(this.model.save());
        } catch (error) {
            console.error('飾りの保存に失敗しました。', error);
        }
    }

    handleKeyDown(event) {
        // 設定された保存番号キーと初期化キーを処理する。
        const keys = this.model.settings.controls.keys;
        if (event.key === keys.deleteAll) {
            event.preventDefault();
            if (!event.repeat) {
                this.requestReset();
            }
            return;
        }
        this.cancelResetConfirmation();
        if (
            event.key.toLowerCase() !== keys.savedState
            || event.target instanceof HTMLInputElement
            || event.target instanceof HTMLTextAreaElement
        ) {
            return;
        }
        if (event.repeat) {
            return;
        }
        event.preventDefault();
        const isOpen = this.view.savedStateForm.hidden;
        this.view.setSavedStateMenuOpen(isOpen);
        if (isOpen) {
            this.view.savedStateCodeInput.focus();
        }
    }

    requestReset() {
        // Deleteによる初期化は2段階にし、1回目の押下では確認メッセージだけ表示する。
        if (this.confirmingReset) {
            this.cancelResetConfirmation();
            this.reset();
            return;
        }
        this.confirmingReset = true;
        this.view.setStatus('もう一度Deleteキーを押すと、飾りをすべて削除します。');
    }

    cancelResetConfirmation() {
        // 初期化の確認待ちを解除する。他のキー入力や飾り操作があったときに呼び出す。
        this.confirmingReset = false;
    }
}
