import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export default function ContactsModal({ category, supplier, onClose }) {
  const [contacts, setContacts] = useState(supplier.contacte || []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setContacts(supplier.contacte || []);
  }, [supplier]);

  async function addContact() {
    if (!name.trim()) return;
    let newC = {
      nume_contact: name.trim(),
      email: email.trim(),
      telefon: phone.trim()
    };
    try {
      await invoke("add_contact", {
        catName: category,
        supplierName: supplier.nume,
        contact: newC
      });
      setContacts([...contacts, newC]);
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      console.error(err);
      alert("Eroare la add contact.");
    }
  }

  async function removeContact(cname) {
    if (!window.confirm(`Ștergi contactul "${cname}"?`)) return;
    try {
      await invoke("remove_contact", {
        catName: category,
        supplierName: supplier.nume,
        contactName: cname
      });
      setContacts(contacts.filter((c) => c.nume_contact !== cname));
    } catch (err) {
      console.error(err);
      alert("Eroare la remove contact.");
    }
  }

  async function updateContact(oldName) {
    let newN = prompt("Nume contact nou:");
    if (!newN) return;
    let newE = prompt("Email nou:");
    if (newE === null) return;
    let newP = prompt("Telefon nou:");
    if (newP === null) return;

    try {
      await invoke("update_contact", {
        catName: category,
        supplierName: supplier.nume,
        oldContactName: oldName,
        newContactName: newN,
        newEmail: newE,
        newPhone: newP
      });
      setContacts(
        contacts.map((c) => {
          if (c.nume_contact === oldName) {
            return {
              nume_contact: newN,
              email: newE,
              telefon: newP
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error(err);
      alert("Eroare la update contact.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] p-4 rounded shadow relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-xl font-bold mb-3">
          Contacte pentru {supplier.nume}
        </h2>
        <div className="mb-2 flex gap-2">
          <input
            className="border p-1 flex-1"
            placeholder="Nume persoană..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-1 flex-1"
            placeholder="Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border p-1 flex-1"
            placeholder="Telefon..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={addContact}
            className="bg-green-500 text-white px-2 rounded"
          >
            Adaugă
          </button>
        </div>

        <div className="max-h-80 overflow-auto">
          {contacts.map((c, idx) => (
            <div
              key={idx}
              className="border p-2 mb-2 flex justify-between items-center"
            >
              <div>
                <strong>{c.nume_contact}</strong> <br />
                <span className="text-sm text-gray-600">
                  {c.email} | {c.telefon}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateContact(c.nume_contact)}
                  className="text-sm px-2 py-1 border border-gray-200 text-blue-600 rounded"
                >
                  Modifică
                </button>
                <button
                  onClick={() => removeContact(c.nume_contact)}
                  className="text-sm px-2 py-1 border border-red-200 text-red-600 rounded"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
