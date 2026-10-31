---
layout: home

hero:
  name: ep-field-view
  text: Element Plus 表单文本模式
  tagline: 写一次表单，编辑页与详情页自动切换
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 组件 API
      link: /components/text-form-item

features:
  - title: 自动解析选项标签
    details: 从插槽中的 el-select、el-radio-group、el-checkbox-group、el-cascader、el-transfer 等组件解析 label，不再显示裸值。
  - title: 日期与范围格式化
    details: 自动读取组件的 format / value-format，回退到与 Element Plus 一致的内置格式，范围值与多值使用可配置分隔符。
  - title: 文本模式继承与动态切换
    details: 支持 el-form 的 text 属性，也支持单字段覆盖；运行时切换通过 MutationObserver 同步，无定时器轮询。
  - title: 校验自动跳过
    details: 文本模式下字段不参与校验，也不会显示必填星号；切回编辑态自动恢复注册与规则。
  - title: 主题化
    details: 基于 Element Plus CSS 变量，提供 CSS 自定义属性、内置主题与任意自定义主题类，天然支持暗色模式。
  - title: 类型完整
    details: 使用 TypeScript 编写，提供完整 d.ts、全局配置类型与 formatter / 文本插槽扩展。
---

<script setup>
import { reactive } from 'vue'

const model = reactive({
  name: '张三',
  role: 'admin',
  tags: ['vue', 'ts'],
  joinedAt: new Date(2024, 4, 20)
})
</script>

<div class="demo-card">
  <el-form :model="model" text label-width="90px" label-suffix="：">
    <TextFormItem label="姓名" prop="name">
      <el-input v-model="model.name" />
    </TextFormItem>
    <TextFormItem label="角色" prop="role">
      <el-select v-model="model.role">
        <el-option label="管理员" value="admin" />
        <el-option label="访客" value="guest" />
      </el-select>
    </TextFormItem>
    <TextFormItem label="技能" prop="tags">
      <el-select v-model="model.tags" multiple>
        <el-option label="Vue" value="vue" />
        <el-option label="TypeScript" value="ts" />
        <el-option label="Vite" value="vite" />
      </el-select>
    </TextFormItem>
    <TextFormItem label="入职日期" prop="joinedAt">
      <el-date-picker v-model="model.joinedAt" type="date" />
    </TextFormItem>
  </el-form>
  <p class="demo-note">上面的表单处于 el-form text 模式，组件从插槽中自动解析了选项与日期。</p>
</div>
