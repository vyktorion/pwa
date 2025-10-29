'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import ProfileClientDesktop from './ProfileClientDesktop';
import ProfileClientMobile from './ProfileClientMobile';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  image?: string;
  role: string;
}

interface Property {
  _id: string;
  title: string;
  images: string[];
  price: number;
  currency: string;
  location: {
    city: string;
    county: string;
    zone?: string;
  };
  rooms?: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  features: string[];
  propertyType: string;
  createdAt: Date | string;
  isActive: boolean;
}

interface ProfileClientProps {
  user: User;
  userProperties: Property[];
}

export default function ProfileClient({ user, userProperties }: ProfileClientProps) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <ProfileClientMobile user={user} userProperties={userProperties} />
  ) : (
    <ProfileClientDesktop user={user} userProperties={userProperties} />
  );
}