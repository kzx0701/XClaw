mod deploy;
mod execution;
mod openclaw;
mod project;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            deploy::run_local_deploy,
            execution::run_local_build,
            openclaw::load_local_openclaw_gateway_config,
            project::scan_project
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
