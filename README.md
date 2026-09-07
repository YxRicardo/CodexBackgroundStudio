# Codex Background Studio

Codex Background Studio is a local Windows editor for configuring backgrounds, colors, and panels in the Codex desktop app. It is an independent project and is not an official OpenAI extension.

The interface defaults to English and includes an in-app English / Chinese language switcher.

## Features

- Independently configure home, chat, sidebar, and panel appearances.
- Use a solid color, gradient, or PNG/JPEG/WebP image (up to 6 MB).
- Adjust image position, zoom, blur, opacity, and overlay strength.
- Share a continuous background between the main content and sidebar.
- Preview changes locally before applying them to Codex.
- Save, import, export, and switch between local looks.
- Apply a theme with validation and retain the active theme through the local service.

## Requirements

- Windows
- Node.js 22.4 or later
- Codex desktop app

## Run from source

```powershell
node .\app\server.mjs
```

Open [http://127.0.0.1:47831](http://127.0.0.1:47831) in a browser. The app only listens on the loopback interface.

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
