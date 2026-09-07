# Background Studio layout contract (1.0.3)

The application uses the bundled CodeDrobe compatibility adapter without editing Codex installation files.

Home and new-conversation pages retain their native content layout, scrollbars, gutters, title, cards, project chooser and composer geometry. Unlike the original AzureReverie template, the generated home background is painted on the bordered main shell when it contains `.dream-home`. The content container has no decorative pseudo-elements, so its scrollbar gutters and scroll fade cannot crop the wallpaper. This is an intentional adaptation of the template for the generic background editor.

Only one background image and one wash layer are active on the main shell. On home, the more specific home rule selects the home settings; on conversations, the default rule selects chat settings (or home settings when synchronized). Both use the same canvas dimensions. Decorations have pointer-events:none and stay below the content. CSS does not reposition home content or disable its native scrolling.

The workspace title bar (the area labelled “我的工作空间”) is an independent frosted-glass surface. Its overlay color, opacity, and blur are adjustable separately from the general panel and sidebar settings, while the selector continues to target the native header only.

The home-specific native MainContentTopFade decoration is made transparent. The title toolbar remains a separate readable panel. For the home composer, its root background is transparent and the native rounded ComposerLayoutBody owns the configured panel color; ordinary conversations retain their root panel background.

Private screenshot evidence and layout verification are stored under work and are excluded from release archives.

1.0.6: Optional shared wallpaper uses the common shell with a direct sidebar child and descendant main. Paint artwork once behind both regions; disable their local artwork only when enabled. Home detection selects home settings, otherwise chat settings. Sidebar uses only an optional color overlay and backdrop blur. Native content structure remains unchanged.
