# 基于 OpenClaw 的前端项目可视化打包部署工具

## 1. 文档目标

本文档用于明确项目第一阶段 MVP 的实现边界，输出可直接进入开发的方案，包含：

- MVP 功能清单
- 页面结构
- 核心数据模型
- 基础任务流转设计
- 建议开发顺序

本文档不覆盖：

- UI 视觉稿
- OpenClaw 网关内部实现细节
- 多平台打包发布细节
- 非 MVP 的高级 AI 编排能力

## 2. MVP 目标

MVP 只解决一个核心问题：

**让前端开发者通过桌面界面完成项目导入、打包配置、服务器配置、执行部署，并实时看到执行日志和结果。**

MVP 成功标准：

- 能导入本地前端项目并识别基础信息
- 能保存项目和环境配置
- 能执行仅打包、仅部署、打包并部署三类任务
- 能实时展示执行进度和日志
- 能在失败时展示明确错误信息，并支持 AI 分析建议

## 3. MVP 范围

## 3.1 包含范围

### 项目管理

- 选择本地项目目录
- 读取 `package.json`
- 自动识别项目名称、脚本、可能的框架类型
- 保存项目列表和最近使用记录

### 打包配置

- 自定义打包命令
- 配置产物输出目录
- 可选前置校验命令，如 `npm run lint`

### 部署配置

- 配置 SSH 连接信息
- 配置远端部署路径
- 配置上传前是否清理远端目录
- 配置部署后远端命令，如 `nginx -s reload`

### 环境管理

- 支持 `dev` / `test` / `prod` 三类环境
- 每个环境保存独立部署配置

### 任务执行

- 仅打包
- 仅部署
- 打包并部署

### 日志与状态

- 实时日志流
- 当前阶段状态展示
- 成功 / 失败提示
- 错误日志高亮

### AI 辅助

- 对失败日志进行错误分析
- 给出修复建议

## 3.2 暂不纳入 MVP

- 多服务器批量部署
- 部署流程编排器
- Docker / PM2 / Supervisor 等多种运维模板
- 自然语言生成整套部署计划
- 团队协同、账号体系、云端同步
- 完整密钥管理系统
- 插件化任务模板市场

## 4. 页面结构

MVP 建议采用三栏或三主视图结构，避免一开始拆分过多页面。

## 4.1 页面一：项目管理页

目标：完成项目导入、识别、切换。

### 模块

- 项目列表
- 导入项目按钮
- 项目基础信息卡片
- 最近执行记录入口

### 展示字段

- 项目名称
- 本地路径
- 项目类型
- `package.json` 中识别到的脚本
- 默认打包命令
- 最近执行时间

### 核心操作

- 导入项目
- 编辑项目配置
- 删除项目记录
- 进入执行页

## 4.2 页面二：执行配置页

目标：完成本次任务的参数设置与任务下发。

### 模块

- 项目基础信息区
- 打包配置区
- 环境切换区
- 部署配置区
- 执行动作区

### 打包配置字段

- 打包命令
- 输出目录
- 是否执行前置校验
- 前置校验命令

### 部署配置字段

- 环境名称
- SSH 主机
- SSH 端口
- 用户名
- 认证方式
- 远端部署目录
- 上传策略
- 部署后命令

### 执行动作

- 仅打包
- 仅部署
- 打包并部署
- 停止任务

## 4.3 页面三：日志与结果页

目标：展示任务全过程状态，降低排错成本。

### 模块

- 当前任务概览
- 进度条
- 阶段状态流
- 实时日志面板
- 错误分析面板

### 展示内容

- 任务 ID
- 当前阶段
- 总体状态
- 开始时间 / 结束时间
- 普通日志
- 错误日志
- AI 分析结果

## 5. 页面导航建议

推荐左侧项目列表 + 右侧详情工作区模式：

1. 左侧固定项目列表
2. 右侧顶部切换 `配置` / `日志`
3. 用户选中项目后，在同一工作区完成配置与执行

这种结构比多页面跳转更适合桌面工具，状态连续性更好。

## 6. MVP 功能清单

## 6.1 P0 必做

### 项目导入

- 选择本地目录
- 读取 `package.json`
- 识别项目名和 scripts
- 持久化保存

### 配置编辑

- 编辑默认打包命令
- 编辑默认输出目录
- 保存环境配置

### 任务执行

- 下发打包任务
- 下发部署任务
- 下发打包并部署任务

### 日志回显

- WebSocket 接收日志流
- 区分 `info` / `error`
- 显示运行中 / 成功 / 失败状态

### 失败处理

- 收集错误日志
- 发起 AI 分析
- 展示建议文本

## 6.2 P1 建议尽快补齐

- 最近使用项目排序
- 环境配置复制
- 输出目录自动猜测
- 任务执行历史记录
- 远端后置命令模板

## 6.3 P2 后续增强

- 批量部署
- 可视化流程模板
- 配置导入导出
- 多用户共享模板
- 命令执行权限策略

## 7. 数据模型设计

以下模型建议用于前端本地存储与页面状态管理。

## 7.1 Project 项目模型

```ts
type ProjectType = 'vite-vue' | 'vite-react' | 'vue-cli' | 'react' | 'unknown'

interface Project {
  id: string
  name: string
  localPath: string
  projectType: ProjectType
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'unknown'
  packageJsonPath: string
  scripts: Record<string, string>
  defaultBuildCommand: string
  defaultOutputDir: string
  defaultPrecheckEnabled: boolean
  defaultPrecheckCommand: string
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
}
```

说明：

- `projectType` 用于 UI 展示和默认值推断
- `scripts` 直接存储 `package.json` 中的脚本映射
- `defaultOutputDir` 初始可根据框架猜测，允许用户覆盖

## 7.2 DeployEnvironment 环境配置模型

```ts
type AuthType = 'password' | 'privateKey'
type UploadStrategy = 'overwrite' | 'clear-and-upload'

interface DeployEnvironment {
  id: string
  projectId: string
  name: 'dev' | 'test' | 'prod' | string
  host: string
  port: number
  username: string
  authType: AuthType
  passwordRef?: string
  privateKeyPath?: string
  remotePath: string
  uploadStrategy: UploadStrategy
  postDeployCommand?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}
```

说明：

- 不建议直接明文存储密码
- `passwordRef` 应指向安全存储引用，而不是原始值
- `privateKeyPath` 适合本地私钥登录方式

## 7.3 ExecutionProfile 执行配置模型

```ts
type RunMode = 'build' | 'deploy' | 'build_deploy'

interface ExecutionProfile {
  projectId: string
  envId?: string
  runMode: RunMode
  buildCommand: string
  outputDir: string
  precheckEnabled: boolean
  precheckCommand?: string
  uploadStrategy?: 'overwrite' | 'clear-and-upload'
  postDeployCommand?: string
}
```

说明：

- 该模型表示一次执行时所使用的即时配置
- 可以由项目默认配置与环境配置合并得到

## 7.4 TaskRecord 任务记录模型

```ts
type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'canceled'
type TaskStage = 'prepare' | 'precheck' | 'build' | 'upload' | 'remote_exec' | 'done'

interface TaskRecord {
  id: string
  projectId: string
  envId?: string
  runMode: RunMode
  status: TaskStatus
  currentStage: TaskStage
  startedAt?: string
  finishedAt?: string
  errorMessage?: string
}
```

## 7.5 TaskLog 任务日志模型

```ts
type LogLevel = 'info' | 'warn' | 'error' | 'success'

interface TaskLog {
  id: string
  taskId: string
  stage: TaskStage
  level: LogLevel
  message: string
  timestamp: string
}
```

## 7.6 AiDiagnosis AI 诊断模型

```ts
interface AiDiagnosis {
  taskId: string
  summary: string
  probableCause: string[]
  suggestions: string[]
  rawErrorExcerpt: string
  createdAt: string
}
```

## 8. 本地存储建议

MVP 阶段建议采用本地存储方案，避免过早引入后端服务。

推荐存储拆分：

- `projects.json`：项目列表
- `environments.json`：环境配置
- `task-history.json`：任务历史
- 敏感信息走系统安全存储或 Tauri 插件能力

不建议：

- 直接把服务器密码明文写入普通 JSON
- 把完整日志长期堆在单个文件中

## 9. 前端状态管理建议

建议按三类状态拆分：

### 持久状态

- 项目列表
- 环境配置
- 最近任务记录

### 会话状态

- 当前选中项目
- 当前编辑中的执行参数
- 当前 WebSocket 连接状态

### 运行态状态

- 当前任务状态
- 当前阶段
- 实时日志流
- AI 分析结果

这样可以避免“配置状态”和“任务运行状态”互相污染。

## 10. WebSocket 消息结构建议

虽然本次文档重点不是协议设计，但 MVP 至少应统一消息结构。

## 10.1 前端发起执行

```json
{
  "type": "run_task",
  "taskId": "task_xxx",
  "payload": {
    "projectId": "project_xxx",
    "projectPath": "/path/to/project",
    "runMode": "build_deploy",
    "buildCommand": "pnpm build",
    "outputDir": "dist",
    "precheckEnabled": true,
    "precheckCommand": "pnpm lint",
    "server": {
      "host": "1.2.3.4",
      "port": 22,
      "username": "root",
      "authType": "privateKey",
      "privateKeyPath": "~/.ssh/id_rsa"
    },
    "deploy": {
      "remotePath": "/var/www/app",
      "uploadStrategy": "overwrite",
      "postDeployCommand": "nginx -s reload"
    }
  }
}
```

## 10.2 网关回传日志

```json
{
  "type": "task_log",
  "taskId": "task_xxx",
  "stage": "build",
  "level": "info",
  "message": "running pnpm build",
  "timestamp": "2026-06-01T10:00:00.000Z"
}
```

## 10.3 网关回传状态

```json
{
  "type": "task_status",
  "taskId": "task_xxx",
  "status": "running",
  "stage": "upload",
  "timestamp": "2026-06-01T10:02:00.000Z"
}
```

## 10.4 网关回传 AI 分析

```json
{
  "type": "task_diagnosis",
  "taskId": "task_xxx",
  "summary": "构建失败，原因可能是缺少环境变量",
  "probableCause": [
    "生产环境变量未注入",
    "CI 与本地 Node 版本不一致"
  ],
  "suggestions": [
    "检查 .env.production 是否存在",
    "确认 Node 版本与 package manager lock 文件一致"
  ]
}
```

## 11. 默认值推断策略

为了降低用户首次配置成本，建议加入最小自动识别逻辑。

### 项目类型识别

- 存在 `vite.config.*` 且依赖含 `vue`：`vite-vue`
- 存在 `vite.config.*` 且依赖含 `react`：`vite-react`
- 存在 `@vue/cli-service`：`vue-cli`
- 存在 `react-scripts`：`react`
- 其他：`unknown`

### 包管理器识别

- 存在 `pnpm-lock.yaml`：`pnpm`
- 存在 `yarn.lock`：`yarn`
- 存在 `package-lock.json`：`npm`

### 默认输出目录

- `vite-vue` / `vite-react` / `vue-cli`：默认 `dist`
- `react-scripts`：默认 `build`
- 无法判断时：默认 `dist`

### 默认打包命令

- 优先 `build`
- 其次在 scripts 中匹配 `build:*`
- 无结果则留空，由用户手填

## 12. 交互约束建议

### 表单约束

- 项目路径不能为空
- 打包命令不能为空
- 仅部署时必须选择环境配置
- 部署动作必须校验 SSH 主机和远端路径

### 执行约束

- 同一项目同一时刻只允许一个运行中任务
- 运行中禁止切换会影响任务的关键配置
- 断开 WebSocket 时禁止下发新任务

### 错误反馈

- 表单错误即时提示
- 网关连接失败需有全局状态提示
- 任务失败后固定展示失败阶段和错误摘要

## 13. 建议开发顺序

### 第一阶段：基础骨架

- 初始化 `Tauri + Vue3 + TypeScript`
- 建立页面布局和状态管理
- 实现本地项目导入

### 第二阶段：项目配置

- 读取 `package.json`
- 自动识别项目信息
- 完成项目和环境配置持久化

### 第三阶段：任务联调

- 封装 WebSocket 客户端
- 打通仅打包链路
- 打通部署链路

### 第四阶段：日志与诊断

- 接入实时日志
- 接入任务状态流
- 接入 AI 错误分析结果

### 第五阶段：体验收口

- 表单校验
- 历史记录
- 环境切换体验
- 异常状态处理

## 14. 推荐目录结构

```txt
src/
  components/
  views/
    projects/
    workspace/
    logs/
  stores/
  services/
    websocket/
    project/
    task/
  types/
  utils/
src-tauri/
docs/
```

推荐模块职责：

- `views`：页面与容器组件
- `services/websocket`：网关通信
- `services/project`：项目识别、配置读写
- `services/task`：任务下发与任务状态处理
- `stores`：全局状态
- `types`：数据模型与协议定义

## 15. 结论

该项目 MVP 应围绕“单用户、本地项目、单任务链路、实时日志回显”构建，不要在第一阶段过度扩展为通用部署平台。

只要先完成以下闭环，产品就具备可用价值：

1. 导入项目
2. 配置环境
3. 执行打包或部署
4. 查看日志
5. 失败后拿到 AI 建议

建议下一步直接进入技术设计文档，补齐：

- 页面模块拆分
- WebSocket 协议字段定义
- Tauri 本地存储与安全存储方案
- OpenClaw 网关交互边界
