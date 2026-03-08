mod commands;
mod tray;

use std::time::Duration;
use tauri::Manager;
#[cfg(not(debug_assertions))]
use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            #[cfg(not(debug_assertions))]
            {
                let _ = app_handle
                    .shell()
                    .sidecar("decidr-code-sidecar")
                    .expect("sidecar not found")
                    .spawn()
                    .expect("failed to spawn sidecar");
            }

            let handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                let client = reqwest::Client::new();
                let mut attempts = 0;
                loop {
                    if attempts > 60 {
                        eprintln!("[tauri] API not ready after 30s, showing window anyway");
                        if let Some(window) = handle.get_webview_window("main") {
                            let _ = window.show();
                        }
                        break;
                    }
                    if client
                        .get("http://localhost:3117/health")
                        .send()
                        .await
                        .is_ok()
                    {
                        println!("[tauri] API ready");
                        if let Some(window) = handle.get_webview_window("main") {
                            let _ = window.show();
                        }
                        break;
                    }
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    attempts += 1;
                }
            });

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
            }

            tray::setup_tray(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::get_config])
        .run(tauri::generate_context!())
        .expect("error while running Decidr Code");
}
