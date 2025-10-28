export type UserRole = "Proprietar" | "Agent" | "Agenție" | "Dezvoltator";

export type PropertyType = "Apartament" | "Casă" | "Teren" | "Birouri" | "Spații comerciale" | "Garaj";

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    city: string;
    county: string;
    zone?: string;
    address?: string;
  };
  propertyType: PropertyType;
  rooms?: number;
  bathrooms?: number;
  area: number; // in mp
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  features: string[];
  images: string[];
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
    showPhone: boolean;
    avatar?: string | null;
    role?: string;
  };
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  hashedPassword?: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: [string, string]; // user IDs
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  messages?: Message[];
  lastMessage?: Message;
  unreadCount: number;
  messageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      avatar?: string | null;
      phone?: string | null;
      role?: string | null;
    };
  }

  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    role?: string | null;
    phone?: string | null;
  }
}