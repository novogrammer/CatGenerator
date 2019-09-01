CatGenerator
=====================
HOMEWORKS2019で展示した「こねこたくさん」のプログラムです。

主な使用ライブラリは以下の通りです。
サーバ側
* keras
* flask

クライアント側
* three.js
* Ammo.js

サーバ側はflaskでWebサーバを立て、リクエストに応じてkerasで生成済みのganmodels/dcgan-cat.h5を使って画像を返します。

クライアント側はthree.jsとAmmo.jsのアプリです。Ammo.jsはthree.jsにマージされているバージョンのwasmを使用しました。

後述しますが、DCGAN周りは以下のプログラムをほぼそのまま使いました。

https://github.com/taku-buntu/Keras-DCGAN-killmebaby

# 前提
* MacかLinux（WindowsもOK？）
* python3
* Google Chrome

# 導入
```
$ python3 -m venv venv
$ source venv/bin/activate
$ pip3 install -r requirements.txt
$ deactivate
```
# 実行
```
$ source venv/bin/activate
$ python3 ./main.py
$ deactivate
```

* http://localhost:5000 をChromeで開く
* Fullscreenボタンをクリック
* Lock Pointerボタンをクリック
* マウスの移動で親猫を操作します（HOMEWORKS2019ではトラックボールを使いました）

ゴールにたどり着くと次の世代へ交代となり、100頭生まれるとゲームオーバーです


# GANまわり
GAN周りは「GANについて概念から実装まで　～DCGANによるキルミーベイベー生成～」のプログラムを使用しました。

コメント欄で作者のtaku-buntuさんに確認したところ、MITライセンスを導入予定とのことです。

https://qiita.com/taku-buntu/items/0093a68bfae0b0ff879d

https://github.com/taku-buntu/Keras-DCGAN-killmebaby

dcgan.pyから生成に必要な部分だけ抽出したものがdcgan_slim.pyです。

## ganmodels/dcgan-cat.h5の生成


### 実行
```
$ source venv/bin/activate
$ python3 ./dcgan.py
$ deactivate
```
ganmodels/dcgan-*-iter.h5 の一番数字が大きいファイルをganmodels/dcgan-cat.h5にリネームする。


# 「こねこたくさん」の説明文

親猫から親猫に似た子猫が子猫が次々と生まれます。

子猫は親猫についていきます。

ゴールに着くと世代交代します。

そのままほうっておくと身動きが取れなくなることも？

多頭飼いの崩壊を風刺したものです。

