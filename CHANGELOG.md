# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.2] - 2026-10-31

### Fixed

- Builds no longer emit sourcemaps, so the published package contains no
  `.map` files and does not expose `src` through `sourcesContent`. Sourcemaps
  remain available in the playground dev server.

## [0.5.1] - 2026-10-31

### Fixed

- `el-form`'s `text` extension attribute is now declared for template type
  checking through Vue's `ComponentCustomProps`. `<el-form :text>` and
  `<el-form text>` get completion and checking, while the runtime keeps using
  the fallthrough attribute.

## [0.5.0] - 2026-10-31

### Added

- `TextFormItem`'s `prop` now also accepts an array of path segments
  (`['user', 'addresses', '0', 'city']`), matching `ElFormItem`. Formatter
  contexts receive the dotted string form.

### Fixed

- `TextFormItem` now declares the forwarded `ElFormItem` props (`label`,
  `labelWidth`, `labelPosition`, `required`, `rules`, `error`,
  `validateStatus`, `for`, `inlineMessage`, `showMessage`, `size`) in its
  public type and forwards them explicitly. Projects using Nuxt with
  `strictTemplates` no longer get unknown-prop errors for `<TextFormItem label="…">`.
- Nuxt module registers the components through `addComponent()`, so Nuxt
  generates `components.d.ts` and template type checking recognizes
  `<TextFormItem>` / `<JsonPreview>`. The module also injects the
  `epFieldView` config types into `.nuxt`.

## [0.4.0] - 2026-10-31

### Added

- Nuxt module option `elementPlusStyles` (default `true`) to control the
  Element Plus styles injected by the module.

### Fixed

- Nuxt module now injects the Element Plus styles for components imported
  directly by the package (`el-form-item`, `el-image`, `el-rate`, `el-tag`).
  `@element-plus/nuxt` only scans project templates for `resolveComponent()`
  calls, so `.el-form-item` previously lost its `display: flex` layout and
  labels stacked above their content.

## [0.3.0] - 2026-10-31

### Added

- Formatter presets: `moneyFormatter`, `percentFormatter`, `dateFormatter`
  and `dictFormatter`, exported with their option types.
- `JsonPreview` component for structured object / array values, with Date,
  Map, Set, BigInt and circular-reference handling. Registered globally when
  the plugin is installed.
- `ElUpload` text display: file names from the model file list, falling back
  to the component `file-list`, then to URLs.
- `ElImage` support with `imageMode: 'text' | 'image'`; image mode renders
  readonly `el-image` thumbnails with preview, `fit` and `lazy` preserved.
- `el-config-provider` namespace support: Element Plus variable sources are
  redirected to `--{namespace}-*` with `--el-*` fallbacks, and form-item
  selectors match by class suffix.
- Nuxt 3 / Nuxt 4 SSR support with a typed module entry:
  `modules: ['ep-field-view/nuxt']` and `epFieldView` options. The module
  registers components, injects the stylesheet and transpiles the package.
  Verified with Nuxt 3.21.11 and 4.6.3.
- When Nitro externalizes this package and `formContextKey` is duplicated, the
  component falls back to the parent `ElForm`'s `model` / `size` props.
- `FieldViewFormatterContext.separator` so custom formatters can reuse the
  active multiple-value separator.

### Changed

- `ElCascader` now resolves `emitPath: false` leaf values to full paths and
  de-duplicates multiple values and paths. The index uses O(1) map lookups.
- `rateMode="rate"` keeps using a disabled `el-rate`, but now adds
  `aria-hidden`, `tabindex="-1"` and `pointer-events: none`, so text mode
  exposes no interactive form control.
- Release flow uses `release-it` with `@release-it/conventional-changelog`;
  CHANGELOG entries and GitHub releases are generated from Conventional
  Commits.
- Docs add formatter presets, JsonPreview, upload/image and namespace guides,
  and the playground demonstrates the new capabilities.

## [0.2.0] - 2026-10-31

### Added

- `ElSelectV2` grouped options and `value-key` object values now resolve to
  option labels in text mode.
- `inputTagMode="tag"` tags share an `.ep-field-view__tags` container with
  configurable `--ep-field-view-tag-gap` spacing (6px, 4px for `small`).
- Nuxt 3 / SSR guide with hydration guidance and known limitations.
- Playwright visual regression for light, dark and compact themes, with
  committed baselines and a 200-field benchmark page (`playground/stress.html`).
- Playground accepts `?text=false`, `?theme=...` and `?dark=true` to reproduce
  a fixed state.

### Changed

- A single `MutationObserver` is shared per form element and disconnects when
  the last `TextFormItem` unmounts.
- Test suite expanded to 84 cases; statement coverage 93.41%, branch 86.85%.

## [0.1.0] - 2026-10-31

### Added

- `TextFormItem` component: renders the default slot in edit mode and a
  formatted value in text mode.
- Inherit `text` from `el-form` (fallthrough attribute), per-field override,
  and runtime switching via `MutationObserver`.
- Text mode is independent from Element Plus' native `disabled` / `readonly`
  states; `el-form readonly` does not trigger text mode.
- Automatic label resolution for `el-select`, `el-select-v2`, `el-radio-group`,
  `el-checkbox-group`, `el-cascader`, `el-transfer`, `el-tree-select`,
  `el-segmented`, `el-date-picker`, `el-time-picker`, `el-switch`,
  `el-slider`, and more.
- Nested `prop` paths (`a.b[0].c` and `a.b.0.c`), explicit `value`, and
  empty/`0`/`false` handling.
- Global configuration: `emptyText`, `separator`, `rangeSeparator`,
  `dateFormat`, `timeFormat`, `activeText`, `inactiveText`, `theme`,
  `skipValidation`, `nowrapInTable`, `optionProps`.
- `formatter`, `text` slot, explicit `options` / `optionProps`.
- Configurable `rateMode`: plain score text (default) or a disabled
  `el-rate` that preserves custom icons/images.
- Multiple values use a configurable separator, defaulting to `;`.
- Component-provided display: `el-select`'s `#label` slot and the selected
  radio/checkbox default slot are rendered as VNodes (rich content preserved);
  input affix slot text and the `el-input-number` `formatter` are also reused.
- Text rows follow the form / form-item `size` for their minimum height and
  font size (small: 12px, default/large: 14px, matching Element Plus).
- Theming: CSS variables, built-in `compact` / `bold` / `plain` themes,
  arbitrary custom theme classes, dark mode.
- Skip validation in text mode and restore field registration on edit.
- Table-friendly layout: automatic spacing removal and single-line ellipsis.
- TypeScript types, ESM / UMD / CSS / sourcemaps.
- VitePress docs, playground, Vitest tests, ESLint / Stylelint / Prettier,
  CI and release workflows.

### Fixed (compared to the reference implementation)

- `0` and `false` are no longer treated as empty values.
- Runtime `el-form text` toggling works immediately (no polling).
- No VNode prop mutation to bypass validation.
- More consistent separators for multiple and range values.
- Cascader single values, `emitPath: false`, and multiple modes no longer throw.
- Time picker string values are displayed as-is instead of invalid date formats.

### Dependencies

- peer: `vue >= 3.3.0`, `element-plus >= 2.6.0`
- runtime: `dayjs ^1.11`

[0.1.0]: https://github.com/jktantan/ep-field-view/releases/tag/v0.1.0
[0.2.0]: https://github.com/jktantan/ep-field-view/releases/tag/v0.2.0
[0.3.0]: https://github.com/jktantan/ep-field-view/releases/tag/v0.3.0
[0.4.0]: https://github.com/jktantan/ep-field-view/releases/tag/v0.4.0
