'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const TRANSACTIONS = [
  { key: 'sale', label: 'De vânzare', desc: 'Proprietăți pentru vânzare' },
  { key: 'rent', label: 'De închiriat', desc: 'Proprietăți pentru închiriere' },
  { key: 'hotel', label: 'Regim hotelier', desc: 'Închiriere pe termen scurt' },
];

const PROPERTY_TYPES = {
  sale: [
    { key: 'apartament', label: 'Apartament' },
    { key: 'casa', label: 'Casă/Vila' },
    { key: 'teren', label: 'Teren' },
    { key: 'spatiu', label: 'Spațiu comercial' },
  ],
  rent: [
    { key: 'casa', label: 'Casă/Vila' },
    { key: 'spatiu', label: 'Spațiu comercial' },
    { key: 'teren', label: 'Teren' },
    { key: 'apartament', label: 'Apartament' },
  ],
  hotel: [
    { key: 'apartament', label: 'Apartament' },
    { key: 'casa', label: 'Casă/Vila/Cabană' },
    { key: 'camera', label: 'Cameră' },
    { key: 'suite', label: 'Suite/Duplex' },
  ],
};

export default function TestPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const handleTransactionSelect = (transaction: string) => {
    setSelectedTransaction(transaction);
    setSelectedProperty(null); // Reset property selection when transaction changes
  };

  const handlePropertySelect = (property: string) => {
    setSelectedProperty(property);
  };

  const handleContinue = () => {
    if (selectedTransaction && selectedProperty && session) {
      router.push(`/test/${selectedTransaction}`);
    }
  };

  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Înapoi
            </button>
            <h1 className="text-2xl font-bold">Postează anunț</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Transaction Type Selection */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-6">Categorii</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRANSACTIONS.map((transaction) => (
                <button
                  key={transaction.key}
                  onClick={() => handleTransactionSelect(transaction.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTransaction === transaction.key
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${
                      transaction.key === 'sale' ? 'bg-green-500' :
                      transaction.key === 'rent' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    <h3 className="font-semibold">{transaction.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Property Type Selection */}
          {selectedTransaction && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROPERTY_TYPES[selectedTransaction as keyof typeof PROPERTY_TYPES].map((property) => (
                <button
                  key={property.key}
                  onClick={() => handlePropertySelect(property.key)}
                  className={`p-4 rounded-xl border-2 text-center transition-all bg-card ${
                    selectedProperty === property.key
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      selectedProperty === property.key ? 'bg-green-500' : 'bg-secondary'
                    }`}>
                      {selectedProperty === property.key && (
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{property.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            {isAuthenticated ? (
              <button
                onClick={handleContinue}
                disabled={!selectedTransaction || !selectedProperty}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                Continuă →
              </button>
            ) : (
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border max-w-md w-full text-center">
                <h3 className="text-lg font-semibold mb-2"></h3>
                <p className="text-muted-foreground mb-4">
                  Trebuie să te autentifici pentru a putea posta un anunț.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Autentifică-te
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
