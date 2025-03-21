import React, { useState } from "react";
import CategoriesView from "./components/CategoriesView";
import SuppliersView from "./components/SuppliersView";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 flex gap-4">
      {/* Stânga: Categorii */}
      <div className="w-1/4 bg-white p-3 shadow rounded">
        <CategoriesView onSelectCat={(cat) => setSelectedCategory(cat)} />
      </div>

      {/* Dreapta: Furnizori */}
      <div className="flex-1 bg-white p-3 shadow rounded">
        {selectedCategory ? (
          <SuppliersView category={selectedCategory} />
        ) : (
          <p className="text-gray-500">Selectați o categorie.</p>
        )}
      </div>
    </div>
  );
}
