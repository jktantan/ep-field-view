export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  ignoreFiles: ['dist/**', 'dist-playground/**', 'node_modules/**', 'coverage/**', 'docs/.vitepress/cache/**'],
  overrides: [
    {
      files: ['playground/**/*.{vue,css}', 'docs/**/*.{vue,css}'],
      rules: {
        'selector-class-pattern': null
      }
    }
  ],
  rules: {
    'selector-class-pattern': [
      '^(?:ep-field-view(?:__[a-z0-9-]+|--[a-z0-9-]+)?|el-[a-z0-9_-]+)$',
      {
        message: 'Class names must follow the ep-field-view BEM pattern (block__element--modifier).'
      }
    ],
    'custom-property-pattern': [
      '^(?:ep-field-view|el)-[a-z0-9-]+$',
      { message: 'Custom properties must start with --ep-field-view- (or --el- when referencing Element Plus).' }
    ],
    'no-descending-specificity': null,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'slotted', 'global'] }],
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep', 'v-slotted', 'v-global'] }],
    'comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'value-keyword-case': ['lower', { camelCaseSvgKeywords: true }]
  }
}
