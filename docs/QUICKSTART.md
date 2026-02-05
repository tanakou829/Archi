# クイックスタートガイド

このガイドでは、Artist Configuration Managerを最速でセットアップして実行する方法を説明します。

## 前提条件

- Python 3.8以上
- Node.js 16以上
- Git

## 5分でセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/tanakou829/Archi.git
cd Archi
```

### 2. バックエンドのセットアップ (2分)

```bash
cd backend

# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# Linux/Mac:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# バックエンドの起動
python main.py
```

バックエンドが http://localhost:8000 で起動します。

**API ドキュメント**: http://localhost:8000/api/docs

### 3. フロントエンドのセットアップ (2分)

新しいターミナルウィンドウで:

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

フロントエンドが http://localhost:3000 で起動します。

### 4. アクセス

ブラウザで http://localhost:3000 を開きます。

## 最初のユーザー登録

1. 「Register」リンクをクリック
2. 以下の情報を入力:
   - ユーザー名
   - メールアドレス
   - パスワード (8文字以上)
   - 氏名 (オプション)
   - セクション (例: Modeling, Animation, VFX)
   - ユニット (例: Unit A, Unit B)
3. 「Register」ボタンをクリック
4. ログインページでログイン

## DCC設定の追加

1. ダッシュボードで「DCC Tools」タブを選択
2. 使用したいツール (Maya, Blender, Houdini) を選択
3. 各設定項目を入力
4. 「Save Settings」をクリック

## トラブルシューティング

### バックエンドが起動しない

```bash
# 依存関係を再インストール
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### フロントエンドが起動しない

```bash
# node_modulesを削除して再インストール
cd frontend
rm -rf node_modules
npm install
```

### ポートが既に使用されている

バックエンド:
```bash
# ポート8001を使用
cd backend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

フロントエンド `vite.config.ts` を編集:
```typescript
server: {
  port: 3001,  // ポート番号を変更
  // ...
}
```

## 本番環境デプロイ

詳細は [README.md](../README.md) の「本番環境での設定」セクションを参照してください。

### 重要な設定

1. `.env` ファイルを作成:
```bash
cd backend
cp .env.example .env
```

2. `.env` を編集:
```env
SECRET_KEY=your-very-secure-random-key-change-this
DATABASE_URL=postgresql://user:password@localhost:5432/archi_db
ALLOWED_ORIGINS=https://your-domain.com
DEBUG=False
```

3. PostgreSQLデータベースをセットアップ (本番環境用)

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

## 次のステップ

- [README.md](../README.md) - 詳細なドキュメント
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - アーキテクチャの詳細
- [API Docs](http://localhost:8000/api/docs) - インタラクティブなAPI ドキュメント
