"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { UserButton, useAuth } from "@clerk/nextjs";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-[#86868B]';
  const hoverTextColor = 'text-[#1D1D1F]';
  const textSizeClass = 'text-[13px] font-black uppercase tracking-[0.2em]';

  return (
    <Link href={href} className="group relative inline-flex items-center overflow-hidden h-[40px] px-2">
      <div className="flex flex-col transition-transform duration-500 ease-out transform group-hover:-translate-y-[40px] h-[80px]">
        <div className={`h-[40px] flex items-center justify-center ${textSizeClass} ${defaultTextColor}`}>
          {children}
        </div>
        <div className={`h-[40px] flex items-center justify-center ${textSizeClass} ${hoverTextColor}`}>
          {children}
        </div>
      </div>
    </Link>
  );
};

export function MiniNavbar() {
  const { isLoaded, userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-2xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const navLinksData = [
    { label: 'Analyze', href: '/analyze' },
    { label: 'Generator', href: '/kit' },
  ];

  const AuthActions = () => {
    if (!isLoaded) return <div className="w-20 h-8 bg-black/5 animate-pulse rounded-full" />;

    if (userId) {
      return (
        <div className="flex items-center gap-8">
          <Link href="/analyze" className="text-[13px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] hover:text-primary transition-colors hidden sm:block">
            Dashboard
          </Link>
          <UserButton 
            appearance={{ 
              elements: { 
                userButtonAvatarBox: "w-10 h-10 border border-black/5 hover:border-black/10 transition-all shadow-lg" 
              } 
            }} 
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-8 md:gap-12">
        <Link href="/sign-in" className="text-[15px] font-black text-[#86868B] uppercase tracking-[0.25em] hover:text-[#1D1D1F] transition-colors">
          Log In
        </Link>
        <Link href="/sign-up" className="inline-flex items-center justify-center rounded-full bg-black px-10 py-4 text-[15px] font-black uppercase tracking-[0.25em] text-white shadow-2xl hover:bg-black/90 transition-all hover:scale-105 active:scale-95">
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 pointer-events-none">
      <div className="pointer-events-auto">
        <Link href="/" className="transition-transform hover:scale-105 active:scale-95 block">
          <div className="relative h-[60px] flex items-center">
            <Image 
              src="/rifair-logo.png" 
              alt="Rifair AI" 
              width={240}
              height={60}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      <header className={`pointer-events-auto
                         flex flex-col items-center
                         pl-8 pr-8 h-20 backdrop-blur-3xl justify-center
                         ${headerShapeClass}
                         border border-black/[0.03] bg-white/70
                         shadow-[0_8px_40px_rgba(0,0,0,0.04)]
                         w-[calc(100%-2rem)] sm:w-auto
                         transition-all duration-500 ease-in-out`}>

        <div className="flex items-center justify-between w-full gap-x-8 sm:gap-x-16">
          <nav className="hidden sm:flex items-center space-x-12">
            {navLinksData.map((link) => (
              <AnimatedNavLink key={link.href} href={link.href}>
                {link.label}
              </AnimatedNavLink>
            ))}
          </nav>

          <div className="hidden sm:flex items-center">
            <AuthActions />
          </div>

          <button className="sm:hidden flex items-center justify-center w-8 h-8 text-[#1D1D1F] focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
            {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
            )}
          </button>
        </div>

        <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-500 overflow-hidden
                         ${isOpen ? 'max-h-[1000px] opacity-100 pt-8 pb-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
          <nav className="flex flex-col items-center space-y-8 text-base w-full">
            {navLinksData.map((link) => (
              <Link key={link.href} href={link.href} className="text-[13px] font-black text-[#86868B] uppercase tracking-[0.2em] hover:text-[#1D1D1F] transition-colors w-full text-center" onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col items-center space-y-6 mt-10 w-full px-4 border-t border-black/[0.03] pt-10">
            <AuthActions />
          </div>
        </div>
      </header>
    </div>
  );
}
