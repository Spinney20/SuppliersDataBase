#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;
use std::path::PathBuf;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use tauri::{command, generate_handler, generate_context, AppHandle};

/// Struct pentru un Contact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Contact {
    pub nume_contact: String,
    pub email: String,
    pub telefon: String,
}

/// Struct pentru un Furnizor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Supplier {
    pub nume: String,
    pub emails: Vec<String>,
    pub telefoane: Vec<String>,
    pub contacte: Vec<Contact>,
}

/// Struct complet pentru DB
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DB {
    pub categories: Vec<String>,
    pub suppliers: HashMap<String, Vec<Supplier>>,
}

/// Citește fișierul JSON
#[command]
fn read_db_file(app_handle: AppHandle) -> Result<DB, String> {
    let path = get_db_path();
    let data = fs::read_to_string(&path).map_err(|e| format!("Eroare citire: {}", e))?;
    let db: DB = serde_json::from_str(&data).map_err(|e| format!("Eroare parse JSON: {}", e))?;
    Ok(db)
}

/// Scrie fișierul JSON
#[command]
fn write_db_file(app_handle: AppHandle, new_db: DB) -> Result<(), String> {
    let path = get_db_path();
    let data = serde_json::to_string_pretty(&new_db)
        .map_err(|e| format!("Eroare serializare: {}", e))?;
    fs::write(&path, data).map_err(|e| format!("Eroare scriere: {}", e))?;
    Ok(())
}

/// Adaugă categorie
#[command]
fn add_category(app_handle: AppHandle, cat_name: String) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if !db.categories.contains(&cat_name) {
        db.categories.push(cat_name.clone());
        db.suppliers.insert(cat_name, vec![]);
        write_db_file(app_handle, db.clone())?;
    }
    Ok(db)
}

/// Șterge categorie
#[command]
fn remove_category(app_handle: AppHandle, cat_name: String) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    db.categories.retain(|c| c != &cat_name);
    db.suppliers.remove(&cat_name);
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Adaugă furnizor
#[command]
fn add_supplier(app_handle: AppHandle, cat_name: String, supplier: Supplier) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if db.categories.contains(&cat_name) {
        if let Some(list) = db.suppliers.get_mut(&cat_name) {
            list.push(supplier);
        }
    }
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Șterge furnizor
#[command]
fn remove_supplier(app_handle: AppHandle, cat_name: String, supplier_name: String) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if let Some(list) = db.suppliers.get_mut(&cat_name) {
        list.retain(|sup| sup.nume != supplier_name);
    }
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Update furnizor
#[command]
fn update_supplier(
    app_handle: AppHandle,
    cat_name: String,
    old_name: String,
    new_name: Option<String>,
    new_emails: Option<Vec<String>>,
    new_telefoane: Option<Vec<String>>
) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if let Some(list) = db.suppliers.get_mut(&cat_name) {
        if let Some(sup) = list.iter_mut().find(|s| s.nume == old_name) {
            if let Some(n) = new_name { sup.nume = n; }
            if let Some(e) = new_emails { sup.emails = e; }
            if let Some(t) = new_telefoane { sup.telefoane = t; }
        }
    }
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Adaugă contact
#[command]
fn add_contact(app_handle: AppHandle, cat_name: String, supplier_name: String, contact: Contact) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if let Some(list) = db.suppliers.get_mut(&cat_name) {
        if let Some(sup) = list.iter_mut().find(|s| s.nume == supplier_name) {
            sup.contacte.push(contact);
        }
    }
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Șterge contact
#[command]
fn remove_contact(app_handle: AppHandle, cat_name: String, supplier_name: String, contact_name: String) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if let Some(list) = db.suppliers.get_mut(&cat_name) {
        if let Some(sup) = list.iter_mut().find(|s| s.nume == supplier_name) {
            sup.contacte.retain(|c| c.nume_contact != contact_name);
        }
    }
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Update contact
#[command]
fn update_contact(
    app_handle: AppHandle,
    cat_name: String,
    supplier_name: String,
    old_contact_name: String,
    new_contact_name: Option<String>,
    new_email: Option<String>,
    new_phone: Option<String>
) -> Result<DB, String> {
    let mut db = read_db_file(app_handle.clone())?;
    if let Some(list) = db.suppliers.get_mut(&cat_name) {
        if let Some(sup) = list.iter_mut().find(|s| s.nume == supplier_name) {
            if let Some(contact) = sup.contacte.iter_mut().find(|c| c.nume_contact == old_contact_name) {
                if let Some(nc) = new_contact_name { contact.nume_contact = nc; }
                if let Some(em) = new_email { contact.email = em; }
                if let Some(tel) = new_phone { contact.telefon = tel; }
            }
        }
    }
    write_db_file(app_handle, db.clone())?;
    Ok(db)
}

/// Helper: calea fixă la fișierul suppliers_db.json
fn get_db_path() -> PathBuf {
    // !!! AICI setezi calea ta reală !!!
    // ex: "C:\\Users\\Andrei Teodor Dobre\\Desktop\\Facultate\\viarom\\BazaDeDate\\suppliers_db.json"
    PathBuf::from(r"C:\Users\Andrei Teodor Dobre\Desktop\Facultate\viarom\BazaDeDate\suppliers_db.json")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![
            read_db_file,
            write_db_file,
            add_category,
            remove_category,
            add_supplier,
            remove_supplier,
            update_supplier,
            add_contact,
            remove_contact,
            update_contact
        ])
        .run(generate_context!())
        .expect("error while running Tauri application");
}
