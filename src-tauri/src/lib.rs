use futures::future::join_all;
use regex::Regex;
use std::process::{Command};
use std::fs;
use serde::Serialize;
use tauri::{AppHandle, Manager};
use base64;

#[derive(Serialize, Debug, Clone)]
struct FFMPEGFilterInputOutput {
    name: String,
    stream_type: String,
}

#[derive(Serialize, Debug, Clone)]
struct FFMPEGFilter {
    name: String,
    timeline_support: bool,
    slice_threading: bool,
    command_support: bool,
    description: String,
    inputs: Vec<FFMPEGFilterInputOutput>,
    outputs: Vec<FFMPEGFilterInputOutput>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    return format!("Hello, {}! You've been greeted from Rust!", name);
}

#[tauri::command]
fn get_file_preview(file_path: & str) -> String {
    let data = std::fs::read(file_path).unwrap();
    return base64::encode(&data);
}

#[tauri::command]
async fn get_all_filters(app: AppHandle) -> String {
    let data_path = app.path().local_data_dir().unwrap().join(app.config().identifier.clone());
    fs::create_dir_all(&data_path).unwrap();
    let filters_path = data_path.join("filters.cache.json");
    println!("filters_path: {:?}", filters_path);
    if filters_path.exists() {
        let filters = std::fs::read_to_string(filters_path).unwrap();
        return filters;
    }

    let re = Regex::new(r"^[T.][S.][C.]\s+[^=]\S+\s+\S+\s+.+$").unwrap();
    let output_bytes = Command::new("ffmpeg")
        .arg("-filters")
        .output()
        .expect("failed to execute process")
        .stdout;
    let output_string = String::from_utf8(output_bytes).unwrap();
    let lines = output_string.split("\n");
    let mut futures = Vec::new();
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
                inputs: Vec::new(),
                outputs: Vec::new(),
            };
            line_segments.drain(0..3);
            filter.description = line_segments.join(" ");
            futures.push(get_filter_details(filter));
        }
    }
    let filters = join_all(futures).await;
    let filters_json = serde_json::to_string(&filters).unwrap();
    fs::write(filters_path, &filters_json).unwrap();
    return filters_json
}

async fn get_filter_details(filter: FFMPEGFilter) -> FFMPEGFilter {
    let mut filter = filter.clone();
    let output_bytes = Command::new("ffmpeg")
        .args(["--help", format!("filter={}", filter.name).as_str()])
        .output()
        .expect("failed to execute process")
        .stdout;
    let output_string = String::from_utf8(output_bytes).unwrap();
    let lines = output_string.split("\n");
    let mut collection_type = "NONE";

    // println!("\n\n=={}==", filter.name);
    for og_line in lines {
        let line = og_line.trim();
        if line == "Inputs:" {
            collection_type = "inputs";
            // println!("collecting {}", collection_type);
        } else if collection_type == "inputs" && line.trim().starts_with("#") {
            let entries: Vec<&str> = line.split_whitespace().collect();
            let input = FFMPEGFilterInputOutput {
                name: entries[1].to_string(),
                stream_type: entries[2].to_string().replace(&['(', ')'], ""),
            };
            // println!("{:?}", &input);
            filter.inputs.push(input);
        } else if line == "Outputs:" {
            collection_type = "outputs";
            // println!("collecting {}", collection_type);
        } else if collection_type == "outputs" && line.trim().starts_with("#") {
            let entries: Vec<&str> = line.split_whitespace().collect();
            let output = FFMPEGFilterInputOutput {
                name: entries[1].to_string(),
                stream_type: entries[2].to_string().replace(&['(', ')'], ""),
            };
            // println!("{:?}", &output);
            filter.outputs.push(output);
        } else if line == format!("{} AVOptions:", filter.name) {
            collection_type = "options";
            // println!("collecting {}", collection_type);
        } else {
            // println!("IGNORED- {:?}", line);
        }
    }
    return filter;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_all_filters, get_file_preview])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
