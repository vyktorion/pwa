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

  // Funcție pentru căutare și sortare - optimizată pentru instant search
  const handleSearch = useCallback(async (isInitialLoad = false) => {
    console.log('🔍 SaleClient: Starting search with params:', {
      isInitialLoad,
      searchQuery,
      currentPage
    });

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

      console.log('📡 HomeClient: Calling PropertyService with params:', params);
      const result = await PropertyService.searchProperties(params);
      console.log('✅ HomeClient: Received result:', result);

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

      {/* Footer simplificat */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground mb-2">Imob</p>
            <p className="text-sm">Platforma imobiliară modernă • © 2025 Imob</p>
          </div>
        </div>
      </footer>
    </div>
  );
}