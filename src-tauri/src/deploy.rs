use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalDeployRequest {
    project_name: String,
    output_path: String,
    remote_path: String,
    host: String,
    port: u16,
    username: String,
    auth_type: String,
    password: String,
    private_key_path: String,
    upload_strategy: String,
    post_deploy_command: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalDeployResult {
    success: bool,
    steps: Vec<String>,
    command_output: String,
}

#[tauri::command]
pub fn run_local_deploy(request: LocalDeployRequest) -> Result<LocalDeployResult, String> {
    let output_path = Path::new(&request.output_path);

    if !output_path.exists() {
      return Err("本地产物目录不存在，无法执行部署".into());
    }

    if !output_path.is_dir() {
      return Err("本地产物路径不是目录，无法执行部署".into());
    }

    if request.auth_type.trim() != "privateKey" {
      return Err("当前本地部署兜底仅支持私钥认证，请在服务器配置中切换为私钥认证后重试".into());
    }

    let private_key_path = request.private_key_path.trim();

    if private_key_path.is_empty() {
      return Err("私钥路径不能为空".into());
    }

    let remote = format!("{}@{}", request.username.trim(), request.host.trim());
    let target = format!("{}:{}", remote, request.remote_path.trim());
    let port = request.port.to_string();
    let mut steps = vec![
      format!("准备部署项目 {}", request.project_name.trim()),
      format!("目标服务器 {}:{}", request.host.trim(), request.port),
      format!("远端目录 {}", request.remote_path.trim()),
    ];

    let mut output_logs = Vec::<String>::new();

    if request.upload_strategy.trim() == "clear-and-upload" {
      let clear_command = format!("mkdir -p '{}' && rm -rf '{}'/*", request.remote_path.trim(), request.remote_path.trim());
      let clear_result = run_ssh_command(&remote, &port, private_key_path, &clear_command)?;
      output_logs.push(clear_result.clone());
      steps.push("已清理远端旧文件".into());
    } else {
      let prepare_command = format!("mkdir -p '{}'", request.remote_path.trim());
      let prepare_result = run_ssh_command(&remote, &port, private_key_path, &prepare_command)?;
      output_logs.push(prepare_result.clone());
      steps.push("已创建远端目录".into());
    }

    let scp_result = run_scp_command(output_path, &target, &port, private_key_path)?;
    output_logs.push(scp_result.clone());
    steps.push("已上传本地产物".into());

    let post_deploy_command = request.post_deploy_command.trim();

    if !post_deploy_command.is_empty() {
      let post_result = run_ssh_command(&remote, &port, private_key_path, post_deploy_command)?;
      output_logs.push(post_result.clone());
      steps.push("已执行部署后命令".into());
    }

    Ok(LocalDeployResult {
      success: true,
      steps,
      command_output: output_logs.join("\n"),
    })
}

fn run_ssh_command(remote: &str, port: &str, key_path: &str, command: &str) -> Result<String, String> {
  let output = Command::new("ssh")
    .arg("-i")
    .arg(key_path)
    .arg("-p")
    .arg(port)
    .arg("-o")
    .arg("StrictHostKeyChecking=no")
    .arg(remote)
    .arg(command)
    .output()
    .map_err(|error| format!("执行 ssh 命令失败: {error}"))?;

  if !output.status.success() {
    return Err(combine_command_output(&output.stdout, &output.stderr));
  }

  Ok(combine_command_output(&output.stdout, &output.stderr))
}

fn run_scp_command(source_dir: &Path, target: &str, port: &str, key_path: &str) -> Result<String, String> {
  let source = format!("{}/.", source_dir.to_string_lossy());
  let output = Command::new("scp")
    .arg("-i")
    .arg(key_path)
    .arg("-P")
    .arg(port)
    .arg("-o")
    .arg("StrictHostKeyChecking=no")
    .arg("-r")
    .arg(source)
    .arg(target)
    .output()
    .map_err(|error| format!("执行 scp 命令失败: {error}"))?;

  if !output.status.success() {
    return Err(combine_command_output(&output.stdout, &output.stderr));
  }

  Ok(combine_command_output(&output.stdout, &output.stderr))
}

fn combine_command_output(stdout: &[u8], stderr: &[u8]) -> String {
  let stdout = String::from_utf8_lossy(stdout).trim().to_string();
  let stderr = String::from_utf8_lossy(stderr).trim().to_string();

  match (stdout.as_str(), stderr.as_str()) {
    ("", "") => String::new(),
    ("", stderr) => stderr.to_string(),
    (stdout, "") => stdout.to_string(),
    (stdout, stderr) => format!("{stdout}\n{stderr}"),
  }
}
