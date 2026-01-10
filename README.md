# Woodll Tools

一个面向开发者和 IT 从业人员的在线工具箱，支持后台管理与站点配置。

## 功能亮点

- 多工具集合（加密、转换、文本、网络等）
- 后台管理：工具上架/隐藏、分类、排序、推荐
- 站点配置：标题、标题描述、SEO 描述、站点网址
- 多语言与本地化配置
- 前后端分离，静态部署 + PHP API

## 开发

```sh
pnpm install
pnpm dev
```

## 构建

```sh
pnpm build
```

构建完成后，产物在 `dist/`。PHP API 会自动复制到 `dist/api`，并生成 `dist/data`。

## 部署（Nginx + PHP）

将 `dist/` 上传到站点根目录，确保 PHP 已启用，并且 `data/`、`uploads/` 可写。

示例 Nginx 规则：

```nginx
location /api/ {
  try_files $uri /api/index.php?$query_string;
}

location ~ \.php$ {
  include fastcgi_params;
  fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  fastcgi_param PATH_INFO $fastcgi_path_info;
  fastcgi_pass unix:/run/php/php8.2-fpm.sock;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

## 后台管理

- 访问：`/admin`
- 默认账号：`admin`
- 默认密码：`admin123`

生产环境请及时修改密码或通过环境变量设置：

```sh
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
```

## 开源说明

本项目基于 [IT Tools](https://github.com/CorentinTh/it-tools) 进行二次开发。

## License

[GNU GPLv3](LICENSE)
