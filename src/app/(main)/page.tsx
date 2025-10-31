'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Property } from "@/types";
import { PropertyService } from "@/services/property.service";
import { truncateText } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured properties on component mount
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const result = await PropertyService.searchProperties({
          limit: 8,
          sortBy: 'newest'
        });
        setProperties(result.properties);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/sale?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = '/sale';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'EUR': '€',
      'RON': 'lei',
      'USD': '$',
      '€': '€',
      '$': '$',
      'lei': 'lei'
    };

    const symbol = currencySymbols[currency] || 'lei';

    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 0,
    }).format(price) + ' ' + symbol;
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))] dark:from-[hsl(var(--card))] dark:to-[hsl(var(--background))] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Caută în București, Cluj, Timișoara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 py-3 text-lg rounded-full border-2 border-[hsl(var(--border))] focus:border-[hsl(var(--ring))]"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-5 h-5" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSearch}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] rounded-full"
            >
              Caută
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 rounded-full"
            >
              <Link href="/sale/post" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adaugă 
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-3xl mx-auto">
            • • • • •
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.slice(0, 8).map((property) => (
                <Link
                  key={property._id}
                  href={`/sale/properties/${property._id}`}
                  className="group"
                >
                  <div className="bg-[hsl(var(--card))] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={property.images[0] || '/placeholder-property.jpg'}
                        alt={property.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {/* Gradient pentru vizibilitate */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>
                      <div className="absolute top-3 right-3 bg-primary text-background px-2 text-sm font-semibold rounded-xl">
                        {formatPrice(property.price, property.currency)}
                      </div>
                    </div>
                    <div className="bg-card p-4">
                      <h3 className="font-semibold text-primary-foreground mb-2 truncate hover:text-primary transition-colors cursor-pointer">
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
              ))}
            </div>
          )}

          {properties.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild variant="outline" 
              className="rounded-xl py-1">
                <Link href="/sale">Vezi Toate Proprietățile</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


