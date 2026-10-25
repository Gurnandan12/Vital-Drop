'use client';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AppLayout } from './layout/AppLayout';
import { DashboardLayout } from './layout/DashboardLayout';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { DashboardActivity } from './pages/DashboardActivity';
import { MarketPage } from './pages/MarketPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { RiskAnalyzerPage } from './pages/RiskAnalyzerPage';
import { RiskSandboxPage } from './pages/RiskSandboxPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { BasketPage } from './pages/BasketPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * AppRouter — Master Single Page Application Routing Tree
 *
 * Demonstrates:
 * - 18. React Router (BrowserRouter, Routes, Route)
 * - 19. Nested routes (/dashboard with overview & activity)
 * - 20. Dynamic routes (/stock/:symbol)
 * - 21. Route parameters (useParams in StockDetailPage)
 * - 22. Protected routes (<ProtectedRoute>)
 * - 23. 404 page (/* catch-all)
 * - 24. Navigation layout / page structure (<AppLayout>, <Sidebar>, <Navbar>, <MobileNavigation>)
 * - 25. Multi-page SPA design (zero full page reloads, browser history support)
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing route (preserves full landing design with own header/footer) */}
        <Route path="/" element={<LandingPage />} />

        {/* Core Application Shell with shared AppLayout (Sidebar + Navbar + Content + Footer) */}
        <Route element={<AppLayout />}>
          {/* Nested Investment Dashboard Routes */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="activity" element={<DashboardActivity />} />
          </Route>

          {/* Quick alias for /overview */}
          <Route path="overview" element={<Navigate to="/dashboard/overview" replace />} />

          {/* Dedicated Risk Analyzer Page */}
          <Route path="risk-analyzer" element={<RiskAnalyzerPage />} />

          {/* Dedicated What-If Risk Sandbox Page */}
          <Route path="risk-sandbox" element={<RiskSandboxPage />} />
          <Route path="what-if" element={<RiskSandboxPage />} />

          {/* Dedicated Watchlist Page */}
          <Route path="watchlist" element={<WatchlistPage />} />

          {/* Investment Basket & Thematic Portfolio Page */}
          <Route path="basket" element={<BasketPage />} />

          {/* Market Stock Directory */}
          <Route path="market" element={<MarketPage />} />

          {/* Dynamic Stock Details Page with :symbol parameter */}
          <Route path="stock/:symbol" element={<StockDetailPage />} />

          {/* Community Leaderboard */}
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Protected Routes */}
          <Route
            path="portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Authentication Pages */}
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />

          {/* Backwards compatibility for /simulator */}
          <Route path="simulator" element={<Navigate to="/dashboard/overview" replace />} />

          {/* 404 Custom Error Route for unknown paths */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
