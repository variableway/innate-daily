# scan / verify-flags / import / pages

其他辅助命令。

## scan

查看当前 profile 选中了哪些插件，以及打包面的状态。

### 用法

```bash
innate-fe-cli scan [--profile <name>]
```

### 输出

```
profile=admin
yaml domains: admin-tanstack
yaml iframes: (无)
打包面 domain（1）：
  - admin-tanstack (@innate/domain-admin-tanstack, styles=true, order=0)
静态插件（public/plugins/，0）：(无)
已登记静态 iframe（0）：(无)
iframe plugin.json（2）：web-showcase, wandesk-ui
```

### use case

```bash
# 查看默认 profile
innate-fe-cli scan

# 查看 apps profile
innate-fe-cli scan --profile apps
```

---

## verify-flags

校验 feature flags（`site-features.gen.ts`）与打包面一致。

### 用法

```bash
innate-fe-cli verify-flags [--profile <name>]
```

也可简写为 `verify`。

### 做了什么

1. 收集打包面 + yaml iframe + 静态导入的所有插件 id
2. 读取 `site-features.gen.ts` 的 `packedSiteFeatures`
3. 对比：
   - packed 多出未进包的 id → 报错
   - packed 缺少已进包的 id → 报错
   - overlay 指向未进包的 id → 报错（死开关）

### use case

```bash
innate-fe-cli verify-flags --profile apps
```

一致时输出 `✔ flags 与打包面一致`。

不一致时：

```
✗ packed 多出未进包 id: some-domain
✗ packed 缺少已进包 id: admin-tanstack
```

---

## import

导入或移除外部静态插件到 `public/plugins/`。

### 用法

```bash
# 导入
innate-fe-cli import <id> --from <dir|git-url> [--name x] [--trust-source] [--build-command cmd]

# 移除
innate-fe-cli import --remove --from <id>
```

### 参数

| 参数                    | 说明                                          |
| ----------------------- | --------------------------------------------- |
| `<id>`                  | 插件 id                                       |
| `--from <dir\|git-url>` | 来源：本地目录或 git URL。移除时是要移除的 id |
| `--name <x>`            | 展示名（缺省用 id）                           |
| `--trust-source`        | 信任来源（跳过安全检查）                      |
| `--build-command <cmd>` | 导入前先执行的构建命令                        |
| `--remove`              | 移除模式                                      |

### use case

```bash
# 从本地目录导入
innate-fe-cli import my-plugin --from ./path/to/dist

# 从 git 仓库导入
innate-fe-cli import my-plugin --from https://github.com/user/repo.git --trust-source

# 移除
innate-fe-cli import --remove --from my-plugin
```

导入后会登记到 `public/plugins/static-manifests.json`。

---

## pages

文稿仓（innate-wip）的 Pages 打包/部署。

### 用法

```bash
innate-fe-cli pages <pack|deploy> [--dir <vault>] [--shell <zip>] [--out <dir>] [--dry-run]
```

### 参数

| 参数            | 说明                                             |
| --------------- | ------------------------------------------------ |
| `pack`          | 打包 Pages 产物                                  |
| `deploy`        | 打包 + 打印部署路径                              |
| `--dir <vault>` | 文稿仓根目录（默认向上找 `pages.registry.json`） |
| `--shell <zip>` | 站点壳 zip 文件（默认从 GitHub Release 下载）    |
| `--out <dir>`   | 输出目录                                         |
| `--dry-run`     | 只打印计划                                       |

### 做了什么

1. 读取文稿仓的 `pages.registry.json`
2. 下载或使用指定的站点壳 zip
3. 解压到输出目录
4. 把各 domain 的 markdown 叠加到壳里
5. 写 `site.json`（站点清单）

### 前置条件

- 需要 `FE_TEMPLATES_TOKEN` 或 `GH_TOKEN` 环境变量（下载壳 zip 时）
- 或在文稿仓根目录放好壳 zip

### use case

```bash
# 在文稿仓根目录打包
cd path/to/innate-wip
innate-fe-cli pages pack

# 指定文稿仓目录
innate-fe-cli pages pack --dir path/to/innate-wip

# 指定本地壳 zip
innate-fe-cli pages pack --shell ./shell.zip
```
