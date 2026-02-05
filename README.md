# Archi - Artist Configuration Manager

アーティスト設定管理システム - ゲーム開発向けの設定管理サービス

## 概要

このプロジェクトは、ゲーム開発におけるアーティストの個人設定情報を登録・管理するためのWebベースのサービスです。

### 主な機能

- **ユーザー登録・認証**: セキュアなJWT認証システム
- **基本情報管理**: ユーザー名、担当セクション、ユニットなどの情報
- **拡張可能な設定管理**: DCCツール（Maya, Blender, Houdini等）の設定を管理
- **プラグインシステム**: 新しいツールの設定を簡単に追加可能
- **セキュアアクセス**: 社内外から安全にアクセス可能

## アーキテクチャ

### バックエンド
- **フレームワーク**: FastAPI (Python)
- **データベース**: SQLAlchemy ORM (PostgreSQL/SQLite対応)
- **認証**: JWT (JSON Web Tokens)
- **API**: RESTful API with OpenAPI documentation

### フロントエンド
- **フレームワーク**: React with TypeScript
- **ビルドツール**: Vite
- **状態管理**: React Hooks
- **ルーティング**: React Router

## プロジェクト構造

```
Archi/
├── backend/              # Pythonバックエンド
│   ├── app/
│   │   ├── api/         # APIエンドポイント
│   │   ├── core/        # コア機能（DB, セキュリティ等）
│   │   ├── models/      # データベースモデル
│   │   ├── schemas/     # Pydanticスキーマ
│   │   └── plugins/     # DCCツールプラグイン
│   ├── main.py          # FastAPIアプリケーション
│   └── requirements.txt # Python依存関係
│
├── frontend/            # Reactフロントエンド
│   ├── src/
│   │   ├── components/  # Reactコンポーネント
│   │   ├── pages/       # ページコンポーネント
│   │   ├── services/    # APIサービス
│   │   └── types/       # TypeScript型定義
│   └── package.json     # Node依存関係
│
└── docs/               # ドキュメント
```

## セットアップ

### 必要要件

- Python 3.8+
- Node.js 16+
- PostgreSQL (本番環境) / SQLite (開発環境)

### バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して設定を変更

# サーバーの起動
python main.py
```

バックエンドは http://localhost:8000 で起動します。
API ドキュメントは http://localhost:8000/api/docs で確認できます。

### フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

## 使い方

### 1. ユーザー登録

1. ブラウザで http://localhost:3000/register にアクセス
2. 必要な情報を入力:
   - ユーザー名
   - メールアドレス
   - パスワード
   - 氏名（オプション）
   - 担当セクション（モデリング、アニメーション等）
   - ユニット
3. 「Register」をクリック

### 2. ログイン

1. http://localhost:3000/login にアクセス
2. ユーザー名とパスワードを入力
3. 「Login」をクリック

### 3. プロフィール管理

ダッシュボードで自分のプロフィール情報を確認できます。

### 4. DCC設定の登録

1. ダッシュボードの「DCC Tools」タブを選択
2. 設定したいツール（Maya, Blender, Houdini等）を選択
3. 各ツールの設定値を入力
4. 「Save Settings」をクリック

## プラグインシステム

新しいDCCツールのサポートを追加するには:

1. `backend/app/plugins/` に新しいプラグインファイルを作成
2. `DCCPlugin` クラスを継承
3. 必要なメソッドを実装
4. `backend/app/plugins/__init__.py` でプラグインを登録

例：

```python
from .base import DCCPlugin, DCCSettingTemplate

class MyToolPlugin(DCCPlugin):
    @property
    def name(self) -> str:
        return "mytool"
    
    @property
    def display_name(self) -> str:
        return "My Tool"
    
    @property
    def description(self) -> str:
        return "Settings for My Tool"
    
    def get_settings_template(self):
        return [
            DCCSettingTemplate(
                key="project_path",
                label="Project Path",
                type="path",
                description="Default project directory"
            ),
            # 他の設定...
        ]
```

## セキュリティ

### 社内外からの安全なアクセス

- **JWT認証**: すべてのAPIエンドポイントは認証が必要
- **CORS設定**: 許可されたオリジンのみアクセス可能
- **HTTPS**: 本番環境では必ずHTTPSを使用
- **環境変数**: 機密情報は環境変数で管理

### 本番環境での設定

1. `.env` ファイルで以下を変更:
   - `SECRET_KEY`: ランダムな強力な秘密鍵に変更
   - `DATABASE_URL`: 本番DBの接続文字列
   - `ALLOWED_ORIGINS`: 本番フロントエンドのURL
   - `DEBUG=False`

2. HTTPS対応のリバースプロキシ（Nginx等）を使用

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

### ユーザー
- `GET /api/users/` - ユーザー一覧
- `GET /api/users/{id}` - ユーザー詳細
- `PUT /api/users/{id}` - ユーザー情報更新
- `DELETE /api/users/{id}` - ユーザー削除（無効化）

### 設定
- `GET /api/settings/` - 設定一覧
- `POST /api/settings/` - 設定作成
- `GET /api/settings/{id}` - 設定詳細
- `PUT /api/settings/{id}` - 設定更新
- `DELETE /api/settings/{id}` - 設定削除

### DCCツール
- `GET /api/dcc/plugins` - DCCプラグイン一覧
- `GET /api/dcc/templates` - すべてのテンプレート
- `GET /api/dcc/templates/{plugin_name}` - 特定プラグインのテンプレート

詳細なAPIドキュメントは http://localhost:8000/api/docs で確認できます。

## 開発

### テストの実行

```bash
# バックエンド
cd backend
pytest

# フロントエンド
cd frontend
npm test
```

### ビルド

```bash
# フロントエンド本番ビルド
cd frontend
npm run build
```

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## トラブルシューティング

### HTTP 405 エラー (Method Not Allowed)

プロジェクト作成時に405エラーが発生する場合:

1. **バックエンドサーバーが起動していることを確認**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
   ブラウザで http://localhost:8000/api/docs にアクセスして、API ドキュメントが表示されることを確認

2. **フロントエンドが正しいポートで起動していることを確認**
   ```bash
   cd frontend
   npm run dev
   ```
   http://localhost:3000 でアクセス

3. **ブラウザのコンソールとネットワークタブを確認**
   - DevTools を開く (F12)
   - Network タブで `/api/projects/` へのリクエストを確認
   - リクエストメソッドが POST であることを確認
   - レスポンスの詳細を確認

4. **データベースが正しく初期化されていることを確認**
   ```bash
   cd backend
   rm test.db  # 既存のDBを削除
   python -m uvicorn main:app --reload  # 再起動すると自動的にテーブルが作成される
   ```

### CORS エラー

CORS エラーが発生する場合、backend/.env ファイルで ALLOWED_ORIGINS を確認:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```