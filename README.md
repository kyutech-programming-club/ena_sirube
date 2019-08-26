# エナしるべ

## Description
現在地周辺のエナジードリンク（以下、魔剤）を売っている場所（コンビニ、自販機など）をMAP上から確認することができる。

![IMG_20190827_002215](https://user-images.githubusercontent.com/20394831/63701902-deaff580-c860-11e9-99b6-ae382e71811a.jpg)
![IMG_20190827_002500](https://user-images.githubusercontent.com/20394831/63702081-377f8e00-c861-11e9-8fa1-894d9c9bb0a4.jpg)
![IMG_20190827_001927](https://user-images.githubusercontent.com/20394831/63701952-f6877980-c860-11e9-9217-8dc588bab0bf.jpg)
![IMG_20190827_002008](https://user-images.githubusercontent.com/20394831/63701956-f8e9d380-c860-11e9-8de2-d551f7c9cf84.jpg)


## Features
- 魔剤スポット
  - 表示
  - 登録
  - 編集
  
- 魔剤フィルター
- 魔剤
  - 追加
  - 削除

## Installation
1. ニフクラ mobile backendにアプリケーションを作成
2. Google Maps APIキー取得
3. [app.js](/www/javascript/app.js)1,2行目にアプリケーションキー、クライアントキーを追記
4. 各htmlファイルのGoogle Maps APIキーを追記
5. [monaca](https://ja.monaca.io/)にアップ
6. cordovaプラグインの、camera、geolocationを有効
7. JSコンポーネント、ncmb、JQueryを追加

## Requirement
- JQuery 3.3.1
- ncmb 3.0.0

## Team
もつなべ（Hack U 2019 FUKUOKAにて発表）
