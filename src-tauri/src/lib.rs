use image::imageops::FilterType;
use tauri::Manager;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use image::ImageReader;
use tauri::path::BaseDirectory;
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn make_thumbnail(app: tauri::AppHandle, path: &str, to_width: u32) {
    // Read source image from file
    let final_path = app.path().resolve(path, BaseDirectory::AppData).unwrap();
    let img = ImageReader::open(final_path.clone())
        .unwrap()
        .decode()
        .unwrap();
    let new_img = img.resize(
        to_width,
        to_width * img.height() / img.width(),
        FilterType::Nearest,
    );
    new_img.save(final_path.clone()).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                DROP TABLE IF EXISTS kv;
                CREATE TABLE kv (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL,
                    value TEXT NOT NULL
                );
                DROP TABLE IF EXISTS messages;
                CREATE TABLE messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL,
                    room_id TEXT NOT NULL,
                    type INT NOT NULL,
                    content TEXT NOT NULL,
                    msg_id INT NOT NULL,
                    uuid UNSIGNED INT NOT NULL,
                    state INT NOT NULL,
                    is_sender INT NOT NULL
                );
                CREATE UNIQUE INDEX 'uniq_rum' ON messages (room_id, username, msg_id);
                CREATE INDEX 'idx_ru' ON messages (room_id, uuid);
                CREATE UNIQUE INDEX 'idx_k' ON kv (key);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "update table",
            sql: r#"
                alter table messages add column quote UNSIGNED INT NOT NULL DEFAULT 0;
            "#,
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:whisper.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![make_thumbnail])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
