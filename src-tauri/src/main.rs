// Prevents an additional console window from opening alongside the app on
// Windows in release builds. Without it every launch shows a black terminal.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    pharmawallah_lib::run()
}
