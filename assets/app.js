/*
    出典: アプリ独自実装。各飾り形状の参考元は生成モジュール側に記載。
    処理: 設定と実装を読み込み、生成器の一覧を作り、Model/View/Controllerを接続して起動する。
    Three.js r186 is included in ./three/.
    Copyright 2010-2026 Three.js Authors
    Licensed under the MIT License. See the project README.md for the license text.
*/
import settings from './config/settings.js';
import createBall from './views/scene/decorations/ball.js';
import createStar from './views/scene/decorations/star.js';
import createSnowflake from './views/scene/decorations/snowflake.js';
import createGift from './views/scene/decorations/gift.js';
import createBell from './views/scene/decorations/bell.js';
import createCandyCane from './views/scene/decorations/candy-cane.js';
import createWreath from './views/scene/decorations/wreath.js';
import createStocking from './views/scene/decorations/stocking.js';
import DecorationStore from './models/decoration-store.js';
import DecorationModel from './models/decoration-model.js';
import AppView from './views/app-view.js';
import SceneView from './views/scene-view.js';
import DecorationController from './controllers/decoration-controller.js';
import SaveCodeController from './controllers/save-code-controller.js';
import SceneController from './controllers/scene-controller.js';

const decorationFactories = {
    // キー名はindex.htmlのdata-decorationおよび保存データのtypeと合わせる。
    ball: createBall,
    star: createStar,
    snowflake: createSnowflake,
    gift: createGift,
    bell: createBell,
    candyCane: createCandyCane,
    wreath: createWreath,
    stocking: createStocking
};

// 起動時に共有するView、保存Store、飾りModelを依存関係の順に生成する。
const appView = new AppView();
const sceneView = new SceneView(settings, appView.canvas);
const decorationStore = new DecorationStore(
    settings,
    Object.keys(decorationFactories)
);
const decorationModel = new DecorationModel(
    settings,
    sceneView,
    decorationFactories,
    decorationStore
);

// 入力イベントをControllerに登録し、最後に連続描画を開始する。
new DecorationController(decorationModel, sceneView, appView).start();
new SaveCodeController(decorationModel, appView).start();
new SceneController(sceneView, appView).start();
sceneView.startAnimation();

