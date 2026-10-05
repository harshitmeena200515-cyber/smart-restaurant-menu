import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowLeft, ExternalLink, Leaf, Award, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import useMenuStore from '../store/menuStore';
import mittiCover from '../assets/mitti-farms-main.jpg';

const AboutPage = () => {
  const restaurant = useMenuStore((s) => s.restaurant);
  return (
    <div className="min-h-screen bg-surface-50 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto shadow-xl pb-16 transition-all">
      {/* Header Banner */}
      <div className="relative bg-surface-900 text-white overflow-hidden">
        {/* Main Photo Banner from Google Maps */}
        <div className="h-64 sm:h-72 md:h-80 lg:h-96 w-full relative">
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
          className="absolute top-4 left-4 md:top-6 md:left-6 p-2.5 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/20 z-10"
          aria-label="Back to menu"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Title over Banner */}
        <div className="absolute bottom-5 left-5 right-5 md:bottom-8 md:left-8 md:right-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-emerald-500/90 text-white backdrop-blur-sm mb-2 shadow-sm">
            <Leaf size={14} />
            <span>Farmstay & Organic Dining</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
            {restaurant.name}
          </h1>
          <p className="text-emerald-300 text-sm md:text-base font-semibold tracking-wide mt-1">
            {restaurant.subname || 'Chulha Bistro & Eco Farmstay'}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 md:p-8 space-y-6 md:space-y-8 -mt-4 relative z-10">
        {/* Status Pill & Tagline */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-surface-500 font-medium">Dining Status</p>
            <p className="text-sm md:text-base font-bold text-surface-900 flex items-center gap-2 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${restaurant.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {restaurant.isOpen ? 'Open Today · Welcoming Guests' : 'Currently Closed'}
            </p>
          </div>
          <div className="self-start sm:self-center">
            <span className="text-xs md:text-sm bg-brand-50 text-brand-700 font-bold px-3.5 py-1.5 rounded-full border border-brand-100">
              {restaurant.tagline}
            </span>
          </div>
        </div>

        {/* About Property */}
        <section className="bg-white rounded-2xl p-5 md:p-7 border border-surface-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-surface-900 font-bold text-lg md:text-xl">
            <span className="text-2xl md:text-3xl">🌱</span>
            <h2>About Mitti Farms</h2>
          </div>
          <p className="text-surface-600 text-sm md:text-base leading-relaxed">
            {restaurant.description}
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-4 pt-3 border-t border-surface-100 text-center">
            <div className="p-3 md:p-4 rounded-xl bg-surface-50">
              <span className="block text-xl md:text-2xl mb-1">🌾</span>
              <span className="text-xs md:text-sm font-bold text-surface-700">100% Organic</span>
            </div>
            <div className="p-3 md:p-4 rounded-xl bg-surface-50">
              <span className="block text-xl md:text-2xl mb-1">🔥</span>
              <span className="text-xs md:text-sm font-bold text-surface-700">Chulha Cooked</span>
            </div>
            <div className="p-3 md:p-4 rounded-xl bg-surface-50">
              <span className="block text-xl md:text-2xl mb-1">🏡</span>
              <span className="text-xs md:text-sm font-bold text-surface-700">Eco Farmstay</span>
            </div>
          </div>
        </section>

        {/* Featured Photo Section (Direct Google Maps Photo) */}
        <section className="bg-white rounded-2xl p-5 md:p-7 border border-surface-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-surface-900 flex items-center gap-2">
              <Compass size={20} className="text-brand-600" />
              Real Location & Ambience
            </h2>
            <span className="text-xs md:text-sm text-surface-400 font-medium">Bikaipur, Bihar</span>
          </div>
          
          <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-inner group">
            <img
              src={mittiCover}
              alt="Mitti Farms Campus"
              className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="text-xs md:text-sm text-surface-500 italic text-center">
            Peaceful rural atmosphere along the Gaya–Rajgir scenic corridor.
          </p>
        </section>

        {/* Contact, Timings & Location Details - 3 Column Grid on Desktop */}
        <section className="bg-white rounded-2xl p-5 md:p-7 border border-surface-100 shadow-sm space-y-5">
          <h2 className="text-base md:text-lg font-bold text-surface-900 border-b border-surface-100 pb-3">
            Visit & Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface-50/70 border border-surface-100">
              <div className="p-2.5 bg-brand-50 text-brand-700 rounded-xl mt-0.5 shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Address</p>
                <p className="text-sm font-semibold text-surface-900 mt-1 leading-snug">
                  {restaurant.address}
                </p>
                <p className="text-xs text-surface-500 mt-1">
                  Near Rajgir–Gaya Buddhist Circuit
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface-50/70 border border-surface-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl mt-0.5 shrink-0">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Direct Phone</p>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700 mt-1 block"
                >
                  {restaurant.phone}
                </a>
                <span className="text-xs text-surface-400">Reservations & queries</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-surface-50/70 border border-surface-100">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl mt-0.5 shrink-0">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Kitchen Hours</p>
                <div className="text-sm text-surface-800 mt-1 space-y-0.5 font-medium">
                  <p>Mon – Fri: <span className="font-semibold text-surface-900">{restaurant.hours.weekdays}</span></p>
                  <p>Sat – Sun: <span className="font-semibold text-surface-900">{restaurant.hours.weekends}</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Link
            to="/"
            className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-sm md:text-base font-bold shadow-md shadow-brand-500/20"
          >
            <ArrowLeft size={18} />
            Explore Digital Menu
          </Link>
          <a
            href={`tel:${restaurant.phone}`}
            className="btn-outline flex-1 py-3.5 flex items-center justify-center gap-2 text-sm md:text-base font-bold"
          >
            <Phone size={18} />
            Call Restaurant
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
