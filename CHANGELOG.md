# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-31

### Added

- `ReadonlyFormItem` component: renders the default slot in edit mode and a
  formatted value in read-only mode.
- Inherit `readonly` from `el-form` (fallthrough attribute), per-field override,
  and runtime switching via `MutationObserver`.
- Automatic label resolution for `el-select`, `el-select-v2`, `el-radio-group`,
  `el-checkbox-group`, `el-cascader`, `el-transfer`, `el-tree-select`,
  `el-segmented`, `el-date-picker`, `el-time-picker`, `el-switch`,
  `el-slider`, and more.
- Nested `prop` paths (`a.b[0].c` and `a.b.0.c`), explicit `value`, and
  empty/`0`/`false` handling.
- Global configuration: `emptyText`, `separator`, `rangeSeparator`,
  `dateFormat`, `timeFormat`, `activeText`, `inactiveText`, `theme`,
  `skipValidation`, `nowrapInTable`, `optionProps`.
- `formatter`, `readonly` slot, explicit `options` / `optionProps`.
- Component-provided display: `el-select`'s `#label` slot and the selected
  radio/checkbox default slot are rendered as VNodes (rich content preserved);
  input affix slot text and the `el-input-number` `formatter` are also reused.
- Read-only rows follow the form / form-item `size` for their minimum height and
  font size (small: 12px, default/large: 14px, matching Element Plus).
- Theming: CSS variables, built-in `compact` / `bold` / `plain` themes,
  arbitrary custom theme classes, dark mode.
- Skip validation while read-only and restore field registration on edit.
- Table-friendly layout: automatic spacing removal and single-line ellipsis.
- TypeScript types, ESM / UMD / CSS / sourcemaps.
- VitePress docs, playground, Vitest tests, ESLint / Stylelint / Prettier,
  CI and release workflows.

### Fixed (compared to the reference implementation)

- `0` and `false` are no longer treated as empty values.
- Runtime `el-form readonly` toggling works immediately (no polling).
- No VNode prop mutation to bypass validation.
- More consistent separators for multiple and range values.
- Cascader single values, `emitPath: false`, and multiple modes no longer throw.
- Time picker string values are displayed as-is instead of invalid date formats.

### Dependencies

- peer: `vue >= 3.3.0`, `element-plus >= 2.6.0`
- runtime: `dayjs ^1.11`

[0.1.0]: https://github.com/jktantan/ep-field-view/releases/tag/v0.1.0
