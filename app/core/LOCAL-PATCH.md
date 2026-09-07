# Local compatibility patch
Base: @codedrobe/core 0.6.1, Apache-2.0. LICENSE and NOTICE retained.
Authorized local development build for Windows Codex 26.901.6511.0, not an official release.

- Adapter preserves the old main-surface selector and accepts the observed bordered main window with its header context-menu surface.
- Recognizes editable ProseMirror nodes and excludes avatar-overlay auxiliary windows.
- Profile identifies home-main-content with game-source and removes its owned home classes during cleanup.
- Profile anchors decoration to the bordered main window rather than any outer main element.
- No changes to the underlying CDP implementation, authentication, or Codex installation.
`n- Background Studio 1.0.4: replaces the repeated-group Base64 regular expression with a constant-stack character scanner. Preserves alphabet, length, and padding validation while accepting multi-megabyte image assets without V8 RegExp stack overflow.
