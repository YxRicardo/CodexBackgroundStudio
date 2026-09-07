# Codex Background Studio

Codex Background Studio is a local Windows editor for configuring backgrounds, colors, and panels in the Codex desktop app. It is an independent project and is not an official OpenAI extension.

The interface defaults to English and includes an in-app English / Chinese language switcher.

## Features

- Independently configure home, chat, sidebar, and panel appearances.
- Use a solid color, gradient, or PNG/JPEG/WebP image (up to 6 MB).
- Adjust image position, zoom, blur, opacity, and overlay strength.
- Independently adjust the workspace title bar’s overlay color, strength, and frosted-glass blur.
- Share a continuous background between the main content and sidebar.
- Preview changes locally before applying them to Codex.
- Save, import, export, and switch between local looks.
- Apply a theme with validation and retain the active theme through the local service.
- Restore the last theme applied by this app after Windows sign-in and the next Codex launch.

## Requirements

- Windows
- Node.js 22.4 or later
- Codex desktop app

## Run from source

```powershell
node .\app\server.mjs
```

Open [http://127.0.0.1:47831](http://127.0.0.1:47831) in a browser. The app only listens on the loopback interface.

To restore the most recently applied background after a Windows sign-in, apply a look first, then select **Enable sign-in recovery** under **Recovery & runtime**. This creates a startup entry for the current Windows user only; it does not require administrator privileges or modify Codex files. Select **Disable sign-in recovery** (or run `DisableBackgroundAutoStart.ps1`) to remove that entry. If you move the application folder, disable and re-enable recovery so the startup entry points to the new location.

## Safety and privacy

The application does not modify Codex installation files, authentication data, or task content. Theme state, drafts, saved looks, exported packages, logs, and verification screenshots are local-only.

This repository deliberately excludes all user-specific and generated material:

- `data/` — local drafts, saved looks, active state, and backups
- `exports/` — exported theme packages and editable configurations
- `work/` — logs, test outputs, and private verification screenshots
- `runtime/`, `*.exe`, and `*.zip` — bundled runtime and distribution artifacts

No personal files or preconfigured user theme are included in the repository.

## Compatibility

The project was developed against Codex for Windows 26.901.6511.0. Codex UI updates can change the page structure and may require compatibility updates. The project has been tested on home and chat pages, including shared sidebar backgrounds; every Codex release, third-party theme, and menu state is not guaranteed.

## License and notices

This project is released under the Apache-2.0 license. The full license text is available in [app/core/LICENSE](app/core/LICENSE). [app/core/NOTICE](app/core/NOTICE) preserves the notices for the bundled CodeDrobe Core compatibility code.

---

# Codex Background Studio（中文）

Codex Background Studio 是一款 Windows 本地编辑器，用于配置 Codex 桌面应用的背景、配色和面板。它是独立项目，并非 OpenAI 官方扩展。

界面默认使用英语，并提供应用内的 English / 中文语言切换。

## 功能

- 分别配置首页、对话、侧栏和面板外观。
- 支持纯色、渐变或 PNG/JPEG/WebP 图片（最大 6 MB）。
- 调节图片位置、缩放、模糊、透明度和遮罩强度。
- 单独调节工作空间顶部标题栏的遮罩颜色、强度和毛玻璃模糊。
- 让主内容区和侧栏共用连续背景。
- 在应用到 Codex 前先进行本地预览。
- 在本机保存、导入、导出和切换方案。
- 应用主题时执行验证，并由本地服务保持当前主题。
- Windows 登录后自动启动本地服务，并在下次打开 Codex 时恢复本 App 最后应用的主题。

## 运行要求

- Windows
- Node.js 22.4 或更高版本
- Codex 桌面应用

## 从源码运行

```powershell
node .\app\server.mjs
```

在浏览器中打开 [http://127.0.0.1:47831](http://127.0.0.1:47831)。应用仅监听本机回环地址。

如需在 Windows 登录后恢复最近一次已应用的背景，请先应用方案，再在“恢复与运行管理”中点击“启用开机恢复”。它仅为当前 Windows 用户创建登录启动项，无需管理员权限，也不会修改 Codex 文件。可点击“禁用开机恢复”（或运行 `DisableBackgroundAutoStart.ps1`）移除该启动项。若移动应用文件夹，请先禁用再重新启用，以更新启动路径。

## 隐私与安全

应用不会修改 Codex 安装文件、认证数据或任务内容。主题状态、草稿、收藏方案、导出包、日志和验证截图均仅保存在本机。

仓库明确排除所有用户专属和生成内容：

- `data/`：本地草稿、收藏方案、当前状态和备份
- `exports/`：导出的主题包和可编辑配置
- `work/`：日志、测试输出和私有验证截图
- `runtime/`、`*.exe`、`*.zip`：内置运行时和分发产物

仓库不包含个人文件或预先配置的用户主题。

## 兼容性

项目基于 Windows 版 Codex 26.901.6511.0 开发。Codex UI 更新可能改变页面结构，届时可能需要更新兼容逻辑。项目已测试首页、对话页和侧栏共用背景；不保证兼容每个 Codex 版本、第三方主题或菜单状态。

## 许可证与声明

项目使用 Apache-2.0 许可证发布。完整条款见 [app/core/LICENSE](app/core/LICENSE)；[app/core/NOTICE](app/core/NOTICE) 保留了内置 CodeDrobe Core 兼容代码的声明。
