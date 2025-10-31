'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Share2, Heart, Calendar, Ruler, Home, Bed, User, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalClose } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PropertyService } from '@/services/property.service';
import { Property } from '@/types';


export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [thumbnailOffset, setThumbnailOffset] = useState(0);
  const [, setPreloadedImages] = useState<Set<number>>(new Set());
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const { toast } = useToast();

  const propertyId = params.id as string;

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyData = await PropertyService.getPropertyById(propertyId);

        if (propertyData) {
          setProperty(propertyData);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, router]);

  // Preload all images after property loads (but after main image is displayed)
  useEffect(() => {
    if (property && property.images.length > 0) {
      const firstImageSrc = property.images[0];
      // Wait for first image to load, then preload all others
      preloadImage(firstImageSrc).then(() => {
        setPreloadedImages(prev => new Set([...prev, 0]));

        // Preload all remaining images in background
        const remainingImages = property.images.slice(1);
        remainingImages.forEach((imageSrc, index) => {
          preloadImage(imageSrc).then(() => {
            setPreloadedImages(prev => new Set([...prev, index + 1]));
          }).catch(() => {
            // Silently fail for preload errors
          });
        });
      }).catch(() => {
        // Silently fail if first image preload fails
      });
    }
  }, [property]);

  const handleSendMessage = async () => {
    if (!session?.user?.id || !property || !messageContent.trim()) {
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property._id,
          message: messageContent.trim(),
        }),
      });

      if (response.ok) {
        await response.json();
        toast({
          title: "Mesaj trimis cu succes!",
          description: "Poți verifica mesajele tale în secțiunea Mesaje.",
        });
        setShowMessageDialog(false);
        setMessageContent('');
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Eroare",
          description: errorData.message || "Eroare la trimiterea mesajului",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la trimiterea mesajului",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Preload image function
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };


  // Handle main image navigation and update thumbnail offset
  const handleImageNavigation = (newIndex: number) => {
    setSelectedImage(newIndex);

    // No need to preload adjacent images anymore since we preload all images

    // Calculate which group of 6 thumbnails should be visible
    // Center the selected image in the visible group when possible
    const totalImages = property?.images.length || 0;
    let newOffset = thumbnailOffset;

    if (newIndex < thumbnailOffset) {
      // Selected image is before current visible group
      newOffset = Math.max(0, Math.floor(newIndex / 6) * 6);
    } else if (newIndex >= thumbnailOffset + 6) {
      // Selected image is after current visible group
      const maxOffset = Math.max(0, totalImages - 6);
      newOffset = Math.min(maxOffset, Math.floor(newIndex / 6) * 6);
    }

    setThumbnailOffset(newOffset);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Nu a fost găsit ...</h1>
          <Button asChild>
            <Link href="/">Înapoi la anunțuri</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Distribuie
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                Favorite
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <div className="aspect-video w-full relative overflow-hidden rounded-lg">
                <Image
                  src={property.images[selectedImage] || property.images[0] || "/placeholder-image.jpg"}
                  alt={property.title}
                  width={800}
                  height={450}
                  priority={selectedImage === 0}
                  className="w-full h-full object-cover"
                />

                {/* Navigation arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation(selectedImage > 0 ? selectedImage - 1 : property.images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation(selectedImage < property.images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageNavigation(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            selectedImage === index ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {property.images.length > 1 && (
                <div className="p-4">
                  {/* Thumbnails Grid - Always shows 6 thumbnails horizontally */}
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 6 }, (_, i) => {
                      const imageIndex = thumbnailOffset + i;
                      const image = property.images[imageIndex];

                      if (!image) return null;

                      return (
                        <button
                          key={`${thumbnailOffset}-${i}`}
                          onClick={() => handleImageNavigation(imageIndex)}
                          className={`aspect-video overflow-hidden rounded-lg border-2 transition-all duration-200 relative ${
                            selectedImage === imageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
                          }`}
                        >
                          <Image
                            src={image || "/placeholder-image.jpg"}
                            alt={`${property.title} ${imageIndex + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                          {selectedImage === imageIndex && (
                            <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-1 text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location.city}, {property.location.county}</span>
                      {property.location.zone && (
                        <span className="ml-2">• {property.location.zone}</span>
                      )}
                      {property.location.address && (
                        <span className="ml-2">• {property.location.address}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {property.price} {property.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {property.propertyType === 'Apartament' ? 'chiria/lună' : 'preț'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Home className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">{property.rooms} camere</div>
                  </div>
                  <div className="text-center">
                    <Ruler className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">{property.area} mp</div>
                  </div>
                  <div className="text-center">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">{property.bathrooms} baie</div>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Etaj {property.floor}</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Descriere</h3>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </div>
                </div>

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Facilități</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium mb-2">Detalii imobil</h4>
                    <div className="space-y-1 text-sm">
                      <div>Tip proprietate: {property.propertyType}</div>
                      {property.yearBuilt && <div>An construcție: {property.yearBuilt}</div>}
                      {property.totalFloors && <div>Etaje clădire: {property.totalFloors}</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Data publicării</h4>
                    <div className="text-sm text-muted-foreground">
                      {new Date(property.createdAt).toLocaleDateString('ro-RO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contactează vânzătorul</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      {property.contactInfo.avatar ? (
                        <Image
                          src={property.contactInfo.avatar}
                          alt="Avatar proprietar"
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                  <h3 className="font-semibold">{property.contactInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">{property.contactInfo.role || 'Proprietar'}</p>
                </div>

                <div className="space-y-3">
                  {property.contactInfo.showPhone && (
                    <div className="relative">
                      {showPhoneNumber ? (
                        <Button className="w-full" size="lg">
                          <Phone className="w-4 h-4 mr-2" />
                          {property.contactInfo.phone}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          size="lg"
                          onClick={() => setShowPhoneNumber(true)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Afișează numărul
                        </Button>
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      if (!session?.user) {
                        router.push('/login');
                        return;
                      }
                      setShowMessageDialog(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Trimite mesaj
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Contactează direct proprietarul pentru mai multe informații
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Sumar</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pret:</span>
                    <span className="font-medium">{property.price} {property.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suprafață:</span>
                    <span>{property.area} mp</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Camere:</span>
                    <span>{property.rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Localizare:</span>
                    <span>{property.location.city}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <Modal open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <ModalContent className="max-w-[calc(100vw-1rem)] sm:max-w-[500px]">
          <ModalClose onClick={() => setShowMessageDialog(false)} />
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-foreground">
              <MessageCircle className="w-5 h-5 text-primary" />
              Trimite mesaj către vânzător
            </ModalTitle>
            <ModalDescription className="text-muted-foreground">
              Scrie un mesaj către proprietar pentru a afla mai multe detalii despre această proprietate.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 dark:bg-muted p-4 rounded-lg border border-border">
              <h4 className="font-medium mb-2 text-foreground">Proprietatea:</h4>
              <p className="text-sm text-muted-foreground">{property.title}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Mesajul tău
              </label>
              <Textarea
                id="message"
                placeholder="Salut, sunt interesat de această proprietate. Aș vrea să știu mai multe detalii..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="resize-none bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>

          <ModalFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMessageDialog(false)}
              className="w-full sm:w-auto border-border hover:bg-muted"
            >
              Anulează
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageContent.trim()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {sendingMessage ? 'Se trimite...' : 'Trimite mesaj'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}