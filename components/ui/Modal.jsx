'use client';
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Accessible Modal Dialog
 * Demonstrates:
 * - Component composition
 * - useEffect for ESC key listener & body scroll lock
 * - useRef for dialog container reference
 * - Accessibility basics (role="dialog", aria-modal="true", tab indexing)
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  isDark = true,
}) {
  const modalRef = useRef(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} rounded-3xl border p-6 sm:p-7 shadow-2xl transition-all z-10 animate-in zoom-in-95 ${
          isDark
            ? 'bg-[#0d0d1e] border-white/10 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]'
            : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          {title && (
            <h2 id="modal-title" className="text-xl font-bold tracking-tight">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 ml-auto"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
