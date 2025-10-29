'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { User, Phone, Mail, Shield, Save, Trash2, AlertTriangle, Edit, Lock, Home, Eye, Heart, MapPin, Plus, Star, LogOut } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { PropertyService } from '@/services/property.service';
import { truncateText } from "@/lib/utils";

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

interface ProfileClientMobileProps {
  user: User;
  userProperties: Property[];
}

export default function ProfileClientMobile({ user, userProperties }: ProfileClientMobileProps) {
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeletePropertyDialog, setShowDeletePropertyDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [role, setRole] = useState(user.role);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'properties'>('properties');
  const { toast } = useToast();

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const updateData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      role: role,
      avatar: avatarUrl || undefined,
    };

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "Succes",
          description: "Profil actualizat cu succes!",
        });
        window.location.reload();
        setShowEditDialog(false);
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Eroare",
          description: errorData.message || 'Eroare la actualizarea profilului',
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la actualizarea profilului",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (response.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Eroare la ștergerea contului",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la ștergerea contului",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      await PropertyService.deleteProperty(propertyToDelete._id);
      toast({
        title: "Succes",
        description: "Proprietatea a fost ștearsă",
      });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la ștergerea proprietății",
      });
    } finally {
      setShowDeletePropertyDialog(false);
      setPropertyToDelete(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Parolele noi nu se potrivesc",
      });
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Parola nouă trebuie să aibă cel puțin 6 caractere",
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succes",
          description: "Parola a fost schimbată!",
        });
        setShowChangePasswordDialog(false);
        e.currentTarget.reset();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Eroare",
          description: errorData.message || 'Eroare la schimbarea parolei',
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la schimbarea parolei",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 md:hidden">
      <div className="px-4 py-6">
        {/* Profile Header Card - Mobile Optimized */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden mb-6">
          <div className="bg-linear-to-r from-primary/10 to-primary/5 px-4 py-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                {(user.avatar || user.image) ? (
                  <Image
                    src={user.avatar ? user.avatar : user.image ? user.image : ""}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHBhdGggZD0iTTQwIDQwSDU2VjU2SDQwVjQwWk0zMiAzMkg0OFY0OEgzMloiIGZpbGw9IiM5Y2E0YjAiLz4KPC9zdmc+"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <div className="text-center w-full">
                <h1 className="text-2xl font-bold text-foreground mb-1">{user.name}</h1>
                <p className="text-muted-foreground text-sm mb-2">{user.email}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {user.role === 'Proprietar' ? 'Proprietar' :
                      user.role === 'Agent' ? 'Agent imobiliar' :
                        user.role === 'Agenție' ? 'Agenție imobiliară' : 'Dezvoltator'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg px-4 py-2 font-semibold cursor-pointer text-sm w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Deconectare</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
        <div className="flex border-b border-border mb-6 rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'properties'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Proprietăți ({userProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Profil
          </button>
        </div>


        {/* Properties Tab - Mobile Optimized */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* Properties Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Proprietățile mele</h2>
              <Button asChild variant="default" size="sm" className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold">
                <Link href="/sale/post" className="flex items-center gap-2 rounded-xl cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Adaugă</span>
                </Link>
              </Button>
            </div>

            {/* Properties Stats - Mobile Grid */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3">
                <div className="text-center">
                  <Home className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">{userProperties.length}</div>
                  <div className="text-xs text-muted-foreground">Proprietăți</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <Eye className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">0</div>
                  <div className="text-xs text-muted-foreground">Vizualizări</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <Heart className="w-6 h-6 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">0</div>
                  <div className="text-xs text-muted-foreground">Favorite</div>
                </div>
              </Card>
            </div>

            {/* Properties List - Mobile Optimized */}
            {userProperties.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-base font-semibold mb-2">Nicio proprietate adăugată</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Nu ai adăugat încă nicio proprietate.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/sale/post" className="cursor-pointer text-sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Adaugă prima proprietate
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userProperties.map((property) => (
                  <Card key={property._id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-20 relative flex-shrink-0">
                        <Image
                          src={property.images[0] || "/placeholder-image.jpg"}
                          alt={property.title}
                          width={96}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1">
                          <Badge variant={property.isActive ? "default" : "secondary"} className={`${property.isActive ? "bg-green-500 hover:bg-green-600 text-xs px-1 py-0" : "text-xs px-1 py-0"}`}>
                            {property.isActive ? "Activ" : "Inactiv"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="flex-1 p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-semibold flex-1 pr-2">
                            <Link href={`/sale/properties/${property._id}`} className="hover:text-primary transition-colors">
                              {truncateText(property.title, 30)}
                            </Link>
                          </h3>
                          <div className="text-sm font-bold text-primary text-right">
                            {property.price} {property.currency}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="text-xs truncate">
                            {truncateText(`${property.location.city}, ${property.location.county}${property.location.zone ? `, ${property.location.zone}` : ''}`, 35)}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground mb-3">
                          <div className="text-center">{property.rooms ? `${property.rooms} cam.` : property.propertyType}</div>
                          <div className="text-center">{property.area} mp</div>
                          <div className="text-center">
                            {property.floor && property.totalFloors ? `${property.floor}/${property.totalFloors}` : new Date(property.createdAt).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-center">{property.yearBuilt || (property.features.length > 0 ? `${property.features.length}` : '')}</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(property.createdAt).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 w-7 p-0"
                            >
                              <Link href={`/sale/properties/${property._id}`}>
                                <Eye className="w-3 h-3" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 w-7 p-0"
                            >
                              <Link href={`/sale/promote/${property._id}`}>
                                <Star className="w-3 h-3" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 w-7 p-0"
                            >
                              <Link href={`/sale/edit/${property._id}`}>
                                <Edit className="w-3 h-3" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPropertyToDelete(property);
                                setShowDeletePropertyDialog(true);
                              }}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab - Mobile Optimized */}
        {activeTab === 'profile' && (
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Informații personale
              </h2>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <label className="text-sm text-muted-foreground">Nume complet</label>
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <label className="text-sm text-muted-foreground">Adresă email</label>
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <label className="text-sm text-muted-foreground">Număr telefon</label>
                  <span className="text-sm text-foreground">{user.phone || 'Nu este setat'}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <label className="text-sm text-muted-foreground">Rol în platformă</label>
                  <span className="text-sm text-foreground">
                    {user.role === 'Proprietar' ? 'Proprietar' :
                      user.role === 'Agent' ? 'Agent imobiliar' :
                        user.role === 'Agenție' ? 'Agenție imobiliară' : 'Dezvoltator'}
                  </span>
                </div>
              </div>

              {/* Account Actions - Mobile Stacked */}
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-base font-medium text-foreground mb-4">Acțiuni</h3>
                <div className="space-y-3">
                  <Button
                    variant="default"
                    onClick={() => setShowEditDialog(true)}
                    className="w-full flex items-center justify-center gap-3 h-11 bg-primary hover:bg-primary/90"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium">Editează info</span>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => setShowChangePasswordDialog(true)}
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Schimbă parola</span>
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full flex items-center justify-center gap-3 h-11"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Șterge contul</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Property Dialog */}
        <Dialog open={showDeletePropertyDialog} onOpenChange={setShowDeletePropertyDialog}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Ștergere proprietate
              </DialogTitle>
              <DialogDescription className="text-sm">
                Sunteți sigur că doriți să ştergeți proprietatea "{propertyToDelete?.title}"?
                Această acțiune nu poate fi anulată.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeletePropertyDialog(false)}
                className="w-full cursor-pointer"
              >
                Anulează
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProperty}
                className="w-full cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Șterge proprietatea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog - Mobile Optimized */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Edit className="w-4 h-4" />
                Editează info
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex justify-center py-3 border-b border-border/50">
                <FileUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  disabled={saving}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="w-4 h-4" />
                    Nume
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    defaultValue={user.name}
                    required
                    className="w-full px-3 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-email" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail className="w-4 h-4" />
                    Adresă email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    defaultValue={user.email}
                    readOnly
                    className="w-full px-3 py-3 border border-input rounded-lg bg-muted cursor-not-allowed text-muted-foreground text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-phone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="w-4 h-4" />
                    Număr telefon
                  </label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    defaultValue={user.phone || ''}
                    className="w-full px-3 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Shield className="w-4 h-4" />
                    Rol în platformă
                  </label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full px-3 py-3 h-auto text-base">
                      <SelectValue placeholder="Selectează rolul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proprietar">Proprietar</SelectItem>
                      <SelectItem value="Agent">Agent imobiliar</SelectItem>
                      <SelectItem value="Agenție">Agenție imobiliară</SelectItem>
                      <SelectItem value="Dezvoltator">Dezvoltator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="w-full cursor-pointer"
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Se salvează...' : 'Salvează'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog - Mobile Optimized */}
        <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
          <DialogContent className="mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-4 h-4" />
                Schimbă parola
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="w-4 h-4" />
                    Parola actuală
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    required
                    className="w-full px-3 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base"
                    placeholder="Introdu parola actuală"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="w-4 h-4" />
                    Parola nouă
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    required
                    minLength={6}
                    className="w-full px-3 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base"
                    placeholder="Introdu parola nouă"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="w-4 h-4" />
                    Confirmă parola nouă
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    minLength={6}
                    className="w-full px-3 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base"
                    placeholder="Confirmă parola nouă"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePasswordDialog(false)}
                  className="w-full cursor-pointer"
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {saving ? 'Se schimbă...' : 'Schimbă parola'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog - Mobile Optimized */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive text-lg">
                <AlertTriangle className="w-4 h-4" />
                Ștergere cont permanentă
              </DialogTitle>
              <DialogDescription className="text-sm">
                Sunteți sigur că doriți să ștergeți definitiv acest cont? Această acțiune este ireversibilă și va duce la pierderea tuturor datelor dumneavoastră, inclusiv:
              </DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Toate informațiile personale</li>
                <li>• Istoric de activitate</li>
                <li>• Proprietăți salvate</li>
                <li>• Setări și preferințe</li>
              </ul>
            </div>
            <DialogFooter className="flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full cursor-pointer"
              >
                Anulează
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="w-full cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Șterge definitiv contul
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}