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

interface ProfileClientDesktopProps {
  user: User;
  userProperties: Property[];
}

export default function ProfileClientDesktop({ user, userProperties }: ProfileClientDesktopProps) {
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
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden mb-6">
            <div className="bg-linear-to-r from-primary/10 to-primary/5 px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                  {(user.avatar || user.image) ? (
                    <Image
                      src={user.avatar ? user.avatar : user.image ? user.image : ""}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover"
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHBhdGggZD0iTTQwIDQwSDU2VjU2SDQwVjQwWk0zMiAzMkg0OFY0OEgzMloiIGZpbGw9IiM5Y2E0YjAiLz4KPC9zdmc+"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{user.name}</h1>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {user.role === 'Proprietar' ? 'Proprietar' :
                          user.role === 'Agent' ? 'Agent imobiliar' :
                            user.role === 'Agenție' ? 'Agenție imobiliară' : 'Dezvoltator'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-4 py-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Deconectare
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-border mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-6 py-3 font-medium transition-colors cursor-pointer ${activeTab === 'properties'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Anunturile mele ({userProperties.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-medium transition-colors cursor-pointer ${activeTab === 'profile'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Informații personale
              </button>
            </div>

          </div>

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              {/* Properties Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Proprietățile mele</h2>
                <Button asChild variant="default" className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold">
                  <Link href="/sale/post" className="flex items-center gap-2 rounded-xl cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Adaugă proprietate</span>
                  </Link>
                </Button>
              </div>

              {/* Properties Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Home className="w-8 h-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{userProperties.length}</div>
                        <div className="text-sm text-muted-foreground">Proprietăți</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Eye className="w-8 h-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">Vizualizări</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-8 h-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">Favorite</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Properties List */}
              {userProperties.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nicio proprietate adăugată</h3>
                    <p className="text-muted-foreground mb-4">
                      Nu ai adăugat încă nicio proprietate. Începe prin a adăuga prima proprietate.
                    </p>
                    <Button asChild>
                      <Link href="/sale/post" className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Adaugă prima proprietate
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userProperties.map((property) => (
                    <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-64 h-40 relative">
                          <Image
                            src={property.images[0] || "/placeholder-image.jpg"}
                            alt={property.title}
                            width={256}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant={property.isActive ? "default" : "secondary"} className={property.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                              {property.isActive ? "Activ" : "Inactiv"}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="flex-1 p-2">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="mb-2 sm:mb-0">
                              <h3 className="text-xl font-semibold mb-1 hover:text-primary transition-colors cursor-pointer">
                                <Link href={`/sale/properties/${property._id}`}>
                                  {truncateText(property.title, 55)}
                                </Link>
                              </h3>
                              <div className="flex items-center gap-1 text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm truncate">{truncateText(`${property.location.city}, ${property.location.county}${property.location.zone ? `, ${property.location.zone}` : ''}`, 50)}</span>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-2xl font-bold text-primary">
                                {property.price} {property.currency}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center text-sm text-muted-foreground">
                               <div>{property.rooms ? `${property.rooms} camere` : property.propertyType}</div>
                               <div>{property.area} mp</div>
                               <div>{property.floor && property.totalFloors ? `Etaj ${property.floor}/${property.totalFloors}` : new Date(property.createdAt).toLocaleDateString('ro-RO')}</div>
                               <div>{property.yearBuilt || (property.features.length > 0 ? `${property.features.length} fac.` : '')}</div>
                           </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Postat {new Date(property.createdAt).toLocaleDateString('ro-RO')}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold cursor-pointer"
                              >
                                <Link href={`/sale/properties/${property._id}`} className="flex items-center gap-2 cursor-pointer">
                                  <Eye className="w-4 h-4" />
                                  <span>Vezi</span>
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold cursor-pointer"
                              >
                                <Link href={`/sale/promote/${property._id}`} className="flex items-center gap-2 cursor-pointer">
                                  <Star className="w-4 h-4" />
                                  <span>Promovează</span>
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold cursor-pointer"
                              >
                                <Link href={`/sale/edit/${property._id}`} className="flex items-center gap-2 cursor-pointer">
                                  <Edit className="w-4 h-4" />
                                  <span>Editează</span>
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPropertyToDelete(property);
                                  setShowDeletePropertyDialog(true);
                                }}
                                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-4 py-2 font-semibold cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Șterge
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

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informații personale
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nume complet</label>
                    <p className="text-foreground font-medium">{user.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Adresă email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Număr de telefon</label>
                    <p className="text-foreground">{user.phone || 'Nu este setat'}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Rol în platformă</label>
                    <p className="text-foreground">
                      {user.role === 'Proprietar' ? 'Proprietar' :
                        user.role === 'Agent' ? 'Agent imobiliar' :
                          user.role === 'Agenție' ? 'Agenție imobiliară' : 'Dezvoltator'}
                    </p>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-medium text-foreground mb-4">Acțiuni</h3>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      variant="default"
                      onClick={() => setShowEditDialog(true)}
                      className="flex items-center justify-center gap-3 h-12 bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
                    >
                      <Edit className="w-5 h-5" />
                      <span className="font-medium">Editează info</span>
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setShowChangePasswordDialog(true)}
                      className="flex items-center justify-center gap-3 h-12 flex-1 sm:flex-none"
                    >
                      <Lock className="w-5 h-5" />
                      <span className="font-medium">Schimbă parola</span>
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center justify-center gap-3 h-12 flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="font-medium">Șterge contul</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Property Dialog */}
          <Dialog open={showDeletePropertyDialog} onOpenChange={setShowDeletePropertyDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Ștergere proprietate
                </DialogTitle>
                <DialogDescription className="text-base">
                  Sunteți sigur că doriți să ştergeți proprietatea &quot;{propertyToDelete?.title}&quot;?
                  Această acțiune nu poate fi anulată.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeletePropertyDialog(false)}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Anulează
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProperty}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Șterge proprietatea
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Profile Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[425px] overflow-x-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Editează info
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex justify-center py-4 border-b border-border/50">
                  <FileUpload
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
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
                      className="w-full px-4 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
                      className="w-full px-4 py-3 border border-input rounded-lg bg-muted cursor-not-allowed text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-phone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone className="w-4 h-4" />
                      Număr de telefon
                    </label>
                    <input
                      type="tel"
                      id="edit-phone"
                      name="phone"
                      defaultValue={user.phone || ''}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Shield className="w-4 h-4" />
                      Rol în platformă
                    </label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-full px-4 py-3 h-auto">
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

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Se salvează...' : 'Salvează'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Change Password Dialog */}
          <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
            <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[425px] overflow-x-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Schimbă parola
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleChangePassword} className="space-y-6">
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
                      className="w-full px-4 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
                      className="w-full px-4 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
                      className="w-full px-4 py-3 border border-input rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Confirmă parola nouă"
                    />
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowChangePasswordDialog(false)}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {saving ? 'Se schimbă...' : 'Schimbă parola'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirm Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Ștergere cont permanentă
                </DialogTitle>
                <DialogDescription className="text-base">
                  Sunteți sigur că doriți să ștergeți definitiv acest cont? Această acțiune este ireversibilă și va duce la pierderea tuturor datelor dumneavoastră, inclusiv:
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Toate informațiile personale</li>
                  <li>• Istoric de activitate</li>
                  <li>• Proprietăți salvate</li>
                  <li>• Setări și preferințe</li>
                </ul>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Anulează
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Șterge definitiv contul
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}