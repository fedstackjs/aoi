---
outline: deep
---

# 开始使用

本章中，笔者将介绍如何部署并使用AOI评测系统。

跟随本章的指引，你将使用Docker Compose部署AOI评测系统，并启用密码登录方式。

## 准备部署AOI评测系统

AOI评测系统采用如下两种方式发布：

**1. npm**

| NPM包                                                              | 描述           |
| ------------------------------------------------------------------ | -------------- |
| [`@aoi-js/server`](https://www.npmjs.com/package/@aoi-js/server)   | AOI API服务器  |
| [`@aoi-js/frontend`](https://www.npmjs.com/package/@aoi-js/server) | AOI 前端       |
| [`@aoi-js/common`](https://www.npmjs.com/package/@aoi-js/common)   | 基本的共用代码 |

**2. Docker镜像**

| 镜像地址                                                 | 描述          |
| -------------------------------------------------------- | ------------- |
| `registry.cn-hangzhou.aliyuncs.com/aoi-js/server:latest` | AOI API服务器 |

本节中，你将使用Docker Compose部署AOI Server的Docker容器，并使用npm下载前端代码。

## Docker Compose配置

首先，创建一个目录，用于存放AOI的配置文件和数据文件。

```bash
mkdir aoi
```

然后，在其中创建一个`docker-compose.yml`文件，用于描述AOI Server的Docker容器。

```yaml
version: '3.8'

services:
  server:
    image: registry.cn-hangzhou.aliyuncs.com/aoi-js/server:latest
    expose:
      - '1926'
    environment:
      - AOI_MONGO_URL=mongodb://mongo:27017/aoi
      - AOI_JWT_SECRET=YourSecret
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    volumes:
      - ./mongo:/data/db

  caddy:
    image: caddy:latest
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./frontend:/var/www/html
    ports:
      - '80:80'
      - '443:443'
    depends_on:
      - server
```

## Caddy配置

创建Caddy配置文件`Caddyfile`，用于配置Caddy服务器。

```caddyfile
:80 {
    handle /api/* {
        reverse_proxy server:1926
    }

    handle {
        root * /var/www/html
        try_files {path} /index.html
        file_server
    }
}
```

## 前端文件

准备前端文件。

```bash
curl -L `npm view @aoi-js/frontend dist.tarball` | tar xvzf -
mv package/dist frontend
rm -rf package
```

启动Docker容器。

```bash
docker compose up -d
```

接下来，便可在 [http://localhost](http://localhost) 访问AOI评测系统，并注册账号。

## 设置系统管理员

最后，你需要手动将注册的账号设置为系统管理员。

```bash
docker exec -it aoi-mongo-1 mongosh <<EOF
use aoi
db.users.updateOne({}, {$set:{capability:Long(-1)}})
EOF
```

刷新页面，即可看见菜单页面中的 `Global Admin` 菜单。
