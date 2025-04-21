use regex::Regex;
use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
struct FFMPEGFilter {
    name: String,
    timeline_support: bool,
    slice_threading: bool,
    command_support: bool,
    description: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    return format!("Hello, {}! You've been greeted from Rust!", name);
}

#[tauri::command]
fn get_all_filters() -> String {
    let re = Regex::new(r"^[T.][S.][C.]\s+[^=]\S+\s+\S+\s+.+$").unwrap();
    let mut filters: Vec<FFMPEGFilter> = Vec::new();
    let output_bytes = Command::new("ffmpeg")
        .arg("-filters")
        .output()
        .expect("failed to execute process")
        .stdout;
    let output_string = String::from_utf8(output_bytes).unwrap();
    let lines = output_string.split("\n");
    for line in lines {
        let final_line = line.trim();
        if re.is_match(final_line) {
            let mut line_segments: Vec<&str> = final_line.split_whitespace().collect();

            let mut filter = FFMPEGFilter {
                name: line_segments[1].to_string(),
                timeline_support: line_segments[0].chars().nth(0).unwrap().to_string()
                    == "T".to_string(),
                slice_threading: line_segments[0].chars().nth(1).unwrap().to_string()
                    == "S".to_string(),
                command_support: line_segments[0].chars().nth(2).unwrap().to_string()
                    == "C".to_string(),
                description: "Description".to_string(),
            };
            line_segments.drain(0..3);
            filter.description = line_segments.join(" ");
            filters.push(filter);
        }
    }
    return serde_json::to_string(&filters).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_all_filters])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
