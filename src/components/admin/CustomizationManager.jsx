import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import useMenuStore from '../../store/menuStore';

const CustomizationManager = () => {
  const customizationGroups = useMenuStore((s) => s.customizationGroups);
  const menuItems = useMenuStore((s) => s.menuItems);
  const deleteCustomizationGroup = useMenuStore((s) => s.deleteCustomizationGroup);

  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId(expandedId === id ? null : id);

  const handleDelete = (id, name) => {
    const usedBy = menuItems.filter((i) => i.customizationGroupIds?.includes(id)).length;
    if (usedBy > 0) {
      alert(`Cannot delete "${name}" — it is used by ${usedBy} menu items. Remove it from those items first.`);
      return;
    }
    if (window.confirm(`Delete customization group "${name}"?`)) {
      deleteCustomizationGroup(id);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Customizations</h2>
        <p className="text-surface-500 text-sm mt-1">Manage sizes, add-ons, spice levels and other options.</p>
      </div>

      <div className="space-y-3">
        {customizationGroups.map((group) => {
          const expanded = expandedId === group.id;
          const usedBy = menuItems.filter((i) => i.customizationGroupIds?.includes(group.id)).length;

          return (
            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-50 transition-colors"
                onClick={() => toggle(group.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-surface-400">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                  <div>
                    <h3 className="font-bold text-surface-900 flex items-center gap-2">
                      {group.name}
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        group.required ? 'bg-red-100 text-red-700' : 'bg-surface-100 text-surface-500'
                      }`}>
                        {group.required ? 'Required' : 'Optional'}
                      </span>
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {group.options.length} options · Used in {usedBy} item{usedBy !== 1 ? 's' : ''}
                      {group.maxSelect > 1 && ` · Max ${group.maxSelect} selections`}
                    </p>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleDelete(group.id, group.name)}
                    className={`p-2 rounded-lg transition-colors ${usedBy > 0 ? 'text-surface-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                    title={usedBy > 0 ? 'In use' : 'Delete'}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded options */}
              {expanded && (
                <div className="px-4 pb-4 border-t border-surface-100 bg-surface-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {group.options.map((opt) => (
                      <div key={opt.id} className="flex justify-between items-center p-3 bg-white border border-surface-200 rounded-xl">
                        <span className="font-medium text-surface-900 text-sm">{opt.name}</span>
                        <span className={`text-sm font-semibold ${opt.price > 0 ? 'text-brand-600' : 'text-surface-400'}`}>
                          {opt.price > 0 ? `+₹${opt.price}` : 'Included'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {customizationGroups.length === 0 && (
          <div className="p-8 text-center text-surface-500 bg-white rounded-xl border border-surface-100">
            No customization groups defined.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationManager;
