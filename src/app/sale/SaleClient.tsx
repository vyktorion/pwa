'use client';

import { useState } from "react";
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
  const [currentPage] = useState(1);
  // Detect device type for default view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'list';
    }
    return 'list';
  });

  const properties = initialProperties || [];

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