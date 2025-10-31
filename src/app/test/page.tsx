'use client';

import { useState } from "react";

const TABS = [
  { label: "Detalii", key: "details" },
  { label: "Fotografii", key: "photos" },
  { label: "Contact", key: "contact" },
];

export default function TestPage() {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="min-h-screen bg-[#f8f6f5] flex flex-col items-center py-4">
      <div className="w-[420px] bg-[#f8f6f5] flex flex-col items-center">
        <div className="w-full bg-white rounded-xl shadow-lg border border-[#f2eaea] p-4">
          {/* Top section: property type, transaction type, title*/}
          <div className="bg-[#f8f6f5] rounded-xl p-4 mb-4">
            {/* Property type buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl bg-white text-[#3b82f6] font-semibold text-xs shadow-sm">
                <span className="w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 7.5L6.5 10L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Apartament
              </button>
              <button className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border border-[#eaf0fa] bg-white text-[#bdbdbd] font-semibold text-xs shadow-sm">
                <span className="inline-block w-5 h-5 bg-[#eaf0fa] rounded-full" />
                Casă
              </button>
              <button className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border border-[#eaf0fa] bg-white text-[#bdbdbd] font-semibold text-xs shadow-sm">
                <span className="inline-block w-5 h-5 bg-[#eaf0fa] rounded-full" />
                Teren
              </button>
              <button className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border border-[#eaf0fa] bg-white text-[#bdbdbd] font-semibold text-xs shadow-sm">
                <span className="inline-block w-5 h-5 bg-[#eaf0fa] rounded-full" />
                Spațiu comercial
              </button>
            </div>
            {/* Transaction type */}
            <div className="flex gap-4 mb-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#3b82f6] font-semibold text-xs shadow-sm">
                <span className="w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 7.5L6.5 10L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                De vânzare
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#bdbdbd] font-semibold text-xs border border-[#eaf0fa]">
                <span className="w-3 h-3 rounded-full bg-[#eaf0fa] inline-block" />
                De închiriat
              </button>
            </div>
            {/* Title input */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1 text-[#bdbdbd]">Titlu anunț</label>
              <div className="flex items-center border border-[#eaf0fa] rounded-lg bg-white px-3 py-2">
                <input className="flex-1 text-xs bg-transparent outline-none" placeholder="Titlu anunț" maxLength={80} />
                <span className="text-xs text-[#bdbdbd]">80 car.</span>
              </div>
            </div>
            {/* Upload photo */}
            <div className="mb-2">
              <div className="bg-white border border-[#eaf0fa] rounded-lg p-3 flex flex-col items-start gap-2">
                <span className="text-[#3b82f6] text-xs font-semibold cursor-pointer">+ Încarcă o fotografie</span>
                <span className="text-xs text-[#bdbdbd]">sau drag and drop</span>
                <span className="text-xs text-[#bdbdbd]">Maxim 16 poze. Formate acceptate: PNG, JPG. Dimensiune maxima 10MB</span>
              </div>
            </div>
          </div>
          {/* Tabs replicare screenshot */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border border-[#eaf0fa] transition-colors duration-150 ${
                    activeTab === tab.key
                      ? "bg-[#eaf0fa] text-[#3b82f6]"
                      : "bg-white text-[#bdbdbd]"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#bdbdbd]">●</span>
          </div>
          {/* ...restul formularului... */}
          <form className="space-y-2">
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Tip proprietate</label>
              <select className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]">
                <option>Apartament</option>
                <option>Casă</option>
                <option>Teren</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Titlu anunț</label>
              <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="Titlu anunț" />
            </div>
            <div className="flex gap-2 items-center mb-2">
              <div className="w-32 h-16 bg-[#eaf0fa] rounded-lg flex items-center justify-center overflow-hidden border border-[#eaf0fa]">
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" alt="preview" className="object-cover w-full h-full" />
              </div>
              <button className="px-3 py-2 rounded-lg bg-[#eaf0fa] text-[#3b82f6] text-xs font-semibold border border-[#eaf0fa]">Adaugă foto</button>
            </div>
            <div className="flex gap-2 justify-center mb-2">
              <button className="w-8 h-8 rounded-full bg-white text-[#bdbdbd] font-bold border border-[#eaf0fa]">1</button>
              <button className="w-8 h-8 rounded-full bg-white text-[#bdbdbd] font-bold border border-[#eaf0fa]">2</button>
              <button className="w-8 h-8 rounded-full bg-[#eaf0fa] text-[#3b82f6] font-bold border border-[#eaf0fa]">3</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Camere</label>
                <select className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Compartimentare</label>
                <select className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]">
                  <option>Decomandat</option>
                  <option>Semi-decomandat</option>
                  <option>Nedecomandat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Etaj</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="Etaj" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Preț</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="Preț" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Suprafață utilă</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="mp" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">An construcție</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="An construcție" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Stare imobil</label>
                <select className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]">
                  <option>Nou</option>
                  <option>Renovat</option>
                  <option>Necesită renovare</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Locație</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="Locație" />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Descriere</label>
              <textarea className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" rows={3} placeholder="Descriere" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Email</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="Email" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#d94f4f]">Telefon</label>
                <input className="w-full border border-[#eaf0fa] rounded-lg px-3 py-2 text-xs bg-[#f8f6f5]" placeholder="Telefon" />
              </div>
            </div>
            <button type="submit" className="w-full mt-2 py-3 rounded-lg bg-[#d94f4f] text-white font-bold text-base">CONTINUĂ</button>
          </form>
        </div>
      </div>
    </div>
  );
}
