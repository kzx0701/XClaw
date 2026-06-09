use serde_json::Value;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub struct ProjectDetection {
    pub project_type: String,
    pub package_manager: String,
    pub build_command: String,
    pub output_dir: String,
}

pub fn detect_project(project_path: &Path, package_json: &Value, scripts: &HashMap<String, String>) -> ProjectDetection {
    let dependencies = extract_dependency_names(package_json);
    let project_type = detect_project_type(project_path, &dependencies, scripts);
    let package_manager = detect_package_manager(project_path);
    let build_command = detect_build_command(scripts, &package_manager);
    let output_dir = detect_output_dir(project_path, &project_type);

    ProjectDetection {
        project_type,
        package_manager,
        build_command,
        output_dir,
    }
}

pub fn extract_dependency_names(package_json: &Value) -> Vec<String> {
    ["dependencies", "devDependencies"]
        .iter()
        .filter_map(|key| package_json.get(key).and_then(Value::as_object))
        .flat_map(|deps| deps.keys().cloned())
        .collect()
}

pub fn detect_project_type(project_path: &Path, dependencies: &[String], scripts: &HashMap<String, String>) -> String {
    let has_vite_config = vite_config_path(project_path).is_some();
    let has_vue = dependencies.iter().any(|dep| dep == "vue");
    let has_react = dependencies.iter().any(|dep| dep == "react");
    let has_vue_cli = dependencies.iter().any(|dep| dep == "@vue/cli-service");
    let has_react_scripts = dependencies.iter().any(|dep| dep == "react-scripts");
    let has_next = dependencies.iter().any(|dep| dep == "next");
    let has_nuxt = dependencies.iter().any(|dep| dep == "nuxt" || dep == "nuxi");
    let has_astro = dependencies.iter().any(|dep| dep == "astro");
    let has_sveltekit = dependencies.iter().any(|dep| dep == "@sveltejs/kit");

    if has_next {
        return "next".into();
    }

    if has_nuxt {
        return "nuxt".into();
    }

    if has_astro {
        return "astro".into();
    }

    if has_sveltekit {
        return "sveltekit".into();
    }

    if has_vite_config && has_vue {
        return "vite-vue".into();
    }

    if has_vite_config && has_react {
        return "vite-react".into();
    }

    if has_vue_cli {
        return "vue-cli".into();
    }

    if has_react_scripts {
        return "react".into();
    }

    if scripts.contains_key("generate") {
        return "static-generator".into();
    }

    "unknown".into()
}

pub fn detect_package_manager(project_path: &Path) -> String {
    if project_path.join("pnpm-lock.yaml").exists() {
        return "pnpm".into();
    }

    if project_path.join("yarn.lock").exists() {
        return "yarn".into();
    }

    if project_path.join("package-lock.json").exists() {
        return "npm".into();
    }

    "unknown".into()
}

pub fn detect_output_dir(project_path: &Path, project_type: &str) -> String {
    if let Some(output_dir) = detect_config_output_dir(project_path) {
        return output_dir;
    }

    match project_type {
        "react" => "build".into(),
        "next" => ".next".into(),
        "nuxt" => ".output/public".into(),
        "sveltekit" => "build".into(),
        _ => "dist".into(),
    }
}

pub fn detect_build_command(scripts: &HashMap<String, String>, package_manager: &str) -> String {
    if let Some(script_name) = choose_build_script(scripts) {
        return package_script_command(package_manager, &script_name);
    }

    String::new()
}

fn choose_build_script(scripts: &HashMap<String, String>) -> Option<String> {
    let preferred = [
        "build:prod",
        "build:production",
        "build:release",
        "build:preview",
        "build",
        "generate",
        "export",
    ];

    for script_name in preferred {
        if scripts.contains_key(script_name) {
            return Some(script_name.to_string());
        }
    }

    let mut build_variants = scripts
        .keys()
        .filter(|name| name.starts_with("build:"))
        .filter(|name| !is_non_deploy_build_script(name))
        .cloned()
        .collect::<Vec<_>>();
    build_variants.sort_by_key(|name| build_script_rank(name));

    build_variants.first().cloned()
}

fn build_script_rank(script_name: &str) -> usize {
    let lower = script_name.to_lowercase();

    if lower.contains("prod") || lower.contains("production") {
        return 0;
    }

    if lower.contains("release") {
        return 1;
    }

    if lower.contains("stage") || lower.contains("staging") {
        return 2;
    }

    if lower.contains("preview") {
        return 3;
    }

    10
}

fn is_non_deploy_build_script(script_name: &str) -> bool {
    let lower = script_name.to_lowercase();

    ["dev", "test", "watch", "type", "types", "lib", "storybook"]
        .iter()
        .any(|keyword| lower.contains(keyword))
}

fn package_script_command(package_manager: &str, script_name: &str) -> String {
    match (package_manager, script_name) {
        ("pnpm", "build") => "pnpm build".into(),
        ("pnpm", _) => format!("pnpm {script_name}"),
        ("yarn", "build") => "yarn build".into(),
        ("yarn", _) => format!("yarn {script_name}"),
        (_, _) => format!("npm run {script_name}"),
    }
}

fn detect_config_output_dir(project_path: &Path) -> Option<String> {
    vite_config_path(project_path)
        .and_then(|path| read_output_dir_from_config(&path, "outDir"))
        .or_else(|| read_output_dir_from_config(&project_path.join("vue.config.js"), "outputDir"))
        .or_else(|| read_output_dir_from_config(&project_path.join("webpack.config.js"), "path"))
        .or_else(|| read_output_dir_from_config(&project_path.join("webpack.config.ts"), "path"))
}

fn vite_config_path(project_path: &Path) -> Option<PathBuf> {
    ["ts", "js", "mts", "mjs", "cts", "cjs"]
        .iter()
        .map(|ext| project_path.join(format!("vite.config.{ext}")))
        .find(|path| path.exists() && path.is_file())
}

fn read_output_dir_from_config(config_path: &Path, key: &str) -> Option<String> {
    let content = std::fs::read_to_string(config_path).ok()?;
    let key_position = content.find(key)?;
    let after_key = &content[key_position + key.len()..];
    let value_start = after_key.find(['"', '\'', '`'])?;
    let quote = after_key.as_bytes().get(value_start).copied()? as char;
    let value_body = &after_key[value_start + quote.len_utf8()..];
    let value_end = value_body.find(quote)?;
    let raw_value = value_body[..value_end].trim();

    normalize_config_output_value(raw_value)
}

fn normalize_config_output_value(raw_value: &str) -> Option<String> {
    let value = raw_value
        .trim()
        .trim_start_matches("./")
        .trim_start_matches("public/")
        .trim()
        .replace('\\', "/");

    if value.is_empty() || value.contains("${") || value.starts_with('/') {
        return None;
    }

    Some(value)
}
