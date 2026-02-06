# Woodll Tools

面向开发者与 IT 从业者的在线工具箱，基于 IT-Tools 深度修改。

## 预览

![预览 1](./1.jpeg)

![预览 2](./2.jpeg)

![预览 3](./3.jpeg)

## 与原版 IT-Tools 的主要差异

基于上游项目（CorentinTh/it-tools），本项目新增与调整如下：

- **新增 VPS 剩余价值计算器**
  - 支持续费金额、付费周期（年/三年/半年/季/月）、交易日期/到期日期、溢价百分比
  - 结算币种/支付币种切换，实时汇率参考与手动汇率
  - 生成并分享 **SVG 结果图**，支持预览
- **新增后台管理服务（Node）**
  - 站点配置（标题、描述、图标、Canonical）
  - 工具管理（启用/隐藏、排序、分类）
- **分享 SVG 结果图**
  - 后端生成并保存到 `data/uploads`
  - 前端一键复制 `![image](url)` 分享代码
- **结果卡片展示增强**
  - 展示“剩余金额 + 溢价”的分解与汇总
  - 显示当前站点域名
- **全新浅色、深色 UI**
- **99% 汉化**
- **新增工具**
  - PNG 转 ICO
  - IPv4 查看本机 IP
  - JSON 差异比较
  - 编码转换
  - 正则表达式
- **性能优化**

上游项目更多说明请参考原仓库 README。

## 部署（推荐：直接用发布包）

请从 **Releases** 下载已打包好的版本，解压后直接上传到服务器即可使用。

### Nginx 必需配置（否则 /admin 会 404）

```nginx
location /api/ {
  try_files $uri $uri/ /api/index.php?$query_string;
}
```

## Docker Compose 一键部署

保存为 `docker-compose.yml`，然后执行 `docker compose up -d` 即可运行。

```yaml
version: "3.8"

services:
  woodll-tools:
    image: ghcr.io/likew1nd/woodll-tools:latest
    ports:
      - "8080:80"
    volumes:
      - ./data:/var/www/html/data
      - ./uploads:/var/www/html/uploads
    restart: unless-stopped
```

## 开发与自定义（可选）

如需本地开发或自定义，请自行安装依赖并启动开发环境。

## License

[GNU GPLv3](LICENSE)
