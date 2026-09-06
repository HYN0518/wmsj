# 九小卿攻略站

游戏攻略资料站 —— 涵盖门派、装备、宠物、仙侣、活动等全方位攻略，支持智能搜索，PC / 移动端自适应。

## 本地预览

任选其一：

| 方式 | 命令 |
| --- | --- |
| Node | `npm run dev`（首次会自动安装 serve），访问 http://localhost:5173 |
| Python | `python -m http.server 8000`，访问 http://localhost:8000 |

## 网站板块

- 下载教程
- 赛季说明
- 新功能（悟道、面饰、腰饰、经验等）
- 门派（15 个门派详解）
- 人物提升（装备、技能、羽翼、坐骑等 13 项）
- 宠物 / 仙侣 / 家园 / 子女
- 活动
- 便捷功能（性别重生、门派转换、智能组队等）

## 目录结构

```
wmsj/
├── index.html            # 主页面（搜索、导航、内容、弹层）
├── char_*.html           # 人物提升各专题页
├── conv_*.html           # 便捷功能各专题页
├── feature_*.html        # 新功能专题页
├── pet.html              # 宠物攻略（图文+视频教程）
├── companion.html        # 仙侣攻略
├── children.html         # 子女攻略
├── download.html         # 下载教程
├── 404.html
├── art/                  # 攻略配图与视频（WebP/MP4 已压缩）
├── icons/                # 物品/技能图标
├── manifest.json         # PWA 站点清单
├── robots.txt / sitemap.xml
├── package.json          # 本地预览脚本
└── .github/workflows/    # GitHub Pages 部署
```

## 部署

- **Cloudflare Pages**（主部署）：连接 GitHub 仓库后，每次 push 到 `main` 自动构建上线。
- **GitHub Pages**：推送后 `.github/workflows/deploy.yml` 自动部署（需在仓库 `Settings → Pages` 将 Source 设为 **GitHub Actions**）。

## 自定义

- **主题色**：改 `index.html` 顶部 `:root` 里的 CSS 变量。
- **内容数据**：编辑 `index.html` 中 `SITE_DATA` 数组，添加/修改板块和子项。
- **图标素材**：子项卡片引用 `icons/` 目录下的图片，修改 `iconFile` 字段即可切换。
