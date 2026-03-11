---
description: How to run the local development environment for ZigCel
---

# 開発環境の起動

ZigCelプロジェクトはDocker Compose上で動作します。AIエージェントは以下の手順で環境を起動・確認してください。

1. Dockerコンテナの起動
// turbo
```bash
docker compose up -d
```

2. ログの確認とViteサーバーの起動待機
```bash
docker compose logs -f app
```
(Viteが起動し、`http://localhost:5173` が表示されるまで待ちます)

3. Zigコンパイルの実行（変更があった場合）
// turbo
```bash
docker compose exec app zig build
```
※Zigのビルド結果は `zig-out/bin/zigcel.wasm` に出力され、Vite(JS)からフェッチされます。

4. テストの実行（コード変更ごとに必ず実施）
// turbo
```bash
docker compose exec app zig build test
```
