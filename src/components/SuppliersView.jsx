import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import ContactsModal from "./ContactsModal";

export default function SuppliersView({ category }) {
  const [db, setDb] = useState(null);
  const [newName, setNewName] = useState("");
  const [newEmails, setNewEmails] = useState("");
  const [newPhones, setNewPhones] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadDB();
  }, [category]);

  async function loadDB() {
    try {
      let res = await invoke("read_db_file");
      setDb(res);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcare DB (suppliers).");
    }
  }

  function getSuppliers() {
    if (!db) return [];
    if (!db.suppliers[category]) return [];
    return db.suppliers[category];
  }

  async function addSupplier() {
    if (!newName.trim()) return;
    let emails = newEmails.split(",").map(e => e.trim()).filter(Boolean);
    let phones = newPhones.split(",").map(e => e.trim()).filter(Boolean);

    let supplier = {
      nume: newName.trim(),
      emails,
      telefoane: phones,
      contacte: []
    };
    try {
      let updatedDB = await invoke("add_supplier", {
        catName: category,
        supplier
      });
      setDb(updatedDB);
      setNewName("");
      setNewEmails("");
      setNewPhones("");
    } catch (err) {
      console.error(err);
      alert("Eroare la adăugare furnizor.");
    }
  }

  async function removeSupplier(numeFurn) {
    if (!window.confirm(`Ștergi furnizorul "${numeFurn}"?`)) return;
    try {
      let updatedDB = await invoke("remove_supplier", {
        catName: category,
        supplierName: numeFurn
      });
      setDb(updatedDB);
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergere furnizor.");
    }
  }

  async function updateSupplier(oldName) {
    let newN = prompt("Nume nou furnizor:", oldName);
    if (!newN) return;
    let newE = prompt("Emails (virgulă):", "");
    if (newE === null) return;
    let newT = prompt("Telefoane (virgulă):", "");
    if (newT === null) return;

    let arrE = newE.split(",").map(e => e.trim()).filter(Boolean);
    let arrT = newT.split(",").map(e => e.trim()).filter(Boolean);

    try {
      let updatedDB = await invoke("update_supplier", {
        catName: category,
        oldName,
        newName: newN,
        newEmails: arrE,
        newTelefoane: arrT
      });
      setDb(updatedDB);
    } catch (err) {
      console.error(err);
      alert("Eroare la update furnizor.");
    }
  }

  function openContacts(sup) {
    setSelectedSupplier(sup);
    setShowContacts(true);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Furnizori din: {category}</h2>

      {/* Adăugare furnizor */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-1 text-sm flex-1"
          placeholder="Nume furnizor"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border p-1 text-sm flex-1"
          placeholder="Emails (virgulă)"
          value={newEmails}
          onChange={(e) => setNewEmails(e.target.value)}
        />
        <input
          className="border p-1 text-sm flex-1"
          placeholder="Telefoane (virgulă)"
          value={newPhones}
          onChange={(e) => setNewPhones(e.target.value)}
        />
        <button
          onClick={addSupplier}
          className="bg-green-500 text-white px-2 py-1 text-sm rounded"
        >
          Adaugă
        </button>
      </div>

      {/* Listă furnizori */}
      {getSuppliers().map((sup, idx) => (
        <div key={idx} className="border-b py-2 flex justify-between items-center">
          <div>
            <span className="font-bold text-blue-700">{sup.nume}</span>
            <br />
            <span className="text-sm text-gray-600">
              Emails: {sup.emails.join(", ") || "N/A"}
            </span>
            <br />
            <span className="text-sm text-gray-600">
              Phones: {sup.telefoane.join(", ") || "N/A"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openContacts(sup)}
              className="px-2 py-1 border border-blue-200 text-blue-600 rounded text-sm"
            >
              Contacte
            </button>
            <button
              onClick={() => updateSupplier(sup.nume)}
              className="px-2 py-1 border border-gray-200 text-gray-600 rounded text-sm"
            >
              Update
            </button>
            <button
              onClick={() => removeSupplier(sup.nume)}
              className="px-2 py-1 border border-red-200 text-red-600 rounded text-sm"
            >
              Șterge
            </button>
          </div>
        </div>
      ))}

      {/* Modal contacte */}
      {showContacts && selectedSupplier && (
        <ContactsModal
          category={category}
          supplier={selectedSupplier}
          onClose={() => {
            setShowContacts(false);
            setSelectedSupplier(null);
            loadDB();
          }}
        />
      )}
    </div>
  );
}
