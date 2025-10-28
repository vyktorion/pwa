'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Modal Root Component
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [open, handleEscape]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {children}
      </div>
    </div>,
    document.body
  );
}

// Modal Content Component
interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full text-card-foreground border border-border shadow-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto",
        className
      )}
      style={{ backgroundColor: 'hsl(var(--card))' }}
      {...props}
    >
      {children}
    </div>
  )
);
ModalContent.displayName = 'ModalContent';

// Modal Header Component
interface ModalHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalHeader({ className, children }: ModalHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
}

// Modal Footer Component
interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2", className)}>
      {children}
    </div>
  );
}

// Modal Title Component
interface ModalTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalTitle({ className, children }: ModalTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

// Modal Description Component
interface ModalDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalDescription({ className, children }: ModalDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

// Modal Close Button
interface ModalCloseProps {
  className?: string;
  onClick?: () => void;
}

export function ModalClose({ className, onClick }: ModalCloseProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}