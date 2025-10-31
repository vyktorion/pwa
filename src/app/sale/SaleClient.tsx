'use client';

import { useState, useEffect, useCallback } from "react";
import { PropertyService } from "@/services/property.service";
import { Property } from "@/types";
import SaleClientDesktop from "./SaleClientDesktop";
import SaleClientMobile from "./SaleClientMobile";

interface SaleClientProps {
  initialProperties: Property[];
}

export default function SaleClient({ initialProperties }: SaleClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [properties, setProperties] = useState<Property[]>(initialProperties || []);
  const [, setLoading] = useState(false);
  const [currentPage] = useState(1);
  // Detect device type for default view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'list';
    }
    return 'list';
  });

  // Funcție pentru căutare și sortare - optimizată cu cache pentru mobile
  const handleSearch = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) {
      setLoading(true);
    }

    try {
      const params: {
        q?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
      } = {
        page: currentPage,
        limit: 20,
        sortBy
      };

      // Filtru text
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      // Create cache key for mobile optimization
      const cacheKey = `search_${JSON.stringify(params)}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached && !isInitialLoad) {
        // Use cached data for instant response on mobile
        const cachedData = JSON.parse(cached);
        setProperties(cachedData.properties);
        setLoading(false);
        return;
      }

      const result = await PropertyService.searchProperties(params);

      // Cache results for 5 minutes on mobile
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        setTimeout(() => sessionStorage.removeItem(cacheKey), 5 * 60 * 1000);
      }

      // Folosește proprietățile direct din API - sortarea se face în DB
      setProperties(result.properties);

    } catch (error) {
      console.error('❌ HomeClient: Error searching properties:', error);
      alert('Eroare la încărcarea proprietăților. Încercați din nou.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, sortBy]);

  // Efect pentru căutare când filtrele se schimbă - instant search pentru text, debounce pentru alte filtre
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);


  return (
    <div className="min-h-screen bg-background">
      {/* Anunțuri populare */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <SaleClientDesktop
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              properties={properties}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>

          {/* Mobile Layout */}
          <div className="block md:hidden">
            <SaleClientMobile
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              properties={properties}
              viewMode={viewMode}
            />
          </div>
        </div>
      </section>
    </div>
  );
}