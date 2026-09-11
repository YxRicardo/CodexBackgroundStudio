# Background Studio layout contract (1.0.3)

The application uses the bundled CodeDrobe compatibility adapter without editing Codex installation files.

Home and new-conversation pages retain their native content layout, scrollbars, gutters, title, cards, project chooser and composer geometry. Unlike the original AzureReverie template, the generated home background is painted on the bordered main shell when it contains `.dream-home`. The content container has no decorative pseudo-elements, so its scrollbar gutters and scroll fade cannot crop the wallpaper. This is an intentional adaptation of the template for the generic background editor.

Only one background image and one wash layer are active on the main shell. On home, the more specific home rule selects the home settings; on conversations, the default rule selects chat settings (or home settings when synchronized). Both use the same canvas dimensions. Decorations have pointer-events:none and stay below the content. CSS does not reposition home content or disable its native scrolling.

The workspace title bar (the area labelled “我的工作空间”) is an independent frosted-glass surface. Its overlay color, opacity, and blur are adjustable separately from the general panel and sidebar settings, while the selector continues to target the native header only.

The native MainContentTopFade decoration is made transparent in both ChatGPT Chat and Work so its token-colored gradient cannot form a strip over the artwork. The title toolbar remains a separate readable panel. The composer layout root stays transparent, while the native rounded ComposerLayoutBody owns the configured panel color. This keeps a single traditional rounded overlay in ChatGPT Chat and Work/home views.

Scheduled tasks and Plugins share a sticky search tray. Its native opaque surface and downward token-colored fade are disabled, while the search-field wrapper receives the configured panel color and opacity as its only glass layer.

Private screenshot evidence and layout verification are stored under work and are excluded from release archives.

Request input cards: the observed native outer surface is `[data-codex-composer-request-navigation]`, with `bg-surface-elevated-secondary` and `@container/request-card`. Apply the composer panel color, opacity and border once to that outer surface, including its question title and footer. Do not tint `radiogroup` parents: this stacks washes over an opaque outer card and misses free-text requests. The selector does not depend on options being present. Verify computed card and inner backgrounds in the live renderer, not only the emitted CSS string.

User-message background opacity applies to the native `.bg-user-message` bubble, preserving its padding and rounded corners. The inner Markdown background is transparent so the message has a single background layer, including at zero opacity.

1.0.6: Optional shared wallpaper uses the common shell with a direct sidebar child and descendant main. Paint artwork once behind both regions; disable their local artwork only when enabled. Home detection selects home settings, otherwise chat settings. Sidebar uses only an optional color overlay and backdrop blur. Native content structure remains unchanged.

1.0.7: Scope the workspace-header glass fallback to the main content surface, then apply the glass to the header's flexible workspace section instead of the full fixed header. The fixed header also spans an open details sidebar; leaving it unfiltered keeps sidebar controls such as Enter fullscreen crisp.

Right tool-panel chrome: the native right-panel aside sets only `--app-shell-panel-background` to transparent, exposing the existing main/shared wallpaper through its frame and tab-content wrappers. Right-controller tab rows and pane-height toolbars reuse the workspace-header overlay color, strength and blur. Tab overflow fades and the sticky add-tab tray are transparent, while native selection, hover, focus, borders, resizing and layout remain intact. General surface tokens, terminal rendering, file-tree Shadow DOM and embedded WebViews are not overridden. Existing content that is already transparent naturally reveals the wallpaper. No extra wallpaper layer or runtime observer is needed.

Markdown editor readability: when a right-panel CodeMirror editor contains Markdown-specific heading, list, or fenced-code nodes, its root receives the same panel color and `replyOpacity` used by assistant replies. The selector stays off terminals and non-Markdown panels, and the native editor scrolling, selection and editing behavior are preserved.

Pinned summary (verified against the live Windows DOM): the card is a rounded `bg-surface-elevated-secondary` container with `data-slot="thread-summary-panel-item-button"` descendants. It has no pinned-summary test hook. Match that container and apply the panel wash and workspace blur once; clear the native sticky section-header background and its `::before` filler. Preserve item hover and focus states. CSS string tests alone do not establish that a native surface matches; the live regression check must assert a visible card and its computed styles.

Settings glass: the native settings navigation is `nav.sidebar-navigation` inside the left panel. Its main content surface has `electron:bg-surface` and a direct `.scrollbar-stable.overflow-y-auto.p-panel` child. Scope the wash to that combination, independent of translated labels or generated class hashes. Reuse the existing chat/shared wallpaper; apply settingsWash/settingsOverlay/settingsBlur once on the content surface. Set only its inherited `--color-background-panel` to transparent so settings cards retain borders without stacking opaque fills. Preserve native inputs, switches, theme preview surfaces, scrolling and sidebar appearance. Older looks inherit the panel color with 65% wash and 12px blur. The Colors & panels controls and Settings preview support editing, saving and exporting these values. Live verification covers 0/37/100% wash, unchanged control state and geometry; General, Appearance, Personalization and Keyboard shortcuts were inspected on Windows.
