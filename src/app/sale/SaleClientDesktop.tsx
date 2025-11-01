import Link from "next/link";
import Image from "next/image";
import { Grid3X3, List, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/types";
import { truncateText, formatPrice } from "@/lib/utils";
import { getRelativeTime } from "@/lib/time";

interface SaleClientDesktopProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  properties: Property[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export default function SaleClientDesktop({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  properties,
  viewMode,
  setViewMode
}: SaleClientDesktopProps) {
  return (
    <>
      <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <h2 className="text-2xl font-bold text-foreground">Anunțuri</h2>
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Caută în rezultate..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 text-base"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sortare:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
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
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border-0 rounded-lg p-1 bg-muted/50">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {properties.map((property, propertyIndex) => {
          if (viewMode === 'grid') {
            return (
              <Link key={property._id} href={`/sale/properties/${property._id}`} className="block">
                <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={property.images[0] || "/placeholder-image.jpg"}
                      alt={property.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      priority={propertyIndex < 5}
                      loading={propertyIndex < 5 ? "eager" : "lazy"}
                    />
                    {/* Gradient pentru vizibilitate */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-primary text-secondary px-2 text-sm font-medium">
                      {formatPrice(property.price)} {property.currency}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 truncate hover:text-primary transition-colors cursor-pointer">
                      {truncateText(property.title, 35)}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm truncate">{truncateText(`${property.location.city}, ${property.location.county}${property.location.zone ? `, ${property.location.zone}` : ''}`, 40)}</span>
                    </div>
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
              </Link>
            );
          } else {
            return (
              <Link key={property._id} href={`/sale/properties/${property._id}`} className="block">
                <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-80 h-48 relative overflow-hidden rounded">
                      <Image
                        src={property.images[0] || "/placeholder-image.jpg"}
                        alt={property.title}
                        width={288}
                        height={192}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        priority={propertyIndex < 6}
                        loading={propertyIndex < 6 ? "eager" : "lazy"}
                      />
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                        {property.price} {property.currency}
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="font-semibold text-foreground text-xl mb-1 sm:mb-0 hover:text-primary transition-colors cursor-pointer truncate">
                          {truncateText(property.title, 55)}
                        </h3>
                              <div className="text-xl font-bold text-primary">
                                {property.price} {property.currency}
                              </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">{property.location.city}, {property.location.county}{property.location.zone ? `, ${property.location.zone}` : ''}</span>
                      </div>
                      <div className="grid grid-cols-4 text-sm text-muted-foreground mb-4 gap-1">
                        <span className="text-center">{property.rooms ? `${property.rooms} camere` : property.propertyType}</span>
                        <span className="text-center">{property.area} mp</span>
                        <span className="text-center">
                          {property.floor && property.totalFloors ? `Etaj ${property.floor}/${property.totalFloors}` : new Date(property.createdAt).toLocaleDateString('ro-RO')}
                        </span>
                        <span className="text-center">{property.yearBuilt || (property.features.length > 0 ? `${property.features.length} fac.` : '')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 lg:w-3/4">
                        {property.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground -mt-1">
                          <span>Contact: {property.contactInfo.name}</span>
                          {property.contactInfo.showPhone && (
                            <span>• {property.contactInfo.phone}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{getRelativeTime(property.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }
        })}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Încarcă mai multe anunțuri
        </button>
      </div>
    </>
  );
}