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
    <img alt="Version" src="https://img.shields.io/badge/version-1.3.1-fb7299">
    <img alt="Manifest" src="https://img.shields.io/badge/manifest-v3-00aeec">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-27c499">
  </p>
</div>

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

## 使用演示

![KenEasy BiliCC Exporter 使用演示](assets/use-demo.gif)

完整使用影片：[UseDemo.mp4](UseDemo.mp4)

## 扩展内帮助与关于

弹窗底部的「使用帮助」会打开扩展内置的帮助页面。该页面包含：

- 三步字幕导出教程
- 弹窗位置说明与实际截图
- 完整动态操作演示
- Chrome 开发者模式安装步骤
- TXT / SRT 格式说明与常见问题

帮助页面使用扩展内的本地资源，无需额外网络请求，并支持中英文和深浅色外观。

## 使用方法

1. 打开一个 Bilibili 视频页面，例如 `https://www.bilibili.com/video/BV...`。
2. 点击浏览器右上角的 KenEasy BiliCC Exporter 扩展图标。
3. 点击「提取字幕」。
4. 选择需要的字幕轨道。
5. 点击 `TXT` 或 `SRT` 下载。

如果视频没有 CC 字幕，或者字幕需要登录后才能读取，扩展会显示对应提示。

## 本地安装

Chrome 不能直接拖拽安装从 GitHub 下载的 `.crx`，也不能把 `.zip` 直接当扩展安装。

1. 到最新 Release 下载 `KenEasy-BiliCC-Exporter-manual-install.zip`。
2. 解压这个 zip 文件。
3. 打开 `chrome://extensions/`。
4. 开启「开发者模式」。
5. 点击「加载已解压的扩展程序」。
6. 选择解压出来的 `KenEasy-BiliCC-Exporter` 文件夹。
7. 打开 Bilibili 视频页后使用 KenEasy BiliCC Exporter。

## 打包

打包时要压缩 `chrome-extension` 文件夹里面的内容，不要把外层文件夹一起压进去。

```bash
python scratch/zip_extension.py
```

Chrome Web Store 上传包是：

```text
KenEasy-BiliCC-Exporter-store.zip
```

## 架构说明

这个扩展按分层、解耦、规则化和数据化的方式组织。

```text
brand-config.js
  统一产品名称、内部消息命名空间、日志前缀和缓存前缀。

content-main.js
  运行在页面主环境，观察 Bilibili 播放器和字幕接口响应，也可使用页面会话发起请求。

content.js
  运行在扩展隔离环境，桥接 popup/background 消息，并短期缓存字幕元数据。

background.js
  负责 Bilibili API 请求、WBI 签名、字幕 JSON 下载和错误标准化。

popup.js
  负责界面状态、缓存优先策略、TXT/SRT 格式转换、预览和下载。
```

这样页面访问、扩展通信、接口规则和界面逻辑不会写死在单一逻辑里，后续维护和扩展更稳。

## 文件结构

```text
chrome-extension/
  manifest.json
  brand-config.js
  popup.html
  popup.css
  help.html
  help.css
  help.js
  help-assets/
  design-tokens.css
  theme-controller.js
  popup.js
  background.js
  content.js
  content-main.js
  icons/
assets/
UseDemo.mp4
KenEasy-BiliCC-Exporter-store.zip
KenEasy-BiliCC-Exporter-manual-install.zip
scratch/zip_extension.py
```


## 友情链接

- [LINUX DO](https://linux.do)

## 许可证

MIT
