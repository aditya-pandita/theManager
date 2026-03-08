#[tauri::command]
pub fn get_config() -> serde_json::Value {
    serde_json::json!({
        "apiUrl": "http://localhost:3117",
        "version": env!("CARGO_PKG_VERSION")
    })
}
