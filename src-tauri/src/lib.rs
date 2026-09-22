//! PharmaWallah for Windows — the entire Rust backend.
//!
//! The application is offline by design, so this layer is deliberately tiny:
//! it opens a window onto the bundled frontend and offers three commands for
//! the two things a web page cannot do on its own — keep a file between runs,
//! and write an exported report to disk.
//!
//! What is NOT here, on purpose (spec §5, §23, §29):
//!   * no HTTP client and no networking crate of any kind;
//!   * no database engine — the data is one small JSON document;
//!   * no shell access, no arbitrary filesystem access, no auto-updater;
//!   * no plugins at all, so the app grants no plugin permissions.
//!
//! Application commands registered through `generate_handler!` are not
//! permission-gated in Tauri 2 the way plugin commands are, which is what lets
//! `capabilities/default.json` stay down to the one core permission a window
//! needs. Each command below is therefore its own security boundary, and each
//! one constrains what it will touch: the store writes exactly one known file,
//! and the exporter refuses any path component in the name it is given.

use std::fs;
use std::io::Write;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

/// Everything the app persists lives in this one file, in the per-user
/// application-data directory Windows gives us (`%APPDATA%\com.pharmawallah.desktop`).
const STORE_FILE: &str = "pharmawallah-store.json";

/// Exported reports go to a PharmaWallah folder in the user's Documents.
const EXPORT_DIR: &str = "PharmaWallah";

fn store_file(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("no application data directory: {error}"))?;
    fs::create_dir_all(&dir).map_err(|error| format!("could not create {dir:?}: {error}"))?;
    Ok(dir.join(STORE_FILE))
}

/// Reads the saved document. A missing file is not an error — it is a first
/// run, and the frontend treats an empty string as "nothing saved yet".
#[tauri::command]
fn store_load(app: AppHandle) -> Result<String, String> {
    let path = store_file(&app)?;
    if !path.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(&path).map_err(|error| format!("could not read {path:?}: {error}"))
}

/// Replaces the saved document.
///
/// Written to a temporary file and then renamed, so a crash or a power cut
/// mid-write leaves the previous history intact rather than a truncated file.
#[tauri::command]
fn store_save(app: AppHandle, contents: String) -> Result<(), String> {
    // The frontend is the only caller and always sends JSON; rejecting anything
    // else means a corrupt document can never be written in the first place.
    serde_json::from_str::<serde_json::Value>(&contents)
        .map_err(|error| format!("refusing to save malformed data: {error}"))?;

    let path = store_file(&app)?;
    let temporary = path.with_extension("json.tmp");

    {
        let mut file = fs::File::create(&temporary)
            .map_err(|error| format!("could not open {temporary:?}: {error}"))?;
        file.write_all(contents.as_bytes())
            .map_err(|error| format!("could not write {temporary:?}: {error}"))?;
        file.sync_all()
            .map_err(|error| format!("could not flush {temporary:?}: {error}"))?;
    }

    fs::rename(&temporary, &path)
        .map_err(|error| format!("could not replace {path:?}: {error}"))?;
    Ok(())
}

/// Where the saved document lives, so Settings can show it.
#[tauri::command]
fn store_path(app: AppHandle) -> Result<String, String> {
    Ok(store_file(&app)?.to_string_lossy().into_owned())
}

/// Writes an exported report and returns the full path it was written to.
///
/// `filename` is a NAME, never a path: any separator, any parent reference and
/// any drive prefix is rejected outright rather than sanitised, so this command
/// can only ever write inside the export folder. That is the whole reason the
/// app needs no filesystem plugin and grants no filesystem permission.
#[tauri::command]
fn export_save(app: AppHandle, filename: String, bytes: Vec<u8>) -> Result<String, String> {
    if filename.is_empty()
        || filename.len() > 180
        || filename.contains(['/', '\\', ':', '\0'])
        || filename.contains("..")
        || filename.starts_with('.')
    {
        return Err("invalid file name".into());
    }

    // Only the three formats the frontend can produce.
    let allowed = [".pdf", ".csv", ".txt"];
    if !allowed.iter().any(|suffix| filename.ends_with(suffix)) {
        return Err("unsupported file type".into());
    }

    // 64 MB is far beyond any report this app can generate; it is here so a
    // bug in the renderer cannot fill the disk.
    if bytes.len() > 64 * 1024 * 1024 {
        return Err("export is too large".into());
    }

    let base = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_data_dir())
        .map_err(|error| format!("no documents directory: {error}"))?;
    let dir = base.join(EXPORT_DIR);
    fs::create_dir_all(&dir).map_err(|error| format!("could not create {dir:?}: {error}"))?;

    let path = dir.join(&filename);
    fs::write(&path, &bytes).map_err(|error| format!("could not write {path:?}: {error}"))?;
    Ok(path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            store_load,
            store_save,
            store_path,
            export_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running PharmaWallah");
}
