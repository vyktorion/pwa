'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Proprietar' as const,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Nume este obligatoriu';
    if (!formData.email.trim()) return 'Email este obligatoriu';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Email invalid';
    if (formData.password.length < 6) return 'Parola trebuie să aibă cel puțin 6 caractere';
    if (formData.password !== formData.confirmPassword) return 'Parolele nu se potrivesc';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Eroare de validare",
        description: validationError,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Cont creat cu succes!",
          description: "Veți fi redirecționat către pagina de autentificare...",
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Eroare la înregistrare",
          description: data.message || 'A apărut o eroare la înregistrare',
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "A apărut o eroare. Încercați din nou.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary/15 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Bine ați venit la Imob
          </h2>
          <p className="text-muted-foreground text-lg">
            Creați-vă contul și începeți să explorați proprietățile imobiliare
          </p>
        </div>
        <div className="bg-card/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-border/30">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-3">
                Nume
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-5 py-4 border border-input rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                placeholder="Numele tău complet"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-3">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-5 py-4 border border-input rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                placeholder="email@exemplu.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Rol
              </label>
              <Select value={formData.role} onValueChange={(value: string) => setFormData({ ...formData, role: value as typeof formData.role })}>
                <SelectTrigger className="w-full px-5 py-4 border border-input rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 backdrop-blur-sm">
                  <SelectValue placeholder="Selectează rolul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proprietar">Proprietar</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Agenție">Agenție</SelectItem>
                  <SelectItem value="Dezvoltator">Dezvoltator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Parolă
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="mt-1 block w-full px-3 py-2 pr-12 border border-input rounded-md shadow-sm placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Parola ta"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirmă parola
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="mt-1 block w-full px-3 py-2 pr-12 border border-input rounded-md shadow-sm placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Confirmă parola"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Se înregistrează...
                </div>
              ) : (
                'Înregistrează-te'
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Aveți deja cont? <span className="font-semibold">Autentificați-vă</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}