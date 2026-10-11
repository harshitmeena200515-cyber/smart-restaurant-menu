import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, Plus, Save, X, Check, Sliders } from 'lucide-react';
import useMenuStore from '../../store/menuStore';
import { toast } from '../../store/toastStore';

const CustomizationManager = () => {
  const customizationGroups = useMenuStore((s) => s.customizationGroups);
  const menuItems = useMenuStore((s) => s.menuItems);
  const addCustomizationGroup = useMenuStore((s) => s.addCustomizationGroup);
  const updateCustomizationGroup = useMenuStore((s) => s.updateCustomizationGroup);
  const deleteCustomizationGroup = useMenuStore((s) => s.deleteCustomizationGroup);

  const [expandedId, setExpandedId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupData, setEditGroupData] = useState(null);

  // New Group state
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    required: true,
    maxSelect: 1,
    options: [
      { id: 'opt-1', name: 'Half', price: 0 },
      { id: 'opt-2', name: 'Full', price: 100 },
    ],
  });

  const toggleExpand = (id) => {
    if (editingGroupId && editingGroupId !== id) {
      if (!window.confirm('You have unsaved changes in another group. Discard them?')) return;
      setEditingGroupId(null);
      setEditGroupData(null);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const startEditGroup = (group) => {
    setEditingGroupId(group.id);
    setExpandedId(group.id);
    setEditGroupData({
      name: group.name,
      required: Boolean(group.required),
      maxSelect: group.maxSelect || 1,
      options: group.options.map((opt) => ({ ...opt })),
    });
  };

  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setEditGroupData(null);
  };

  const handleSaveGroupEdit = (groupId) => {
    if (!editGroupData.name.trim()) {
      toast.error('Group name cannot be empty');
      return;
    }
    if (editGroupData.options.length === 0) {
      toast.error('A customization group must have at least one option');
      return;
    }

    try {
      updateCustomizationGroup(groupId, {
        name: editGroupData.name.trim(),
        required: editGroupData.required,
        maxSelect: parseInt(editGroupData.maxSelect, 10) || 1,
        options: editGroupData.options.map((opt, i) => ({
          id: opt.id || `opt-${Date.now()}-${i}`,
          name: opt.name.trim(),
          price: Number(opt.price) >= 0 ? Number(opt.price) : 0,
        })),
      });

      toast.success(`✅ Saved customizations for "${editGroupData.name}"!`);
      setEditingGroupId(null);
      setEditGroupData(null);
    } catch (err) {
      toast.error('Failed to save customization changes');
    }
  };

  // Option actions inside edit mode
  const handleOptionChange = (idx, field, value) => {
    setEditGroupData((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[idx] = {
        ...nextOptions[idx],
        [field]: field === 'price' ? value : value,
      };
      return { ...prev, options: nextOptions };
    });
  };

  const handleAddOptionToEditing = () => {
    setEditGroupData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: `opt-${Date.now()}-${prev.options.length}`,
          name: 'New Option',
          price: 0,
        },
      ],
    }));
  };

  const handleRemoveOptionFromEditing = (idx) => {
    if (editGroupData.options.length <= 1) {
      toast.error('Must have at least one option');
      return;
    }
    setEditGroupData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  // Add Group actions
  const handleAddNewGroup = () => {
    if (!newGroupData.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (newGroupData.options.length === 0) {
      toast.error('Please add at least one option');
      return;
    }

    try {
      addCustomizationGroup({
        name: newGroupData.name.trim(),
        required: newGroupData.required,
        maxSelect: parseInt(newGroupData.maxSelect, 10) || 1,
        options: newGroupData.options.map((opt, i) => ({
          id: `opt-${Date.now()}-${i}`,
          name: opt.name.trim() || 'Option',
          price: Number(opt.price) >= 0 ? Number(opt.price) : 0,
        })),
      });

      toast.success(`🎉 Customization group "${newGroupData.name}" created!`);
      setIsAddingGroup(false);
      setNewGroupData({
        name: '',
        required: true,
        maxSelect: 1,
        options: [
          { id: 'opt-1', name: 'Half', price: 0 },
          { id: 'opt-2', name: 'Full', price: 100 },
        ],
      });
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  const handleDeleteGroup = (id, name) => {
    const usedBy = menuItems.filter((i) => i.customizationGroupIds?.includes(id)).length;
    if (usedBy > 0) {
      toast.error(`Cannot delete "${name}" — used in ${usedBy} items. Remove from items first.`);
      return;
    }
    if (window.confirm(`Delete customization group "${name}"? This cannot be undone.`)) {
      deleteCustomizationGroup(id);
      toast.success(`Deleted "${name}"`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Sliders size={24} className="text-brand-600" />
            Portion & Customization Prices
          </h2>
          <p className="text-surface-500 text-sm mt-0.5">
            Manage Half/Full rates, portion sizes, add-on pricing, and variants.
          </p>
        </div>
        {!isAddingGroup && (
          <button
            onClick={() => setIsAddingGroup(true)}
            className="btn-primary flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus size={18} />
            New Customization Group
          </button>
        )}
      </div>

      {/* New Group Creator Modal/Card */}
      {isAddingGroup && (
        <div className="bg-brand-50/70 rounded-2xl p-5 border-2 border-brand-300 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-brand-900 text-base flex items-center gap-2">
              <Plus size={18} className="text-brand-600" />
              Create Customization Group (e.g., Half / Full Portion)
            </h3>
            <button
              onClick={() => setIsAddingGroup(false)}
              className="p-1.5 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-surface-700 mb-1">Group Name *</label>
              <input
                type="text"
                placeholder="e.g., Portion (Half / Full), Extra Add-ons"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">Selection Limit</label>
              <select
                value={newGroupData.maxSelect}
                onChange={(e) =>
                  setNewGroupData({ ...newGroupData, maxSelect: parseInt(e.target.value, 10) })
                }
                className="input-field"
              >
                <option value={1}>Single Choice (1 only)</option>
                <option value={2}>Max 2 Choices</option>
                <option value={4}>Multiple (up to 4)</option>
                <option value={10}>Unlimited</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-surface-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newGroupData.required}
                onChange={(e) => setNewGroupData({ ...newGroupData, required: e.target.checked })}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              Required selection (Customer must pick an option)
            </label>
          </div>

          {/* Options list for new group */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-surface-800 uppercase tracking-wider">
              Options & Additional Prices
            </label>
            <div className="space-y-2">
              {newGroupData.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-surface-200">
                  <input
                    type="text"
                    placeholder="Option name (e.g. Half)"
                    value={opt.name}
                    onChange={(e) => {
                      const next = [...newGroupData.options];
                      next[i].name = e.target.value;
                      setNewGroupData({ ...newGroupData, options: next });
                    }}
                    className="input-field flex-1 py-1.5 text-sm"
                  />
                  <div className="flex items-center gap-1 w-32">
                    <span className="text-surface-400 font-semibold text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      value={opt.price}
                      onChange={(e) => {
                        const next = [...newGroupData.options];
                        next[i].price = e.target.value;
                        setNewGroupData({ ...newGroupData, options: next });
                      }}
                      className="input-field py-1.5 text-sm font-bold text-brand-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newGroupData.options.length <= 1) return;
                      setNewGroupData({
                        ...newGroupData,
                        options: newGroupData.options.filter((_, idx) => idx !== i),
                      });
                    }}
                    className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setNewGroupData({
                  ...newGroupData,
                  options: [
                    ...newGroupData.options,
                    { id: `opt-${Date.now()}`, name: '', price: 0 },
                  ],
                })
              }
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-2 p-1"
            >
              <Plus size={14} /> Add Another Choice
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-200">
            <button
              type="button"
              onClick={() => setIsAddingGroup(false)}
              className="btn-secondary text-sm py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddNewGroup}
              className="btn-primary text-sm py-2 shadow-sm"
            >
              Save Customization Group
            </button>
          </div>
        </div>
      )}

      {/* Existing Groups List */}
      <div className="space-y-3.5">
        {customizationGroups.map((group) => {
          const isExpanded = expandedId === group.id;
          const isEditing = editingGroupId === group.id;
          const usedBy = menuItems.filter((i) => i.customizationGroupIds?.includes(group.id)).length;

          return (
            <div
              key={group.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all ${
                isEditing
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                  : 'border-surface-200 hover:border-surface-300'
              }`}
            >
              {/* Group Header Bar */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-50/70 transition-colors rounded-2xl"
                onClick={() => !isEditing && toggleExpand(group.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                  <span className="text-surface-400 shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-surface-900 text-base flex items-center gap-2 truncate">
                      {group.name}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full shrink-0 ${
                          group.required ? 'bg-red-100 text-red-700' : 'bg-surface-100 text-surface-600'
                        }`}
                      >
                        {group.required ? 'Required' : 'Optional'}
                      </span>
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5 truncate">
                      {group.options.length} options (
                      {group.options
                        .slice(0, 3)
                        .map((o) => `${o.name}${o.price > 0 ? ` +₹${o.price}` : ''}`)
                        .join(', ')}
                      {group.options.length > 3 ? '...' : ''}) · In {usedBy} dishes
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveGroupEdit(group.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Save size={14} /> Save Prices
                      </button>
                      <button
                        onClick={cancelEditGroup}
                        className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditGroup(group)}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Edit options & prices"
                      >
                        <Edit2 size={13} /> Edit Prices
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className={`p-2 rounded-lg transition-colors ${
                          usedBy > 0
                            ? 'text-surface-300 cursor-not-allowed'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                        title={usedBy > 0 ? `Cannot delete: used in ${usedBy} items` : 'Delete group'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editing Form Expanded Body */}
              {isEditing && editGroupData && (
                <div className="p-4 sm:p-5 border-t border-surface-200 bg-surface-50/80 rounded-b-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-surface-700 mb-1">
                        Group Title
                      </label>
                      <input
                        type="text"
                        value={editGroupData.name}
                        onChange={(e) =>
                          setEditGroupData({ ...editGroupData, name: e.target.value })
                        }
                        className="input-field bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-surface-700 mb-1">
                        Max Choices
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editGroupData.maxSelect}
                        onChange={(e) =>
                          setEditGroupData({
                            ...editGroupData,
                            maxSelect: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="input-field bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req-${group.id}`}
                      checked={editGroupData.required}
                      onChange={(e) =>
                        setEditGroupData({ ...editGroupData, required: e.target.checked })
                      }
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <label
                      htmlFor={`req-${group.id}`}
                      className="text-xs font-semibold text-surface-700 cursor-pointer"
                    >
                      Compulsory selection (Required)
                    </label>
                  </div>

                  {/* Options editor */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                        Options & Variant Prices (कीमत बदलें)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddOptionToEditing}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editGroupData.options.map((opt, idx) => (
                        <div
                          key={opt.id || idx}
                          className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-surface-200 shadow-sm"
                        >
                          <input
                            type="text"
                            placeholder="Option Name (e.g., Half, Full)"
                            value={opt.name}
                            onChange={(e) => handleOptionChange(idx, 'name', e.target.value)}
                            className="input-field flex-1 py-1.5 text-sm"
                          />
                          <div className="flex items-center gap-1 w-32">
                            <span className="text-surface-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0"
                              value={opt.price}
                              onChange={(e) => handleOptionChange(idx, 'price', e.target.value)}
                              className="input-field py-1.5 text-sm font-bold text-brand-700"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionFromEditing(idx)}
                            className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove option"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-200">
                    <button
                      type="button"
                      onClick={cancelEditGroup}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveGroupEdit(group.id)}
                      className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-md"
                    >
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Read-Only Options View (when expanded & not editing) */}
              {isExpanded && !isEditing && (
                <div className="px-5 pb-5 pt-1 border-t border-surface-100 bg-surface-50/50 rounded-b-2xl">
                  <div className="flex justify-between items-center mt-3 mb-2">
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                      Configured Options & Rates
                    </span>
                    <button
                      onClick={() => startEditGroup(group)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit Prices
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex justify-between items-center p-3 bg-white border border-surface-200 rounded-xl shadow-xs"
                      >
                        <span className="font-semibold text-surface-800 text-sm">{opt.name}</span>
                        <span
                          className={`text-sm font-bold ${
                            opt.price > 0 ? 'text-brand-600' : 'text-emerald-600'
                          }`}
                        >
                          {opt.price > 0 ? `+₹${opt.price}` : 'Base Price (Included)'}
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
          <div className="p-8 text-center text-surface-500 bg-white rounded-2xl border border-surface-200">
            No customization groups defined yet. Click "New Customization Group" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationManager;
