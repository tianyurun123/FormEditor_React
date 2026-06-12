# 表单可视化编辑器

基于 **React + TypeScript** 的可视化表单构建平台，支持拖拽组件快速生成表单，可导出 **Vue3 + Element-Plus** 代码。

## 核心功能

### 拖拽式表单设计
- **侧边栏拖入**：从左侧组件库拖拽组件到画布，快速添加表单项
- **排序拖拽**：表单内组件支持拖拽排序，自由调整顺序
- **点击添加**：同时保留点击添加方式，灵活操作

### 丰富的表单组件
| 组件 | 说明 |
|------|------|
| 填空题 | 单行/多行文本输入，支持字数限制与正则校验 |
| 单选题 | 单选，支持选项图片、标签、逻辑关联跳转 |
| 多选题 | 多选，支持选项数量限制 |
| 下拉题 | 下拉选择，支持单选/多选模式 |
| 多段填空 | 文本中嵌入多个填空输入 |
| 评分题 | 星级评分，可配置评分数 |
| 日期题 | 日期选择，支持年/月/日/时分，单日期/日期范围 |
| 级联选择 | 多级联动选择 |
| 电子签名 | 手写签名板 |
| 表格/矩阵 | 多列多行表格，可配置列名与行标签 |

### 表单配置
- **标题与描述**：表单标题、富文本描述、描述图片上传与裁剪
- **字段验证**：必填校验、正则校验、字数/选项数量限制
- **逻辑关联**：选择题选项可关联跳转到其他题目
- **常用题目**：支持保存/管理常用题目模板，一键复用
- **自定义结束语**：表单提交后的结束页内容

### 多格式导出
- **Vue3 + Element-Plus 代码**：一键生成完整 Vue3 SFC（`<template>` + `<script setup>` + `<style scoped>`），包含表单验证、数据提交逻辑，支持 Monaco Editor 语法高亮预览与 `.vue` 文件下载
- **JSON 数据**：查看/复制/导出表单的结构化 JSON 配置，Monaco Editor 预览
- **TSX 文件**：导出为 React 组件文件（zip 打包下载）

### 预览与发布
- **实时预览**：全屏预览表单填写效果，支持完整交互（填写、验证、提交）
- **时间控制**：设置表单开始/结束时间
- **发布状态**：控制表单发布/下线

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 4 |
| UI 组件库 | Ant Design 5 |
| 状态管理 | Redux Toolkit + react-redux |
| 路由 | React Router 6（Suspense + lazy 路由懒加载） |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/modifiers |
| 代码编辑器 | Monaco Editor（本地 CDN 加载） |
| 样式 | Less |
| HTTP | axios |
| 页面缓存 | react-activation（KeepAlive） |
| 工具 | dayjs、js-beautify、file-saver、clipboard、react-image-crop、react-signature-canvas |

## 项目结构

```
form-active/
├── src/
│   ├── views/                      # 页面
│   │   ├── Create.tsx              # 表单编辑器主页（核心）
│   │   ├── Home.tsx                # 首页
│   │   ├── Login.tsx               # 登录
│   │   ├── Result.tsx              # 结束语编辑
│   │   └── ...
│   ├── components/                 # 组件
│   │   ├── DragContext.tsx          # 拖拽容器 HOC（@dnd-kit 封装）
│   │   ├── Droppable.tsx           # 可拖拽项 HOC
│   │   ├── RenderConfig.tsx        # 表单配置渲染器
│   │   ├── EditorContext.tsx       # 表单项编辑器
│   │   ├── Preview.tsx             # 表单预览（填写态）
│   │   ├── JsonDrawer.tsx          # JSON 查看器（Monaco Editor）
│   │   ├── VueCodePreview.tsx      # Vue 代码预览（Monaco Editor）
│   │   ├── Customize.tsx           # 描述语编辑器
│   │   ├── RenderImg.tsx           # 图片展示与裁剪
│   │   ├── formConfig/             # 各组件类型的配置面板
│   │   │   ├── Input.tsx           # 填空题配置
│   │   │   ├── Select.tsx          # 选择题配置
│   │   │   ├── Table.tsx           # 表格配置
│   │   │   └── ...
│   │   ├── modal/                  # 弹窗组件
│   │   │   ├── CommonQuestion.tsx  # 常用题管理
│   │   │   ├── LogicalRelevance.tsx # 题目关联设置
│   │   │   ├── RuleInput.tsx       # 验证规则编辑
│   │   │   └── ...
│   │   └── layout/                 # 布局组件
│   ├── store/                      # Redux Store
│   │   ├── index.ts
│   │   └── reducers/
│   │       ├── formReducer.ts      # 表单状态
│   │       ├── userReducer.ts      # 用户状态
│   │       └── utilReducer.ts      # 工具状态
│   ├── router/                     # 路由配置
│   ├── hooks/                      # 自定义 Hooks
│   └── assets/
│       ├── utils/
│       │   ├── formConfig/
│       │   │   ├── editorConfig.ts # 表单组件配置定义
│       │   │   └── tagType.ts      # 组件类型映射
│       │   ├── generateVueCode.ts  # Vue3 代码生成器
│       │   ├── event.ts            # 事件总线
│       │   └── index.ts            # 工具函数集
│       └── style/                  # Less 样式
└── public/
    ├── libs/monaco-editor/         # Monaco Editor CDN 资源
    └── image/form/                 # 表单相关图标
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

**环境要求**：Node.js 16.8+

## 核心设计

### 拖拽系统
- 基于 `@dnd-kit` 实现，`DragContext` 和 `Droppable` 作为高阶组件封装
- **跨容器拖入**：侧边栏组件通过 HTML5 原生拖拽 API 拖入表单画布
- **容器内排序**：表单内组件通过 `@dnd-kit/sortable` 实现垂直列表排序
- 支持键盘传感器、指针传感器，拖拽距离阈值 8px 防误触

### 代码生成
- `generateVueCode.ts` 将表单 JSON 配置转换为完整 Vue3 SFC
- 覆盖全部组件类型，生成 `<el-form>` 验证规则、响应式数据、提交逻辑
- 表格组件生成 `<el-table>` + 内嵌 `<el-input>` 结构
- 级联选择器同步生成 options 数据文件

### 状态管理
- Redux Toolkit 管理表单数据、当前焦点、常用题目、结束语
- 非持久化通信通过自定义事件总线（`event.ts`）解耦，支持 `transfer-data`、`clear` 等事件

### 渲染策略
- `EditorContext` 使用策略模式按组件类型分发渲染不同的配置面板
- `Preview` 中同样按 tag 匹配渲染对应的填写态组件

### 自定义 Hooks
- `useAxios` — 封装 axios 请求，统一处理 loading / error 状态
- `useMessage` — 简化 Ant Design message 提示调用
- `useModal` — 管理弹窗显隐逻辑
- `useUpdate` — 轻量强制重渲染，用于深层对象变更后刷新 UI
- `useClickOutside` — 监听目标元素外部点击，用于下拉收起
- `useCountDown` — 通用倒计时逻辑
- `useRouter` — 封装路由跳转
