'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, X, Plus, MapPin, Home, Building, Wrench, Save } from 'lucide-react';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PropertyService } from '@/services/property.service';
import { PropertyType } from '@/types';

// Predefined features
const availableFeatures = [
  'Balcon', 'Terasă', 'Grădină', 'Garaj', 'Parcare', 'Centrală termică',
  'Aer condiționat', 'Mobilat', 'Geamuri termopan', 'Sistem alarmă',
  'Ascensor', 'Interfon', 'Conexiune internet', 'Cablu TV'
];

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  // UploadThing hook for property images
  const { startUpload: startImageUpload, isUploading: isImageUploadingUT } = useUploadThing('propertyImageUploader', {
    onClientUploadComplete: (res) => {
      if (res) {
        const uploadedUrls = res.map((file) => file.url);
        // Replace the instant previews with actual uploaded URLs
        setImages(prev => {
          const instantPreviews = prev.slice(0, prev.length - uploadedUrls.length);
          return [...instantPreviews, ...uploadedUrls].slice(0, 10);
        });
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      // Remove failed instant previews
      setImages(prev => prev.filter(url => !url.startsWith('blob:')));
      alert('Eroare la încărcarea imaginii: ' + error.message);
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: '€' as '€' | 'RON',
    propertyType: '' as PropertyType,
    rooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    yearBuilt: '',
    location: {
      city: '',
      county: '',
      zone: '',
      address: ''
    }
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState<{
    name: string;
    phone: string;
    email: string;
    showPhone: boolean;
    avatar: string | null;
    role: string;
  }>({
    name: '',
    phone: '',
    email: '',
    showPhone: true,
    avatar: null,
    role: ''
  });

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const property = await PropertyService.getPropertyById(propertyId);
        if (property) {
          setFormData({
            title: property.title,
            description: property.description,
            price: property.price.toString(),
            currency: property.currency as '€' | 'RON',
            propertyType: property.propertyType,
            rooms: property.rooms?.toString() || '',
            bathrooms: property.bathrooms?.toString() || '',
            area: property.area.toString(),
            floor: property.floor?.toString() || '',
            totalFloors: property.totalFloors?.toString() || '',
            yearBuilt: property.yearBuilt?.toString() || '',
            location: {
              city: property.location.city,
              county: property.location.county,
              zone: property.location.zone || '',
              address: property.location.address || ''
            }
          });
          setSelectedFeatures(property.features || []);
          setImages(property.images || []);
          setContactInfo({
            name: property.contactInfo.name,
            phone: property.contactInfo.phone,
            email: property.contactInfo.email || '',
            showPhone: property.contactInfo.showPhone,
            avatar: property.contactInfo.avatar || null,
            role: property.contactInfo.role || ''
          });
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Eroare la încărcarea proprietății');
        router.push('/profile');
      } finally {
        setFetchLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

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

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate files
      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          alert(`Fișierul ${file.name} nu este o imagine validă`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`Imaginea ${file.name} este prea mare (maxim 10MB)`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        // Check if adding these would exceed the 10 image limit
        const totalImages = images.length + validFiles.length;
        if (totalImages > 10) {
          alert(`Poți încărca maxim 10 imagini. Ai selectat ${validFiles.length} imagini, dar ai deja ${images.length}.`);
          return;
        }

        // Add instant previews for immediate visual feedback
        const instantPreviews = validFiles.map(file => ({
          file,
          preview: URL.createObjectURL(file),
          status: 'uploading' as const
        }));

        // Update state with instant previews
        setImages(prev => [...prev, ...instantPreviews.map(item => item.preview)]);

        // Start upload without resizing for speed
        await startImageUpload(validFiles);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Titlul este obligatoriu';
    if (!formData.description.trim()) return 'Descrierea este obligatorie';
    if (!formData.price || isNaN(Number(formData.price))) return 'Prețul trebuie să fie un număr valid';
    if (!formData.propertyType) return 'Tipul proprietății este obligatoriu';
    if (!formData.location.city.trim()) return 'Orașul este obligatoriu';
    if (!formData.location.county.trim()) return 'Județul este obligatoriu';
    if (!formData.area || isNaN(Number(formData.area))) return 'Suprafața trebuie să fie un număr valid';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      setLoading(false);
      return;
    }

    try {
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        rooms: formData.rooms ? Number(formData.rooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        area: Number(formData.area),
        floor: formData.floor ? Number(formData.floor) : undefined,
        totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        features: selectedFeatures,
        images,
        contactInfo,
        userId: session?.user?.id || '',
        isActive: true
      };

      await PropertyService.updateProperty(propertyId, propertyData);
      alert('Anunțul a fost actualizat cu succes!');
      router.push('/profile');
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Eroare la actualizarea anunțului. Încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi
            </Button>
            <h1 className="text-2xl font-bold">Editează anunțul</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Informații de bază
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titlu anunț *</label>
                    <Input
                      placeholder="ex: Apartament 3 camere, zona Unirii"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tip proprietate *</label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartament">Apartament</SelectItem>
                        <SelectItem value="Casă">Casă</SelectItem>
                        <SelectItem value="Teren">Teren</SelectItem>
                        <SelectItem value="Birouri">Birouri</SelectItem>
                        <SelectItem value="Spații comerciale">Spații comerciale</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Suprafață (mp) *</label>
                    <Input
                      type="number"
                      placeholder="75"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Camere</label>
                    <Input
                      type="number"
                      placeholder="3"
                      value={formData.rooms}
                      onChange={(e) => handleInputChange('rooms', e.target.value)}
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
                  <label className="text-sm font-medium">Adresă completă (opțional)</label>
                  <Input
                    placeholder="Strada Ion Brezoianu nr. 12, bloc A3, etaj 5"
                    value={formData.location.address}
                    onChange={(e) => handleInputChange('location.address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Detalii proprietate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Etaj</label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.floor}
                      onChange={(e) => handleInputChange('floor', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Etaje clădire</label>
                    <Input
                      type="number"
                      placeholder="8"
                      value={formData.totalFloors}
                      onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">An construcție</label>
                    <Input
                      type="number"
                      placeholder="2020"
                      value={formData.yearBuilt}
                      onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                    />
                  </div>
                </div>

                {formData.propertyType !== 'Teren' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Băi</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Facilități
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                      className={`p-3 border rounded-lg text-sm transition-all ${
                        selectedFeatures.includes(feature)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
                {selectedFeatures.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
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
                  Imagini (maxim 10) {isImageUploadingUT && <span className="text-sm text-muted-foreground flex items-center gap-2">- <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div> Se încarcă...</span>}
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
                      <label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.accept = 'image/*';
                            input.onchange = (e) => void handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
                            input.click();
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Alege imagini
                        </Button>
                      </label>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Imagine ${index + 1}`}
                            width={400}
                            height={96}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Anulează
              </Button>
              <Button type="submit" disabled={loading} size="lg">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Se actualizează...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Actualizează anunțul
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}