"use client";

import Link from "next/link";
import { useState } from "react";

import { UserDropdown } from "./UserDropdown";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useIsMobile } from "../../hooks/use-mobile";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const navLinks = (
    <>
      <Link className="hover:text-primary hover:underline" href="/">
        Home
      </Link>
      <Link
        className="hover:text-primary hover:underline"
        href="/dashboard"
      >
        Dashboard
      </Link>
    </>
  );

  return (
    <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-5">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            Slow<span className="text-primary">Website</span>
          </h1>
        </Link>
        {!isMobile && (
          <div className="flex items-center gap-4">
            {navLinks}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!isMobile && (
          <>
            <UserDropdown />
            <div className="flex items-center gap-4">
              Login
              Register
            </div>
          </>
        )}

        {isMobile && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex flex-col gap-4">
                  {navLinks}
                </div>
                <div className="flex flex-col gap-4">
                  <UserDropdown />
                  <div className="flex items-center gap-4">
                    Login
                    Register
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
}
