# 小红书AI搜索系统部署指南

## 目录
- [部署前准备](#部署前准备)
- [服务器环境配置](#服务器环境配置)
- [项目部署](#项目部署)
- [服务启动与管理](#服务启动与管理)
- [常见问题与解决方案](#常见问题与解决方案)

## 部署前准备

在开始部署之前，请确保您已完成以下准备工作：

1. 拥有一台阿里云ECS服务器（推荐配置：2核CPU，4GB内存）
2. 服务器操作系统为CentOS 7.x或Ubuntu 18.04以上版本
3. 已开通阿里云DashScope和DashVector服务并获取API密钥
4. 准备好项目的环境变量配置信息

## 服务器环境配置

### 1. 连接服务器

使用SSH工具连接到您的阿里云ECS服务器：

```bash
ssh root@your_server_ip
```

### 2. 安装Node.js环境

```bash
# 更新系统包
yum update -y  # CentOS
# 或者
apt update -y  # Ubuntu

# 安装Node.js (推荐使用v16.x或v18.x版本)
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -  # CentOS
# 或者
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -  # Ubuntu

yum install -y nodejs  # CentOS
# 或者
apt install -y nodejs  # Ubuntu

# 验证安装
node --version
npm --version
```

### 3. 安装MongoDB数据库

```bash
# 添加MongoDB官方yum源 (CentOS)
cat > /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/7/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# 添加MongoDB官方apt源 (Ubuntu)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# 安装MongoDB
yum install -y mongodb-org  # CentOS
# 或者
apt update && apt install -y mongodb-org  # Ubuntu

# 启动MongoDB服务
systemctl start mongod
systemctl enable mongod

# 验证安装
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

### 4. 配置MongoDB远程访问（可选）

如果需要从外部访问MongoDB数据库，请按以下步骤配置：

```bash
# 编辑MongoDB配置文件
vim /etc/mongod.conf

# 修改bindIp配置，允许远程连接
# 将 bindIp: 127.0.0.1 修改为 bindIp: 0.0.0.0

# 重启MongoDB服务
systemctl restart mongod
```

注意：开放MongoDB远程访问存在安全风险，请确保配置了防火墙规则和身份验证。

### 5. 配置阿里云安全组

在阿里云控制台配置安全组规则，开放以下端口：
- 22 (SSH连接)
- 3000 (Node.js应用默认端口)
- 27017 (MongoDB数据库端口，如需远程访问)

## 项目部署

### 1. 上传项目代码

可以通过以下几种方式将项目代码上传到服务器：

#### 方法一：使用Git克隆（推荐）

```bash
# 安装git（如果未安装）
yum install -y git  # CentOS
# 或者
apt install -y git  # Ubuntu

# 克隆项目代码
cd /opt
git clone your_project_repository.git
cd your_project_directory
```

#### 方法二：使用SCP上传

在本地机器执行以下命令：

```bash
scp -r /path/to/xiaohongshu-ai-search root@your_server_ip:/opt/
```

### 2. 安装项目依赖

```bash
# 进入项目目录
cd /opt/xiaohongshu-ai-search

# 安装依赖
npm install
```

### 3. 配置环境变量

在项目根目录下创建或编辑`.env`文件：

```bash
vim .env
```

添加以下配置信息：

```env
# MongoDB连接字符串
MONGODB_URI=mongodb://localhost:27017/xiaohongshu

# DashVector配置
DASHVECTOR_API_KEY=your_dashvector_api_key
DASHVECTOR_ENDPOINT=your_dashvector_endpoint

# DashScope配置
DASHSCOPE_API_KEY=your_dashscope_api_key

# 应用端口
PORT=3000
```

请将`your_dashvector_api_key`、`your_dashvector_endpoint`和`your_dashscope_api_key`替换为实际的API密钥和端点信息。

## 服务启动与管理

### 1. 初始化向量数据库集合

```bash
# 进入项目目录
cd /opt/xiaohongshu-ai-search

# 初始化向量数据库集合
npm run init-collection
```

### 2. 启动应用服务

#### 直接启动（适用于测试环境）

```bash
npm start
```

#### 使用PM2管理（推荐用于生产环境）

PM2是一个Node.js进程管理工具，可以确保应用在崩溃后自动重启。

```bash
# 安装PM2
npm install -g pm2

# 使用PM2启动应用
pm2 start src/server.js --name xiaohongshu-ai-search

# 设置开机自启
pm2 startup
pm2 save
```

### 3. 验证服务运行

```bash
# 检查应用是否正在运行
pm2 list

# 查看应用日志
pm2 logs xiaohongshu-ai-search

# 测试API接口
curl http://localhost:3000/
```

## 常见问题与解决方案

### 1. 无法连接到MongoDB

**问题现象**：应用启动时报错"MongoNetworkError: failed to connect to server"

**解决方案**：
- 检查MongoDB服务是否正在运行：`systemctl status mongod`
- 检查MongoDB连接字符串是否正确
- 检查防火墙设置是否阻止了连接

### 2. API密钥配置错误

**问题现象**：向量化或搜索功能无法正常工作

**解决方案**：
- 检查`.env`文件中的API密钥是否正确配置
- 验证DashScope和DashVector服务是否已正确开通
- 检查API密钥是否有足够的权限

### 3. 端口被占用

**问题现象**：启动应用时提示端口已被占用

**解决方案**：
- 更改应用端口：修改`.env`文件中的PORT配置
- 或者终止占用端口的进程：`lsof -i :3000` 然后 `kill -9 PID`

### 4. PM2管理服务

```bash
# 查看所有应用状态
pm2 list

# 查看应用详细信息
pm2 show xiaohongshu-ai-search

# 查看应用日志
pm2 logs xiaohongshu-ai-search

# 重启应用
pm2 restart xiaohongshu-ai-search

# 停止应用
pm2 stop xiaohongshu-ai-search

# 删除应用
pm2 delete xiaohongshu-ai-search
```

## 项目结构说明

```
xiaohongshu-ai-search/
├── src/
│   ├── server.js              # 主服务文件
│   ├── utils/
│   │   ├── dashvector.js      # DashVector客户端
│   │   └── dashscope.js       # DashScope客户端
│   ├── services/
│   │   └── vectorService.js   # 向量处理服务
│   ├── middleware/
│   │   └── vectorMiddleware.js # 向量处理中间件
│   └── scripts/
│       ├── initCollection.js   # 初始化集合脚本
│       └── batchVectorize.js   # 批量向量化脚本
├── docs/
│   └── API.md                 # API文档
├── .env                       # 环境变量配置文件
├── package.json               # 项目配置文件
└── README.md                  # 项目说明文件
```

## API接口使用

部署完成后，可以通过以下接口与服务进行交互：

1. 导入笔记数据：`POST /notes`
2. 获取所有笔记：`GET /notes`
3. 搜索笔记：`GET /search?query=关键词`

详细API使用说明请参考`docs/API.md`文件。