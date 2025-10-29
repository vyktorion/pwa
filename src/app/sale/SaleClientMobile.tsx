import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/types";
import { truncateText, formatPrice } from "@/lib/utils";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback } from "react";

function getRelativeTime(date: Date | string) {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMs = now.getTime() - postDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return `azi ${postDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffInDays === 1) {
    return `ieri ${postDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffInDays < 7) {
    return postDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
  }
  return postDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
}

interface SaleClientMobileProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  properties: Property[];
  viewMode?: 'grid' | 'list';
}

// Image Carousel Component
function ImageCarousel({ images, alt, propertyIndex }: { images: string[], alt: string, propertyIndex: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    } else if (isRightSwipe && images.length > 1) {
      prevImage();
    }

    isDragging.current = false;
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">No image</span>
      </div>
    );
  }

  return (
    <div className="aspect-video relative overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full shrink-0">
            <Image
              src={image}
              alt={`${alt} ${index + 1}`}
              width={400}
              height={225}
              className="w-full h-full object-cover"
              priority={propertyIndex < 3 && index === 0}
              loading={propertyIndex < 3 ? "eager" : index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Gradient pentru vizibilitate */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent z-10"></div>
    </div>
  );
}

export default function SaleClientMobile({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  properties
}: SaleClientMobileProps) {
  return (
    <div className="md:hidden">
      {/* Search Bar și Sortare pe aceeași linie */}
      <div className="flex items-center gap-2 mb-8">
        <Input
          placeholder="Caută în rezultate..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="flex-1 h-12 text-base"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-52 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Cele mai noi</SelectItem>
            <SelectItem value="oldest">Cele mai vechi</SelectItem>
            <SelectItem value="price-low">Preț crescător</SelectItem>
            <SelectItem value="price-high">Preț descrescător</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, propertyIndex) => (
          <div key={property._id} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow relative">
            <ImageCarousel images={property.images} alt={property.title} propertyIndex={propertyIndex} />
            <div className="absolute top-3 right-3 bg-[hsl(var(--accent))] text-[hsl(var(--background))] px-2 py-1 rounded text-sm font-medium z-30">
              {formatPrice(property.price)} {property.currency}
            </div>
            <div className="p-4">
              <Link href={`/sale/properties/${property._id}`}>
                <h3 className="font-semibold text-foreground mb-2 truncate hover:text-primary transition-colors cursor-pointer">
                  {truncateText(property.title, 35)}
                </h3>
              </Link>
              <Link href={`/sale/properties/${property._id}`}>
                <div className="flex items-center gap-1 text-muted-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                  <MapPin className="w-3 h-3" />
                  <span className="text-sm truncate">{truncateText(`${property.location.city}, ${property.location.county}${property.location.zone ? `, ${property.location.zone}` : ''}`, 40)}</span>
                </div>
              </Link>
              <div className="grid grid-cols-4 text-sm text-muted-foreground mb-3 gap-1">
                <span className="text-center">{property.rooms ? `${property.rooms} camere` : property.propertyType}</span>
                <span className="text-center">{property.area} mp</span>
                <span className="text-center">
                  {property.floor && property.totalFloors ? `Etaj ${property.floor}/${property.totalFloors}` : new Date(property.createdAt).toLocaleDateString('ro-RO')}
                </span>
                <span className="text-center">{property.yearBuilt || (property.features.length > 0 ? `${property.features.length} fac.` : '')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-muted px-2 py-1 rounded-full">Comision 0%</span>
                <span className="text-xs text-muted-foreground">{getRelativeTime(property.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Încarcă mai multe anunțuri
        </button>
      </div>
    </div>
  );
}