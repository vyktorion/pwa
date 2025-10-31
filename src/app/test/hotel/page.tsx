'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, X, Plus, MapPin, Home, Building, Wrench, Eye, EyeOff, Bed, Wifi, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Hotel services
const hotelServices = [
  'Wi-Fi gratuit', 'Mic dejun inclus', 'Piscină', 'Saună', 'Jacuzzi', 'Spa',
  'Fitness center', 'Parcare gratuită', 'Room service', 'Recepție 24/7',
  'Curățenie zilnică', 'Schimb prosoape', 'Mini bar', 'Seif', 'TV cablu'
];

export default function HotelFormPage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerNight: '',
    currency: '€' as const,
    availableRooms: '',
    maxGuests: '',
    location: {
      city: '',
      county: '',
      zone: '',
      address: ''
    }
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    showPhone: true
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as Record<string, unknown>,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Regim hotelier</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Ascunde' : 'Preview'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Informații generale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titlu anunț *</label>
                    <Input
                      placeholder="ex: Apartament modern în centru"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preț pe noapte *</label>
                    <div className="flex">
                      <Input
                        type="number"
                        placeholder="50"
                        value={formData.pricePerNight}
                        onChange={(e) => handleInputChange('pricePerNight', e.target.value)}
                        className="rounded-r-none"
                        required
                      />
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger className="rounded-l-none w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="€">€</SelectItem>
                          <SelectItem value="RON">RON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descriere *</label>
                  <Textarea
                    placeholder="Descrie proprietatea în detaliu..."
                    rows={6}
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Număr camere disponibile *
                    </label>
                    <Input
                      type="number"
                      placeholder="2"
                      value={formData.availableRooms}
                      onChange={(e) => handleInputChange('availableRooms', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Număr maxim oaspeți</label>
                    <Input
                      type="number"
                      placeholder="4"
                      value={formData.maxGuests}
                      onChange={(e) => handleInputChange('maxGuests', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Locație
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Oraș *</label>
                    <Input
                      placeholder="București"
                      value={formData.location.city}
                      onChange={(e) => handleInputChange('location.city', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Județ *</label>
                    <Input
                      placeholder="Sector 3"
                      value={formData.location.county}
                      onChange={(e) => handleInputChange('location.county', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Zonă/Cartier (opțional)</label>
                  <Input
                    placeholder="Unirii, Dorobanți, Pipera etc."
                    value={formData.location.zone}
                    onChange={(e) => handleInputChange('location.zone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresă completă *</label>
                  <Input
                    placeholder="Strada Ion Brezoianu nr. 12, bloc A3, etaj 5"
                    value={formData.location.address}
                    onChange={(e) => handleInputChange('location.address', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Servicii incluse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {hotelServices.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`p-3 border rounded-lg text-sm transition-all ${
                        selectedServices.includes(service)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                        <button
                          type="button"
                          onClick={() => handleServiceToggle(service)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Imagini (maxim 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Trage și plasează imaginile aici sau
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Alege imagini
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nume *</label>
                    <Input
                      value={contactInfo.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefon *</label>
                    <Input
                      placeholder="0712345678"
                      value={contactInfo.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showPhone"
                    checked={contactInfo.showPhone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, showPhone: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="showPhone" className="text-sm">
                    Afișează numărul de telefon în anunț
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Anulează
              </Button>
              <Button type="submit" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Postează cazarea
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}