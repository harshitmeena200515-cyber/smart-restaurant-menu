import React, { useState } from 'react';
import { 
  BarChart3, ClipboardList, Zap, Layers, Sliders, QrCode, 
  UtensilsCrossed, CheckCircle, XCircle, Grid3X3, ExternalLink, LogOut,
  Building2
} from 'lucide-react';
import useMenuStore from '../store/menuStore';
import useAuthStore from '../store/authStore';

import MenuManager from '../components/admin/MenuManager';
import AvailabilityManager from '../components/admin/AvailabilityManager';
import CategoryManager from '../components/admin/CategoryManager';
import CustomizationManager from '../components/admin/CustomizationManager';
import QRGenerator from '../components/admin/QRGenerator';
import BrandingManager from '../components/admin/BrandingManager';
import { getProductImageUrl } from '../utils/imageUtils';
import { toast } from '../store/toastStore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const restaurant = useMenuStore((s) => s.restaurant);
  const menuItems = useMenuStore((s) => s.menuItems);
  const categories = useMenuStore((s) => s.categories);
  const toggleAvailability = useMenuStore((s) => s.toggleAvailability);
  
  const totalItems = menuItems.length;
  const availableItems = menuItems.filter(item => item.isAvailable).length;
  const soldOutItems = totalItems - availableItems;
  const totalCategories = categories.length;
  const soldOutList = menuItems.filter(item => !item.isAvailable);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Restaurant Settings', icon: <Building2 size={20} /> },
    { id: 'menu', label: 'Menu Items', icon: <ClipboardList size={20} /> },
    { id: 'availability', label: 'Live Availability', icon: <Zap size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={20} /> },
    { id: 'customizations', label: 'Customizations', icon: <Sliders size={20} /> },
    { id: 'qr', label: 'QR Menu', icon: <QrCode size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
      case 'branding': return <BrandingManager />;
      case 'menu': return <MenuManager />;
      case 'availability': return <AvailabilityManager />;
      case 'categories': return <CategoryManager />;
      case 'customizations': return <CustomizationManager />;
      case 'qr': return <QRGenerator />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Dashboard Overview</h2>

            {/* Quick Restaurant Settings Banner */}
            <div className="bg-white rounded-2xl shadow-xs border border-surface-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner overflow-hidden shrink-0">
                  {restaurant.logo && (restaurant.logo.startsWith('http') || restaurant.logo.startsWith('data:') || restaurant.logo.startsWith('/')) ? (
                    <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif font-black text-amber-700 text-lg select-none">
                      {restaurant.name ? restaurant.name.charAt(0).toUpperCase() : 'M'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-surface-900 text-base">{restaurant.name}</h3>
                    {restaurant.subname && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {restaurant.subname}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">{restaurant.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors border border-brand-200 self-start sm:self-center"
              >
                <Building2 size={14} />
                Restaurant Settings
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card flex items-center space-x-4">
                <div className="p-3 bg-brand-100 text-brand-600 rounded-lg">
                  <UtensilsCrossed size={24} />
                </div>
                <div>
                  <p className="text-sm text-surface-500 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-surface-900">{totalItems}</p>
                </div>
              </div>
              
              <div className="stat-card flex items-center space-x-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-surface-500 font-medium">Available</p>
                  <p className="text-2xl font-bold text-green-600">{availableItems}</p>
                </div>
              </div>
              
              <div className="stat-card flex items-center space-x-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-surface-500 font-medium">Sold Out</p>
                  <p className="text-2xl font-bold text-red-600">{soldOutItems}</p>
                </div>
              </div>
              
              <div className="stat-card flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <Grid3X3 size={24} />
                </div>
                <div>
                  <p className="text-sm text-surface-500 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-surface-900">{totalCategories}</p>
                </div>
              </div>
            </div>

            {soldOutItems > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
                <div className="p-4 border-b border-surface-200 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 flex items-center">
                    <XCircle size={20} className="mr-2" />
                    Currently Sold Out ({soldOutItems})
                  </h3>
                </div>
                <div className="divide-y divide-surface-100">
                  {soldOutList.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={getProductImageUrl(item.image, item.category, item.id, item.name)} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-lg object-cover bg-surface-100" 
                        />
                        <div>
                          <p className="font-medium text-surface-900">{item.name}</p>
                          <p className="text-sm text-surface-500">
                            {categories.find(c => c.id === item.category)?.name}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          toggleAvailability(item.id);
                          toast.success(`"${item.name}" marked Available`);
                        }}
                        className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        Mark Available
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] fixed inset-y-0 left-0 bg-white border-r border-surface-200 z-20">
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200 bg-brand-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-sm font-serif font-black text-brand-700 overflow-hidden shrink-0">
              {restaurant.logo && (restaurant.logo.startsWith('http') || restaurant.logo.startsWith('data:') || restaurant.logo.startsWith('/')) ? (
                <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span>{restaurant.name ? restaurant.name.charAt(0).toUpperCase() : 'M'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black text-brand-900 leading-tight truncate">{restaurant.name}</h1>
              <p className="text-[10px] text-brand-700 font-semibold truncate">{restaurant.subname || 'Admin Panel'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab ${activeTab === tab.id ? 'admin-tab-active' : 'admin-tab-inactive'}`}
            >
              <span className={activeTab === tab.id ? 'text-brand-600' : 'text-surface-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-100 bg-surface-50">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
          >
            <LogOut size={14} />
            Log Out Staff Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px] pb-20 lg:pb-0">
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 rounded-md bg-brand-100 flex items-center justify-center text-xs font-serif font-black text-brand-700 overflow-hidden shrink-0">
              {restaurant.logo && (restaurant.logo.startsWith('http') || restaurant.logo.startsWith('data:') || restaurant.logo.startsWith('/')) ? (
                <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span>{restaurant.name ? restaurant.name.charAt(0).toUpperCase() : 'M'}</span>
              )}
            </div>
            <h1 className="text-xs font-bold text-surface-900 truncate">{restaurant.name} Admin</h1>
          </div>
          <div className="hidden lg:block text-lg font-bold text-surface-900">
            {tabs.find(t => t.id === activeTab)?.label}
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="#/"
              className="flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 gap-1 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 transition-colors"
            >
              <span className="hidden sm:inline">View Live Menu</span>
              <ExternalLink size={14} />
            </a>
            <button
              onClick={logout}
              className="lg:hidden p-1.5 text-surface-400 hover:text-red-500 rounded-lg"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex justify-around p-1.5 z-20 safe-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-1.5 min-w-[48px] rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-brand-600 bg-brand-50' : 'text-surface-400'
            }`}
          >
            {tab.icon}
            <span className="text-[9px] mt-0.5 font-medium leading-tight">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminDashboard;
