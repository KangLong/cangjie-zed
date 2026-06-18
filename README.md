# Cangjie Zed Extension

仓颉编程语言的 Zed 编辑器支持扩展。

## 功能

- 语法高亮（关键字、类型、字符串、注释、操作符、函数调用等）
- 括号匹配
- 自动缩进
- 代码大纲
- Vim 文本对象

## 安装

### 本地开发安装

1. 克隆此仓库
2. 在 Zed 中打开 Extensions 面板（`Ctrl+Shift+X`）
3. 点击 **Install Dev Extension** 按钮
4. 选择本仓库根目录 `G:\Work\Projects\Self\cangjie-zed`
5. 等待安装完成，重启 Zed

> **注意**：首次安装时 Zed 需要下载 WASI SDK（约 500MB）来编译 Tree-sitter 语法 WASM。

## 项目结构

```
cangjie-zed/
├── extension.toml                  # 扩展清单
├── tree-sitter-cangjie.wasm        # 编译后的语法 WASM
├── grammar.js                      # Tree-sitter 语法定义（主文件）
├── grammar_common.js               # 语法公共定义（优先级、符号、关键字）
├── grammar_literal.js              # 字面量定义（数字、字符串、字符）
├── src/
│   ├── scanner.c                   # 词法分析器（多行原始字符串 `#"..."#`）
│   ├── parser.c                    # 生成的解析器（由 grammar.js 生成）
│   └── tree_sitter/                # Tree-sitter 头文件
├── languages/cangjie/
│   ├── config.toml                 # 语言配置（文件后缀、注释格式等）
│   ├── highlights.scm              # 【语法高亮规则】← 修改高亮颜色主要改这里
│   ├── brackets.scm                # 括号匹配规则
│   ├── indents.scm                 # 自动缩进规则
│   ├── outline.scm                 # 代码大纲规则
│   └── textobjects.scm             # 文本对象规则（Vim 模式）
└── README.md                       # 本文件
```

## 语法高亮规则（highlights.scm）

高亮规则在 `languages/cangjie/highlights.scm` 中定义，使用 Tree-sitter 查询语法（SCM 格式）。

### 颜色对照表

| Capture 名 | 默认颜色 | 对应元素 |
|---|---|---|
| `@comment` | 灰色 | 注释 `//` `/* */` |
| `@string` | 绿色 | 字符串字面量 |
| `@string.special` | 绿色 | Rune 字符 `r'a'` |
| `@number` | 紫色 | 整数字面量 |
| `@number.float` | 紫色 | 浮点数字面量 |
| `@boolean` | 紫色 | `true` `false` |
| `@constant.builtin` | 深蓝 | `()` `_` |
| `@variable` | 默认 | 变量名 |
| `@variable.builtin` | 深蓝 | `this` `super` |
| `@function` | 黄色 | 函数定义名 `func foo()` |
| `@function.call` | 蓝色 | 函数/方法调用 `getVariable()`、`.use()` |
| `@type` | 青色 | 类名、结构体名、枚举名 |
| `@type.builtin` | 青色 | `Int64` `String` `Float64` 等 |
| `@property` | 橙色 | 属性名、字段访问 `obj.field` |
| `@keyword` | 紫色 | `package` `struct` `if` `return` 等 |
| `@operator` | 灰色 | `+` `-` `==` `=` `->` `=>` 等 |
| `@punctuation.delimiter` | 灰色 | `;` `,` `.` |
| `@punctuation.bracket` | 蓝色 | `()` `{}` `[]` |
| `@embedded` | — | 字符串插值 `${}`（暂不可用） |

### 函数调用高亮规则详解

```
; 规则 1：直接函数调用 println("hello")
(postfixExpression
  (atomicVariable (varBindingPattern) @function.call)
  (callSuffix))

; 规则 2：字段/属性访问 obj.field（默认色为属性）
(fieldAccess
  (atomicVariable (varBindingPattern) @property))

; 规则 3：方法链中最后的方法 app.router.use() 中的 use
; 匹配"外层的 postfixExpression 有 callSuffix 时，
; 内层的 fieldAccess 中的方法名为函数色"
(postfixExpression
  (postfixExpression
    (fieldAccess
      (atomicVariable (varBindingPattern) @function.call)))
  (callSuffix))
```

**颜色示例：**

```
println("hello")                      → println = 🔵 函数色
routes.registerPublicRoutes(api)      → routes = 变量色, registerPublicRoutes = 🔵 函数色
app.router.use()                      → app = 变量色, router = 🟠 属性色, use = 🔵 函数色
cfg.log                               → cfg = 变量色, log = 🟠 属性色
Joy.default()                         → Joy = 变量色, default = 🔵 函数色
```

### 如何修改高亮颜色

1. 编辑 `languages/cangjie/highlights.scm`
2. 每行格式：`(节点名) @capture名` 或 `"关键字字面量" @capture名`
3. 提交并重新安装扩展（Install Dev Extension）

**添加新的高亮规则示例：**

```scm
; 匹配某个 AST 节点并着色
(arrayLiteral) @string

; 匹配关键字
"foreach" @keyword

; 匹配嵌套结构
(函数调用
  (参数名) @variable.parameter)
```

### 调试高亮

如果修改后高亮不生效，查看 Zed 日志：

```
Ctrl+Shift+P → "zed: open log"
```

搜索 `cangjie` 或 `highlights query` 错误。

## 开发

### 构建语法 WASM

```bash
npm install
npx tree-sitter generate --abi 14
npx tree-sitter build --wasm
```

### 测试语法解析

```bash
npx tree-sitter parse test.cj
```

### 重新安装扩展

每次修改 `highlights.scm` 或其他语言文件后：

1. 在 Extensions 面板 Remove 旧版本
2. 重新 Install Dev Extension

> 如果 Zed 提示 `skipping compilation... up to date`，删除 `grammars/cangjie/` 目录（缓存的 git clone）强制重编译。

## 已知限制

| 限制 | 原因 |
|---|---|
| `..` `..=` `...`（区间操作符）无法高亮 | 与 Tree-sitter 查询语法的范围操作符 `..` 冲突 |
| 字符串插值 `${}` 无法单独高亮 | `token()` 化字符串后，插值表达式被包含在字符串 token 中 |
| `//` 在字符串中被识别为注释（已修复） | 通过 `token()` 包裹字符串字面量解决 |
| 中间方法和最后方法无法在 AST 中区分 | 语法结构一致，只能通过父节点 `callSuffix` 间接判断 |
| 枚举常量无法与普通变量区分 | 枚举常量在 AST 中也是 `identifier`，无特殊节点 |

## 许可证

MIT
