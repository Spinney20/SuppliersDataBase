import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export default function CategoriesView({ onSelectCat }) {
  const [db, setDb] = useState(null);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDB() {
    setLoading(true);
    try {
      const res = await invoke("read_db_file");
      setDb(res);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcarea DB.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDB();
  }, []);

  async function addCategory() {
    if (!newCat.trim()) return;
    try {
      let res = await invoke("add_category", { catName: newCat.trim() });
      setDb(res);
      setNewCat("");
    } catch (err) {
      console.error(err);
      alert("Eroare la adăugare categorie.");
    }
  }

  async function removeCategory(cat) {
    if (!window.confirm(`Ștergi categoria "${cat}"?`)) return;
    try {
      let res = await invoke("remove_category", { catName: cat });
      setDb(res);
      if (onSelectCat) onSelectCat(null);
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergere categorie.");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Categorii</h2>
      {loading && <p className="text-gray-400">Loading...</p>}

      {db?.categories && db.categories.map((cat, idx) => (
        <div key={idx} className="flex items-center justify-between mb-2">
          <button
            onClick={() => onSelectCat(cat)}
            className="text-left text-blue-600 hover:underline flex-1"
          >
            {cat}
          </button>
          <button
            onClick={() => removeCategory(cat)}
            className="text-sm text-red-500 px-2 py-1 hover:bg-red-100 rounded"
          >
            X
          </button>
        </div>
      ))}

      <div className="mt-4">
        <input
          className="border p-1 text-sm w-full mb-1"
          placeholder="Categorie nouă..."
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
        />
        <button
          onClick={addCategory}
          className="bg-green-500 text-white w-full py-1 text-sm rounded"
        >
          Adaugă
        </button>
      </div>
    </div>
  );
}
