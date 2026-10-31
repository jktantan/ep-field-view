# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
