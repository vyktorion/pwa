'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Home, Building, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const TRANSACTIONS = [
  { key: 'vanzare', label: 'De vânzare' },
  { key: 'inchiriere', label: 'De închiriat' },
  { key: 'hotelier', label: 'Regim hotelier' },
];

const PROPERTY_TYPES = [
  { key: 'apartament', label: 'Apartament' },
  { key: 'casa', label: 'Casă' },
  { key: 'teren', label: 'Teren' },
  { key: 'spatiu', label: 'Spațiu comercial' },
];

const availableFeatures = [
  'Balcon', 'Terasă', 'Grădină', 'Garaj', 'Parcare', 'Centrală termică',
  'Aer condiționat', 'Mobilat', 'Geamuri termopan', 'Sistem alarmă',
  'Ascensor', 'Interfon', 'Conexiune internet', 'Cablu TV', 'Wi-Fi', 'Mic dejun', 'Piscină'
];

export default function TestPage() {
  const [transactionType, setTransactionType] = useState<'vanzare'|'inchiriere'|'hotelier'>('vanzare');
  const [propertyType, setPropertyType] = useState<'apartament'|'casa'|'teren'|'spatiu'>('apartament');
  const [activeTab, setActiveTab] = useState<'details'|'photos'|'contact'>('details');

  const [formData, setFormData] = useState<any>({
    title: '', description: '', price: '', currency: '€',
    propertyType: '', rooms: '', bathrooms: '', area: '', floor: '', totalFloors: '', yearBuilt: '',
    location: { city: '', county: '', zone: '', address: '' },
    rentPeriod: '', deposit: '', pricePerNight: '', hotelRooms: '', services: ''
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '', showPhone: true });

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Înapoi
          </Button>
          <h1 className="text-2xl font-bold">Postează un anunț</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Transaction type */}
        <Card>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tip tranzacție</h3>
              <div className="flex gap-4">
                {TRANSACTIONS.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTransactionType(t.key as any)}
                    className={`px-4 py-2 rounded-full font-semibold text-xs border flex-1 text-center ${
                      transactionType === t.key ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property type */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Tip proprietate</h3>
              <div className="grid grid-cols-4 gap-2">
                {PROPERTY_TYPES.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPropertyType(p.key as any)}
                    className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl border text-xs font-semibold ${
                      propertyType === p.key ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${propertyType === p.key ? 'bg-green-500' : 'bg-primary'}`}>
                      {propertyType === p.key && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M4 7.5L6.5 10L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-4">
          {['details','photos','contact'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab === 'details' ? 'Detalii' : tab === 'photos' ? 'Fotografii' : 'Contact'}
            </button>
          ))}
        </div>

        <form className="space-y-8">
          {activeTab === 'details' && (
            <>
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" /> Informații de bază
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Titlu *</label>
                      <Input
                        placeholder="ex: Apartament 3 camere, zona Unirii"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tip proprietate *</label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(value) => handleInputChange('propertyType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează tipul" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map(p => <SelectItem key={p.key} value={p.label}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Descriere *</label>
                    <Textarea
                      rows={6}
                      placeholder="Descrie proprietatea..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>

                  {/* Conditional fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(transactionType !== 'hotelier') && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Preț *</label>
                          <div className="flex">
                            <Input
                              type="number"
                              placeholder="100000"
                              value={formData.price}
                              onChange={(e) => handleInputChange('price', e.target.value)}
                              className="rounded-r-none"
                              required
                            />
                            <Select value={formData.currency} onValueChange={(val) => handleInputChange('currency', val)}>
                              <SelectTrigger className="rounded-l-none w-20"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="€">€</SelectItem>
                                <SelectItem value="RON">RON</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Suprafață (mp) *</label>
                          <Input
                            type="number"
                            placeholder="75"
                            value={formData.area}
                            onChange={(e) => handleInputChange('area', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Camere</label>
                          <Input
                            type="number"
                            placeholder="3"
                            value={formData.rooms}
                            onChange={(e) => handleInputChange('rooms', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {transactionType === 'inchiriere' && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Chirie lunară</label>
                          <Input
                            type="number"
                            placeholder="1500"
                            value={formData.rentPeriod}
                            onChange={(e) => handleInputChange('rentPeriod', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Depozit</label>
                          <Input
                            type="number"
                            placeholder="1500"
                            value={formData.deposit}
                            onChange={(e) => handleInputChange('deposit', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {transactionType === 'hotelier' && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Preț pe noapte</label>
                          <Input
                            type="number"
                            placeholder="100"
                            value={formData.pricePerNight}
                            onChange={(e) => handleInputChange('pricePerNight', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Număr camere disponibile</label>
                          <Input
                            type="number"
                            placeholder="10"
                            value={formData.hotelRooms}
                            onChange={(e) => handleInputChange('hotelRooms', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Servicii incluse</label>
                          <Input
                            placeholder="Wi-Fi, Mic dejun, Piscină"
                            value={formData.services}
                            onChange={(e) => handleInputChange('services', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5"/> Locație</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Oraș *</label>
                    <Input value={formData.location.city} onChange={(e)=>handleInputChange('location.city', e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Județ *</label>
                    <Input value={formData.location.county} onChange={(e)=>handleInputChange('location.county', e.target.value)} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Adresă completă</label>
                    <Input value={formData.location.address} onChange={(e)=>handleInputChange('location.address', e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5"/> Facilități</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableFeatures.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={()=>handleFeatureToggle(f)}
                        className={`p-3 border rounded-lg text-sm transition-all ${
                          selectedFeatures.includes(f) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {selectedFeatures.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedFeatures.map(f=>(
                        <Badge key={f} variant="secondary">
                          {f}
                          <button type="button" onClick={()=>handleFeatureToggle(f)} className="ml-2 hover:text-destructive">
                            <X className="w-3 h-3"/>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'contact' && (
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Nume *</label>
                    <Input value={contactInfo.name} onChange={e=>setContactInfo(prev=>({...prev, name: e.target.value}))} required/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefon *</label>
                    <Input value={contactInfo.phone} onChange={e=>setContactInfo(prev=>({...prev, phone: e.target.value}))} required/>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input type="email" value={contactInfo.email} onChange={e=>setContactInfo(prev=>({...prev, email: e.target.value}))} required/>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="showPhone" checked={contactInfo.showPhone} onChange={e=>setContactInfo(prev=>({...prev, showPhone: e.target.checked}))} className="rounded"/>
                  <label htmlFor="showPhone" className="text-sm">Afișează numărul de telefon în anunț</label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">Anulează</Button>
            <Button type="submit" size="lg"><Plus className="w-4 h-4 mr-2"/> Postează anunțul</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
