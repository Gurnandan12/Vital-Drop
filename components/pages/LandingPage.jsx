'use client';
import React from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DemoPreviewSection } from '@/components/landing/DemoPreviewSection';
import { Footer } from '@/components/landing/Footer';

/**
 * LandingPage — Preserves 100% of existing Vital Drop landing UI & visual identity
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080814] text-gray-50 selection:bg-violet-500/30">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoPreviewSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
