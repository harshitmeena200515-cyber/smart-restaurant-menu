import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowLeft, ExternalLink, Leaf, Award, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import useMenuStore from '../store/menuStore';
import mittiCover from '../assets/mitti-farms-main.jpg';

const AboutPage = () => {
  const restaurant = useMenuStore((s) => s.restaurant);

  return (
    <div className="min-h-screen bg-surface-50 max-w-2xl mx-auto shadow-xl pb-12">
      {/* Header Banner */}
      <div className="relative bg-surface-900 text-white overflow-hidden">
        {/* Main Photo Banner from Google Maps */}
        <div className="h-64 sm:h-72 w-full relative">
          <img
            src={mittiCover}
            alt="Mitti Farms - Farmstay & Chulha Bistro"
            className="w-full h-full object-cover brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-black/30" />
        </div>

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/20 z-10"
          aria-label="Back to menu"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Title over Banner */}
        <div className="absolute bottom-5 left-5 right-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-sm mb-2 shadow-sm">
            <Leaf size={13} />
            <span>Farmstay & Organic Dining</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
            {restaurant.name}
          </h1>
          <p className="text-emerald-300 text-sm font-semibold tracking-wide mt-0.5">
            {restaurant.subname || 'Chulha Bistro & Eco Farmstay'}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-6 -mt-3 relative z-10">
        {/* Status Pill & Tagline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-surface-500 font-medium">Dining Status</p>
            <p className="text-sm font-bold text-surface-900 flex items-center gap-2 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${restaurant.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {restaurant.isOpen ? 'Open Today · Welcoming Guests' : 'Currently Closed'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-brand-50 text-brand-700 font-bold px-3 py-1.5 rounded-full border border-brand-100">
              {restaurant.tagline}
            </span>
          </div>
        </div>

        {/* About Property */}
        <section className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-surface-900 font-bold text-lg">
            <span className="text-2xl">🌱</span>
            <h2>About Mitti Farms</h2>
          </div>
          <p className="text-surface-600 text-sm leading-relaxed">
            {restaurant.description}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-100 text-center">
            <div className="p-2 rounded-xl bg-surface-50">
              <span className="block text-base">🌾</span>
              <span className="text-[11px] font-bold text-surface-700">100% Organic</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-50">
              <span className="block text-base">🔥</span>
              <span className="text-[11px] font-bold text-surface-700">Chulha Cooked</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-50">
              <span className="block text-base">🏡</span>
              <span className="text-[11px] font-bold text-surface-700">Eco Farmstay</span>
            </div>
          </div>
        </section>

        {/* Featured Photo Section (Direct Google Maps Photo) */}
        <section className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <Compass size={18} className="text-brand-600" />
              Real Location & Ambience
            </h2>
            <span className="text-[11px] text-surface-400 font-medium">Bikaipur, Bihar</span>
          </div>
          
          <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-inner group">
            <img
              src={mittiCover}
              alt="Mitti Farms Campus"
              className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="text-xs text-surface-500 italic text-center">
            Peaceful rural atmosphere along the Gaya–Rajgir scenic corridor.
          </p>
        </section>

        {/* Contact, Timings & Location Details */}
        <section className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-surface-900 border-b border-surface-100 pb-2">
            Visit & Contact Details
          </h2>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-50 text-brand-700 rounded-xl mt-0.5">
              <MapPin size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Address</p>
              <p className="text-sm font-semibold text-surface-900 mt-0.5 leading-snug">
                {restaurant.address}
              </p>
              <p className="text-xs text-surface-500 mt-1">
                Near Rajgir–Gaya Buddhist Circuit (Atari–Jethian Road)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl mt-0.5">
              <Phone size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Direct Phone / Orders</p>
              <a
                href={`tel:${restaurant.phone}`}
                className="text-sm font-bold text-brand-600 hover:text-brand-700 mt-0.5 block"
              >
                {restaurant.phone}
              </a>
              <span className="text-[11px] text-surface-400">Available for table reservations and food queries</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl mt-0.5">
              <Clock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Kitchen & Bistro Hours</p>
              <div className="text-sm text-surface-800 mt-0.5 space-y-0.5 font-medium">
                <p>Monday – Friday: <span className="font-semibold text-surface-900">{restaurant.hours.weekdays}</span></p>
                <p>Saturday – Sunday: <span className="font-semibold text-surface-900">{restaurant.hours.weekends}</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-brand-500/20"
          >
            <ArrowLeft size={16} />
            Explore Digital Menu
          </Link>
          <a
            href={`tel:${restaurant.phone}`}
            className="btn-outline flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Phone size={16} />
            Call Restaurant
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
