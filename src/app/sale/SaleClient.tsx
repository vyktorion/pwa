'use client';

import { useState, useEffect, useCallback } from "react";
import { PropertyService } from "@/services/property.service";
import { Property } from "@/types";
import SaleClientDesktop from "./SaleClientDesktop";
import SaleClientMobile from "./SaleClientMobile";
import { useQuery } from '@tanstack/react-query';

interface SaleClientProps {
  initialProperties: Property[];
}

export default function SaleClient({ initialProperties }: SaleClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage] = useState(1);
  // Detect device type for default view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'list';
    }
    return 'list';
  });

  // Use React Query for properties with global caching
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties', searchQuery, sortBy, currentPage],
    queryFn: async () => {
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

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      return PropertyService.searchProperties(params);
    },
    initialData: initialProperties ? { properties: initialProperties, total: initialProperties.length, page: 1, totalPages: 1 } : undefined,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const properties = propertiesData?.properties || [];

  // React Query automatically handles refetching when query keys change
  // No need for manual useEffect anymore


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