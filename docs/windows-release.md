# Windows 发布说明

## 目标产物

- `XClaw-Windows-x64-setup.exe`

## 当前发布方式

- 主发布工作流：`D:\工作文件\项目文件\XClaw-deploy\.github\workflows\release.yml`
- Windows 专属 Tauri 配置：`D:\工作文件\项目文件\XClaw-deploy\src-tauri\tauri.windows.conf.json`
- 触发方式：
  - 推送 `v*` 标签
  - 或在 GitHub Actions 中手动执行 `Release`

## 构建行为

- 运行 `pnpm install --frozen-lockfile`
- 运行 `pnpm tauri build --target x86_64-pc-windows-msvc --config src-tauri/tauri.windows.ci.conf.json`
- 从 `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis` 收集 `*-setup.exe`
- 上传为 `XClaw-Windows-x64-setup.exe`

## 签名策略

- 当前内部测试允许生成未签名安装包
- 如果未配置签名 Secrets，工作流会跳过证书导入并继续构建
- 如果后续配置完整签名 Secrets，工作流会自动导入证书并启用签名

## 可选的 GitHub Secrets

- `WINDOWS_CERTIFICATE`
  - `.pfx` 证书的 Base64 文本
- `WINDOWS_CERTIFICATE_PASSWORD`
  - 导出 `.pfx` 时设置的密码
- `WINDOWS_CERTIFICATE_THUMBPRINT`
  - 证书指纹
- `WINDOWS_CERTIFICATE_DIGEST_ALGORITHM`
  - 一般为 `sha256`
- `WINDOWS_TIMESTAMP_URL`
  - 证书提供商推荐的时间戳地址

## 生成 `WINDOWS_CERTIFICATE`

- 准备好 `.pfx` 文件后执行：
- `certutil -encode certificate.pfx base64cert.txt`
- 将 `base64cert.txt` 的内容保存到 GitHub Secret `WINDOWS_CERTIFICATE`

## 证书信息获取

- 在 Windows 中打开 `certmgr.msc`
- 找到导入后的代码签名证书
- 在详细信息中获取：
  - `Thumbprint`
  - `Signature hash algorithm`
- 时间戳地址使用证书颁发商提供的地址

## 发布步骤

- 执行：`npm run release:prepare -- 1.0.4`
- 推送主分支：`git push origin main`
- 推送标签：`git push origin v1.0.4`

## 结果预期

- GitHub Release 中出现 `XClaw-Windows-x64-setup.exe`
- 内部测试版未签名时，安装过程可能看到 Windows 安全提示
- 对外正式发布前，再补代码签名即可
