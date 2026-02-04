# デプロイメントガイド

## Dockerを使用したデプロイ (推奨)

### 前提条件
- Docker 20.10以上
- Docker Compose 2.0以上

### 手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/tanakou829/Archi.git
cd Archi
```

2. **環境変数の設定**
```bash
# .envファイルを作成
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env
```

3. **アプリケーションの起動**
```bash
docker-compose up -d
```

4. **アクセス**
- フロントエンド: http://localhost
- バックエンドAPI: http://localhost:8000
- APIドキュメント: http://localhost:8000/api/docs

### 停止と削除
```bash
# 停止
docker-compose stop

# 停止して削除
docker-compose down

# ボリュームも含めて削除 (データベースデータも削除されます)
docker-compose down -v
```

## 手動デプロイ

### 本番環境の構成

```
Internet → Nginx (リバースプロキシ) → Backend (Gunicorn + Uvicorn)
                     ↓                        ↓
               Frontend (静的ファイル)    PostgreSQL
```

### 1. PostgreSQLのセットアップ

```bash
# PostgreSQLのインストール (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# データベースとユーザーの作成
sudo -u postgres psql
CREATE DATABASE archi_db;
CREATE USER archi_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE archi_db TO archi_user;
\q
```

### 2. バックエンドのデプロイ

```bash
cd backend

# 仮想環境の作成
python3 -m venv venv
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt
pip install gunicorn

# 環境変数の設定
cat > .env << EOF
DATABASE_URL=postgresql://archi_user:secure_password@localhost:5432/archi_db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://your-domain.com
APP_NAME=Artist Configuration Manager
DEBUG=False
EOF

# Gunicornで起動 (テスト)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 3. Systemdサービスの作成

```bash
sudo nano /etc/systemd/system/archi-backend.service
```

内容:
```ini
[Unit]
Description=Archi Backend API
After=network.target postgresql.service

[Service]
Type=notify
User=your-user
Group=your-user
WorkingDirectory=/path/to/Archi/backend
Environment="PATH=/path/to/Archi/backend/venv/bin"
ExecStart=/path/to/Archi/backend/venv/bin/gunicorn main:app \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

起動:
```bash
sudo systemctl daemon-reload
sudo systemctl enable archi-backend
sudo systemctl start archi-backend
sudo systemctl status archi-backend
```

### 4. フロントエンドのビルド

```bash
cd frontend

# 依存関係のインストール
npm install

# 本番ビルド
npm run build
```

ビルド成果物は `frontend/dist/` に生成されます。

### 5. Nginxのセットアップ

```bash
# Nginxのインストール
sudo apt install nginx

# 設定ファイルの作成
sudo nano /etc/nginx/sites-available/archi
```

内容:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # フロントエンド
    root /path/to/Archi/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # バックエンドAPI
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静的ファイルのキャッシュ
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip圧縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

有効化:
```bash
sudo ln -s /etc/nginx/sites-available/archi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL/TLSの設定 (Let's Encrypt)

```bash
# Certbotのインストール
sudo apt install certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d your-domain.com

# 自動更新の確認
sudo certbot renew --dry-run
```

## クラウドデプロイ

### AWS EC2

1. EC2インスタンスを起動 (Ubuntu 22.04 LTS推奨)
2. セキュリティグループで80, 443, 8000ポートを開放
3. 上記の手動デプロイ手順に従う
4. Elastic IPを割り当て
5. Route 53でDNSを設定

### Google Cloud Platform (GCP)

1. Compute Engineインスタンスを作成
2. ファイアウォールルールで80, 443ポートを開放
3. 上記の手動デプロイ手順に従う
4. 静的外部IPを予約
5. Cloud DNSでドメインを設定

### Heroku

バックエンド:
```bash
cd backend
echo "web: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker" > Procfile
git init
git add .
git commit -m "Initial commit"
heroku create your-app-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

フロントエンド:
```bash
cd frontend
# Heroku用の静的ファイルサーバー設定
npm install -g serve
echo "web: serve -s dist -l $PORT" > Procfile
git init
git add .
git commit -m "Initial commit"
heroku create your-app-frontend
git push heroku main
```

## セキュリティチェックリスト

- [ ] `SECRET_KEY`を強力なランダム値に変更
- [ ] `DEBUG=False`に設定
- [ ] `ALLOWED_ORIGINS`を本番ドメインに制限
- [ ] PostgreSQLのパスワードを強力なものに設定
- [ ] HTTPSを有効化
- [ ] ファイアウォールで不要なポートを閉じる
- [ ] 定期的なバックアップの設定
- [ ] ログ監視の設定

## バックアップ

### データベースバックアップ

```bash
# バックアップ
pg_dump archi_db > backup_$(date +%Y%m%d).sql

# リストア
psql archi_db < backup_20261204.sql
```

### 自動バックアップ (cron)

```bash
# crontabに追加
crontab -e

# 毎日午前2時にバックアップ
0 2 * * * pg_dump archi_db > /backups/archi_$(date +\%Y\%m\%d).sql
```

## モニタリング

### ログの確認

```bash
# バックエンドログ
sudo journalctl -u archi-backend -f

# Nginxログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### ヘルスチェック

```bash
# バックエンドの健全性チェック
curl http://localhost:8000/health

# 定期的なヘルスチェック (cron)
*/5 * * * * curl -f http://localhost:8000/health || systemctl restart archi-backend
```

## トラブルシューティング

### サービスが起動しない

```bash
# ログを確認
sudo journalctl -u archi-backend -n 50

# 設定を確認
cat backend/.env

# データベース接続を確認
psql -U archi_user -d archi_db -h localhost
```

### パフォーマンスが悪い

- Gunicornのワーカー数を増やす (`-w 8`)
- PostgreSQLの接続プールを調整
- Nginxのキャッシュを有効化
- CDNを使用 (CloudFlare, CloudFront等)

## スケーリング

### 水平スケーリング

1. ロードバランサー (AWS ALB, GCP Load Balancing)
2. 複数のバックエンドインスタンス
3. データベースの読み取りレプリカ
4. Redisでセッション共有

### 垂直スケーリング

1. より大きなEC2/GCEインスタンス
2. PostgreSQLのメモリ設定を増やす
3. Gunicornワーカー数を増やす
