'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { RiskSandbox } from '../RiskSimulator/RiskSandbox';

/**
 * RiskSandboxPage — Dedicated Full Page Route (/risk-sandbox)
 * What-If Risk Sandbox & Educational Investment Planning Tool
 */
export function RiskSandboxPage() {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="What-If Risk Sandbox"
        description="Interactive investment-planning simulator with synchronized controls, live compound growth formulas, and multi-scenario risk dispersion modeling."
        badge="What-If Simulator"
        badgeVariant="violet"
        badgeIcon={Sparkles}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/risk-analyzer">
              <Button variant="secondary" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Risk Analyzer</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="primary" size="sm" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── Core Sandbox Engine ── */}
      <RiskSandbox />
    </div>
  );
}

export default RiskSandboxPage;
