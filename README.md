# クリスマスツリー

Three.jsを使った、ブラウザーで動くインタラクティブなクリスマスツリーです。ツリーに8種類の飾りを配置でき、配置はブラウザーに自動保存されます。昼夜の切り替え、カメラ操作、A4縦の印刷にも対応しています。

## 起動方法

ES ModulesとJSONモジュールを使用するため、HTMLファイルを `file://` で直接開かず、HTTPサーバーから配信してください。

1. このフォルダー（`index.html` がある場所）でターミナルを開きます。
2. Python 3で簡易HTTPサーバーを起動します。

   ```powershell
   python -m http.server 8000
   ```

3. WebGLとJSON import attributesに対応したブラウザーで <http://localhost:8000/> を開きます。
4. 終了するときは、サーバーを起動したターミナルで `Ctrl+C` を押します。

ビルド手順や外部ライブラリーのインストールはありません。WebGLに対応した環境が必要です。JSONモジュールのimport attributesをサポートする最新のブラウザーを使用してください。

## 操作

| 操作 | 動作 |
|---|---|
| 飾りボタンをクリック | 配置する飾りを選択 |
| マウスホイール（canvas上） | 選択中の飾りをボタン一覧の順序で前後へ切り替え |
| ツリーの葉をクリック | 選択中の飾りを配置 |
| W / S | ツリーに近づく / 離れる |
| A / D | ツリーの周りを回転 |
| Delete（2回押す） | 1回目で確認メッセージを表示。もう一度押すとすべての飾りを削除 |
| L | 昼 / 夜を切り替え |
| P（押している間） | 印刷ボタンと案内を表示。ボタンを押すとA4縦で印刷 |

飾りは合計50個まで、同じ種類は20個まで配置できます。詳しい操作は[利用者向け説明書](./doc/利用者向け説明書.md)を参照してください。

## 保存について

配置状態はブラウザーの `localStorage` に自動保存されます。次にページを開いたとき、最後に保存した配置が復元されます。保存データはブラウザーとサイトのオリジンごとに分かれ、別のブラウザーや端末とは共有されません。ブラウザーデータを消去すると保存データも失われます。

## 構成

```text
.
├── index.html
├── README.md
├── doc/
│   ├── 利用者向け説明書.md
│   ├── スタッフ向け詳細仕様書.md
│   ├── 関数仕様書.md
│   └── 内部設計・保守手順書.md
└── assets/
    ├── app.js
    ├── config/       # シーン、操作、飾り、保存番号の設定
    ├── controllers/  # 入力イベントと操作（Controller）
    ├── css/
    ├── models/       # 飾りの状態、保存・復元、配置計算（Model）
    ├── three/        # 同梱Three.jsモジュール
    └── views/        # UI表示、3Dシーンと舞台・飾りオブジェクト（View）
```

アプリのエントリーポイントは `assets/app.js` です。画面と内部仕様については[スタッフ向け詳細仕様書](./doc/スタッフ向け詳細仕様書.md)を参照してください。

## ドキュメント

- [利用者向け説明書](./doc/利用者向け説明書.md)
- [スタッフ向け詳細仕様書](./doc/スタッフ向け詳細仕様書.md)
- [関数仕様書](./doc/関数仕様書.md)
- [内部設計・保守手順書](./doc/内部設計・保守手順書.md)

## ライセンス

このプロジェクトにはThree.js r186が含まれています。

```text
Three.js
Copyright 2010-2026 Three.js Authors
ライセンス: MIT

MIT License

Copyright (c) 2010-2026 Three.js Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
