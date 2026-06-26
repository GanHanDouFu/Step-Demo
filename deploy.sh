#!/bin/bash
# 一键部署「如果我是古人」到服务器
# 用法：SSH 登录服务器后执行
# curl -fsSL https://raw.githubusercontent.com/GanHanDouFu/Step-Demo/main/deploy.sh | bash

set -e

echo "=== 开始部署「如果我是古人」==="

# 1. 安装 Node.js
echo "--- 安装 Node.js ---"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. 安装 git
apt-get install -y git

# 3. 克隆项目
echo "--- 克隆项目 ---"
cd /opt
rm -rf Step-Demo
git clone https://github.com/GanHanDouFu/Step-Demo.git
cd Step-Demo

# 4. 安装依赖
echo "--- 安装依赖 ---"
npm install

# 5. 创建 .env 文件（需要手动填写 API_KEY）
if [ ! -f .env ]; then
  cat > .env << 'ENVEOF'
API_KEY=你的API密钥
API_BASE_URL=https://api.deepseek.com/v1
MODEL=deepseek-chat
ENVEOF
  echo "--- 请编辑 /opt/Step-Demo/.env 填入你的 API_KEY ---"
fi

# 6. 用 PM2 管理进程（自动重启、开机自启）
echo "--- 安装 PM2 ---"
npm install -g pm2

# 停止旧进程
pm2 delete ancient-app 2>/dev/null || true

# 启动
echo "--- 启动服务 ---"
pm2 start server.js --name ancient-app
pm2 save
pm2 startup

# 7. 获取公网 IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "未知")

echo ""
echo "=============================="
echo "  部署完成！"
echo "  访问地址: http://${PUBLIC_IP}:3000"
echo "=============================="
echo ""
echo "如需修改 API_KEY："
echo "  nano /opt/Step-Demo/.env"
echo "  pm2 restart ancient-app"
