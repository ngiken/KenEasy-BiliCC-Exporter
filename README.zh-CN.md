<div align="center">
  <img src="assets/github-preview.png" alt="KenEasy BiliCC Exporter" width="100%">

  <h1>KenEasy BiliCC Exporter</h1>

  <p>
    从 Bilibili / B站当前视频页读取 CC 字幕并导出为 <code>TXT</code> / <code>SRT</code>，支持下载当前视频（含音频），并提供一键更新到最新版。
  </p>

  <p>
    中文
    ·
    <a href="README.md">English</a>
    ·
    <a href="CHANGELOG.md">更新记录</a>
  </p>

  <p>
    <a href="https://chromewebstore.google.com/detail/keneasy-bilicc-exporter/nifdbandikjjmgkagghonjjckmpccgng?hl=zh-CN"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome_%E5%BA%94%E7%94%A8%E5%95%86%E5%BA%97-%E5%AE%98%E6%96%B9%E4%B8%8A%E6%9E%B6-4285F4?logo=googlechrome&logoColor=white"></a>
    <img alt="Version" src="https://img.shields.io/badge/version-2.0.0-fb7299">
    <img alt="Manifest" src="https://img.shields.io/badge/manifest-v3-00aeec">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-27c499">
  </p>
</div>

## 🚀 安装方式

### 方式一：Chrome 官方应用商店安装（推荐）

通过 Chrome Web Store 官方商店一键点击安装，后续支持自动静默更新，体验最省心（无需手动下载解压）：

👉 **[前往 Chrome Web Store 官方商店安装 KenEasy BiliCC Exporter](https://chromewebstore.google.com/detail/keneasy-bilicc-exporter/nifdbandikjjmgkagghonjjckmpccgng?hl=zh-CN)**

### 方式二：本地开发者模式手动安装

若无法直接访问 Chrome 应用商店，可选择离线手动安装：

1. 到 [最新 Release 页面](https://github.com/ngiken/KenEasy-BiliCC-Exporter/releases/latest) 下载 `KenEasy-BiliCC-Exporter-manual-install.zip`。
2. 解压下载的 zip 文件。
3. 在 Chrome 浏览器地址栏打开 `chrome://extensions/`。
4. 开启右上角的「开发者模式」。
5. 点击左上角的「加载已解压的扩展程序」。
6. 选择解压出来的 `KenEasy-BiliCC-Exporter` 文件夹。
7. 打开任意 Bilibili 视频页面（如 `https://www.bilibili.com/video/BV...`）即可开始使用。

## 项目简介

KenEasy BiliCC Exporter 是一个轻量 Chrome 扩展，面向 Bilibili 视频页面使用。它会识别当前视频的 `BV`、读取可用的 CC 字幕轨道，并保存为纯文本或标准 SRT 字幕文件。

![KenEasy BiliCC Exporter 界面演示](assets/popup-demo.png)

## 核心能力

| 能力 | 说明 |
| --- | --- |
| B站视频识别 | 自动读取当前视频页，并解析 `BV`、`aid`、`cid`。 |
| 字幕轨道发现 | 优先使用页面已加载的字幕数据，失败时回退到 Bilibili Web API。 |
| TXT / SRT 导出 | 支持保存纯文本和标准字幕文件，并使用 UTF-8 BOM 兼容 Windows 工具。 |
| 视频 / 音频下载 | 将当前 B 站视频连同音频（或仅音频）保存到本地 |
| 一键更新 | 检查 GitHub Release，下载最新安装包并引导重新加载 |
| 适合上架 | 扩展体积小，无第三方运行依赖，方便 Chrome Web Store 打包。 |

## 使用介绍 / 使用演示

最新录制的完整使用介绍影片（对应当前弹窗界面：字幕导出、视频下载、检查更新）：

**[使用介绍影片（UseDemo.mp4）](UseDemo.mp4)**

![KenEasy BiliCC Exporter 使用演示](assets/use-demo.gif)

上方 GIF 是快速预览；点开 UseDemo.mp4 可观看真实扩展操作录屏。

## 扩展内帮助与关于

弹窗底部的「使用帮助」会打开扩展内置的帮助页面。该页面包含：

- 三步字幕导出教程
- 弹窗位置说明与实际截图
- 完整动态操作演示
- Chrome 开发者模式安装步骤
- TXT / SRT 格式说明与常见问题

帮助页面使用扩展内的本地资源，无需额外网络请求，并支持中英文和深浅色外观。

## 打包

打包时要压缩 `chrome-extension` 文件夹里面的内容，不要把外层文件夹一起压进去。

```bash
python scratch/zip_extension.py
```

隐私政策：[PRIVACY.md](PRIVACY.md)

商店发布检查清单：[docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md)

## 架构说明

扩展采用分层设计，解耦清晰，规则与数据驱动。

```text
brand-config.js
  统一的产品命名、消息命名空间、日志前缀与本地存储键名。

content-main.js
  运行在页面主上下文（Page World），监听 B站播放器和字幕请求，支持同源请求。

content.js
  运行在扩展隔离上下文（Isolated World），桥接弹窗/后台消息，并缓存字幕线索。

background.js
  负责 B站 API 调度、WBI 签名、字幕 JSON 加载与错误标准化。

popup.js
  负责 UI 状态、缓存偏好、TXT/SRT 转换、预览、下载以及检查更新逻辑。

update-config.js / update-service.js
  数据驱动的 GitHub Release 版本检查与更新包下载策略。
```

## 友情链接

- [LINUX DO](https://linux.do)

## 开源协议

MIT
