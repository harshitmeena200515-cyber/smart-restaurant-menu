import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import useMenuStore from '../../store/menuStore';

const CategoryManager = () => {
  const categories = useMenuStore((s) => s.categories);
  const menuItems = useMenuStore((s) => s.menuItems);
  const addCategory = useMenuStore((s) => s.addCategory);
  const updateCategory = useMenuStore((s) => s.updateCategory);
  const deleteCategory = useMenuStore((s) => s.deleteCategory);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCat, setNewCat] = useState({ name: '', icon: '' });
  const [editCat, setEditCat] = useState({ name: '', icon: '' });

  const handleAdd = () => {
    if (!newCat.name) return;
    addCategory({
      name: newCat.name,
      icon: newCat.icon || '🍽️',
      order: categories.length + 1,
    });
    setNewCat({ name: '', icon: '' });
    setIsAdding(false);
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditCat({ name: cat.name, icon: cat.icon });
  };

  const handleSaveEdit = (id) => {
    if (!editCat.name) return;
    updateCategory(id, editCat);
    setEditingId(null);
  };

  const handleDelete = (id, name) => {
    const count = menuItems.filter((i) => i.category === id).length;
    if (count > 0) {
      alert(`Cannot delete "${name}" — it has ${count} items. Move or delete them first.`);
      return;
    }
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Categories</h2>
          <p className="text-surface-500 text-sm mt-1">Organize your menu sections.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-brand-800 mb-1">Name *</label>
            <input type="text" placeholder="e.g., Starters" value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className="input-field" />
          </div>
          <div className="w-full sm:w-24">
            <label className="block text-xs font-semibold text-brand-800 mb-1">Icon</label>
            <input type="text" placeholder="🍔" value={newCat.icon}
              onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
              className="input-field text-center text-xl" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleAdd} className="btn-primary flex-1 sm:flex-none">Add</button>
            <button onClick={() => setIsAdding(false)} className="btn-secondary flex-1 sm:flex-none">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 divide-y divide-surface-100 overflow-hidden">
        {categories.map((cat, idx) => {
          const count = menuItems.filter((i) => i.category === cat.id).length;
          const editing = editingId === cat.id;

          return (
            <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
              {editing ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2 items-center mr-4">
                  <input type="text" value={editCat.name} onChange={(e) => setEditCat({ ...editCat, name: e.target.value })} className="input-field flex-1" />
                  <input type="text" value={editCat.icon} onChange={(e) => setEditCat({ ...editCat, icon: e.target.value })} className="input-field w-16 text-center text-xl" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-surface-300 text-xs font-mono w-5 text-center">#{idx + 1}</span>
                  <span className="w-11 h-11 bg-surface-100 rounded-xl flex items-center justify-center text-xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-surface-900">{cat.name}</h3>
                    <p className="text-xs text-surface-500">{count} item{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-1 shrink-0">
                {editing ? (
                  <>
                    <button onClick={() => handleSaveEdit(cat.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-surface-500 hover:bg-surface-100 rounded-lg"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)}
                      className={`p-2 rounded-lg ${count > 0 ? 'text-surface-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                      title={count > 0 ? 'Has items' : 'Delete'}>
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="p-8 text-center text-surface-500">No categories yet.</div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
