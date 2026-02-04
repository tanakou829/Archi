# アーキテクチャドキュメント

## システムアーキテクチャ概要

Artist Configuration Managerは、クリーンアーキテクチャの原則に基づいた3層アーキテクチャを採用しています。

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │   Pages      │  Components  │   Services   │        │
│  └──────────────┴──────────────┴──────────────┘        │
└─────────────────────────────────────────────────────────┘
                           │
                           │ REST API (HTTP/JSON)
                           │
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
│  ┌──────────────────────────────────────────────┐      │
│  │              API Layer                        │      │
│  │  ┌──────────┬──────────┬──────────┐         │      │
│  │  │  Auth    │  Users   │ Settings │         │      │
│  │  └──────────┴──────────┴──────────┘         │      │
│  └──────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────┐      │
│  │           Business Logic Layer                │      │
│  │  ┌──────────┬──────────┬──────────┐         │      │
│  │  │  Schemas │ Services │ Plugins  │         │      │
│  │  └──────────┴──────────┴──────────┘         │      │
│  └──────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────┐      │
│  │            Data Access Layer                  │      │
│  │  ┌──────────┬──────────────────────┐         │      │
│  │  │  Models  │   Database (ORM)     │         │      │
│  │  └──────────┴──────────────────────┘         │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                           │
                           │
                   ┌───────────────┐
                   │   PostgreSQL  │
                   └───────────────┘
```

## コンポーネント詳細

### フロントエンド (React + TypeScript)

#### Pages
- **Register**: ユーザー登録画面
- **Login**: ログイン画面
- **Dashboard**: メインダッシュボード（プロフィール、設定一覧、DCCツール）
- **DCCSettings**: 各DCCツールの設定画面

#### Services
- **api.ts**: Axios設定と共通API処理
- **auth.ts**: 認証関連API
- **settings.ts**: 設定管理API
- **dcc.ts**: DCCプラグインAPI

#### Types
TypeScript型定義ですべてのデータモデルを定義

### バックエンド (FastAPI)

#### API Layer (`app/api/`)
- **auth.py**: 認証エンドポイント（登録、ログイン、現在のユーザー取得）
- **users.py**: ユーザー管理エンドポイント（CRUD操作）
- **settings.py**: 設定管理エンドポイント（CRUD操作）
- **dcc.py**: DCCプラグイン情報エンドポイント

#### Core Layer (`app/core/`)
- **config.py**: アプリケーション設定
- **database.py**: データベース接続とセッション管理
- **security.py**: JWT認証、パスワードハッシュ

#### Models Layer (`app/models/`)
- **user.py**: Userモデル - 基本的なユーザー情報
- **setting.py**: UserSettingモデル - 拡張可能な設定

#### Schemas Layer (`app/schemas/`)
Pydanticスキーマによるリクエスト/レスポンス検証

#### Plugins Layer (`app/plugins/`)
拡張可能なプラグインシステム
- **base.py**: プラグインベースクラスとレジストリ
- **maya.py**: Maya設定プラグイン
- **blender.py**: Blender設定プラグイン
- **houdini.py**: Houdini設定プラグイン

## データモデル

### User (ユーザー)
```python
- id: int (主キー)
- username: str (一意)
- email: str (一意)
- hashed_password: str
- full_name: str (オプション)
- section: str (オプション) # 担当セクション
- unit: str (オプション) # 所属ユニット
- is_active: bool
- created_at: datetime
- updated_at: datetime
```

### UserSetting (ユーザー設定)
```python
- id: int (主キー)
- user_id: int (外部キー → User)
- category: str # DCCツール名など
- key: str # 設定キー
- value: str # 設定値（JSON可）
- description: str (オプション)
- created_at: datetime
- updated_at: datetime
```

一意制約: (user_id, category, key)

## セキュリティアーキテクチャ

### 認証フロー

```
1. ユーザー登録
   Client → POST /api/auth/register → Server
   Server → パスワードハッシュ化 → DB保存
   
2. ログイン
   Client → POST /api/auth/login (username, password)
   Server → パスワード検証
   Server → JWTトークン生成
   Server → Client (access_token)
   Client → localStorage保存
   
3. 認証済みリクエスト
   Client → API Request + Authorization: Bearer <token>
   Server → トークン検証
   Server → ユーザー情報取得
   Server → レスポンス
```

### セキュリティ機能

1. **パスワードハッシュ**: bcryptを使用
2. **JWT認証**: ステートレスな認証
3. **CORS保護**: 許可されたオリジンのみ
4. **HTTPSサポート**: 本番環境で必須
5. **ユーザー権限**: ユーザーは自分のデータのみ操作可能

## プラグインシステムアーキテクチャ

### 設計原則
- **開放/閉鎖原則**: 新機能追加時に既存コードを変更しない
- **プラグインベース**: DCCPluginインターフェースを実装
- **動的登録**: 起動時にすべてのプラグインを自動登録

### プラグインの追加方法

1. `DCCPlugin`抽象クラスを継承
2. 必須メソッドを実装:
   - `name`: プラグイン識別子
   - `display_name`: 表示名
   - `description`: 説明
   - `get_settings_template()`: 設定テンプレート
3. `__init__.py`で登録

### 設定テンプレートの構造

```python
DCCSettingTemplate(
    key="setting_key",           # 設定のキー
    label="Setting Label",       # 表示ラベル
    type="string|number|boolean|path|json",  # 型
    default_value=None,          # デフォルト値
    description="説明",           # 説明文
    required=False,              # 必須かどうか
    options=["opt1", "opt2"]     # 選択肢（オプション）
)
```

## 拡張性の設計

### 新しいDCCツールの追加

1. 新しいプラグインファイルを作成
2. 設定テンプレートを定義
3. プラグインを登録

フロントエンドは自動的に新しいツールを認識し、UI に表示します。

### 新しい設定タイプの追加

`UserSetting.value`はテキストフィールドなので、以下の形式を保存可能:
- プレーンテキスト
- JSON文字列（複雑なデータ構造）
- ファイルパス
- 数値

### カスタムバリデーション

プラグインで`validate_setting()`メソッドをオーバーライド:

```python
def validate_setting(self, key: str, value: Any) -> bool:
    if key == "samples" and int(value) < 1:
        return False
    return True
```

## スケーラビリティ

### データベース
- PostgreSQLでスケールアップ可能
- インデックスによる高速検索
- ユーザーID・カテゴリごとにパーティション可能

### API
- FastAPIの非同期処理でスケーラブル
- 水平スケーリング可能（ステートレス設計）
- ロードバランサーで複数インスタンス対応

### フロントエンド
- 静的ファイルとしてCDN配信可能
- コード分割による最適化

## デプロイメントアーキテクチャ

### 開発環境
```
Frontend (Vite Dev Server :3000)
    ↓ Proxy
Backend (Uvicorn :8000)
    ↓
SQLite (test.db)
```

### 本番環境
```
Internet
    ↓ HTTPS
Nginx (リバースプロキシ)
    ├→ Frontend (静的ファイル配信)
    └→ Backend (Gunicorn + Uvicorn workers)
           ↓
       PostgreSQL
```

### 推奨構成

- **Webサーバー**: Nginx
- **WSGIサーバー**: Gunicorn + Uvicorn workers
- **データベース**: PostgreSQL 12+
- **SSL/TLS**: Let's Encrypt
- **コンテナ**: Docker & Docker Compose

## パフォーマンス最適化

1. **データベースインデックス**: username, email, (user_id, category, key)
2. **接続プーリング**: SQLAlchemy connection pooling
3. **JWTキャッシング**: トークン検証結果のキャッシュ
4. **静的ファイル圧縮**: gzip/brotli
5. **CDN配信**: フロントエンドアセット

## 監視とロギング

- **アクセスログ**: Nginx
- **アプリケーションログ**: Python logging
- **エラートラッキング**: Sentry (推奨)
- **メトリクス**: Prometheus + Grafana (推奨)
