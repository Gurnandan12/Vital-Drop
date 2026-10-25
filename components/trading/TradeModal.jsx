'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePortfolio } from '@/hooks/usePortfolio';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

/**
 * TradeModal — Controlled Buy & Sell Order Form
 * Demonstrates:
 * - Forms and controlled components
 * - Form validation and instantaneous visual feedback
 * - State management (lifting state up / passing callbacks)
 * - Hooks: useState, useEffect, useRef, useMemo
 * - ES6+ destructuring, template literals, calculation logic
 * - Accessibility basics (labels, ARIA, focus handling)
 */
export function TradeModal({
  isOpen,
  onClose,
  stock,
  initialAction = 'BUY',
  isDark = true,
}) {
  const { balance, getHolding, buyStock, sellStock } = usePortfolio();

  // Controlled form state
  const [action, setAction] = useState(initialAction); // 'BUY' | 'SELL'
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' | 'LIMIT'
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useRef for auto-focusing the quantity input
  const quantityInputRef = useRef(null);

  const holding = stock ? getHolding(stock.symbol) : null;
  const currentPrice = stock?.currentPrice || stock?.price || 1000;

  // Auto-focus quantity input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        quantityInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Derived execution price using useMemo
  const executionPrice = useMemo(() => {
    if (orderType === 'LIMIT') {
      const parsed = parseFloat(limitPrice);
      return !isNaN(parsed) && parsed > 0 ? parsed : currentPrice;
    }
    return currentPrice;
  }, [orderType, limitPrice, currentPrice]);

  // Computed totals & validation
  const parsedQty = parseInt(quantity, 10) || 0;
  const grossTotal = parsedQty * executionPrice;
  const estimatedCharges = grossTotal * 0.001; // 0.1% STT/Exchange charges
  const netTotal = action === 'BUY' ? grossTotal + estimatedCharges : grossTotal - estimatedCharges;

  // Validation logic
  const validationError = useMemo(() => {
    if (parsedQty <= 0) {
      return 'Quantity must be at least 1 share.';
    }
    if (action === 'BUY' && netTotal > balance) {
      return `Insufficient funds. Needed: ₹${netTotal.toFixed(2)}, Available: ₹${balance.toFixed(2)}`;
    }
    if (action === 'SELL' && (!holding || holding.quantity < parsedQty)) {
      const owned = holding ? holding.quantity : 0;
      return `Insufficient holdings. You only hold ${owned} share(s) of ${stock?.symbol}.`;
    }
    return null;
  }, [parsedQty, action, netTotal, balance, holding, stock?.symbol]);

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (validationError) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      let result;
      if (action === 'BUY') {
        result = buyStock(
          {
            symbol: stock.symbol,
            name: stock.name || stock.shortName || stock.symbol,
            exchange: stock.exchange || 'NSE',
            sector: stock.sector || 'General',
          },
          parsedQty,
          executionPrice
        );
      } else {
        result = sellStock(
          {
            symbol: stock.symbol,
            name: stock.name || stock.shortName || stock.symbol,
          },
          parsedQty,
          executionPrice
        );
      }

      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: result.message });
        setIsSubmitting(false);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Trade execution failed.' });
      setIsSubmitting(false);
    }
  };

  if (!stock) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Terminal — ${stock.symbol}`}
      isDark={isDark}
      maxWidth="max-w-md"
    >
      {/* Stock Summary Header */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-white/[0.02] border-white/8' : 'bg-gray-50 border-gray-100'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">{stock.symbol}</span>
            <Badge variant={stock.symbol.endsWith('.BO') ? 'bse' : 'nse'}>
              {stock.symbol.endsWith('.BO') ? 'BSE' : 'NSE'}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{stock.name || stock.shortName}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-extrabold">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-xs text-violet-400">Live Market Price</span>
        </div>
      </div>

      {/* Available Balance & Holdings Info */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className={`p-3 rounded-xl border flex items-center gap-2 ${
          isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50 border-gray-100'
        }`}>
          <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="truncate">
            <p className="text-gray-400">Cash Available</p>
            <p className="font-bold text-emerald-400">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-2 ${
          isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50 border-gray-100'
        }`}>
          <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="truncate">
            <p className="text-gray-400">Owned Shares</p>
            <p className="font-bold text-blue-400">{holding ? holding.quantity : 0} shares</p>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── CONTROLLED FORM ── */}
      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* Buy / Sell Action Switch */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Action Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setAction('BUY')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                action === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              BUY / LONG
            </button>
            <button
              type="button"
              onClick={() => setAction('SELL')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                action === 'SELL'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SELL / SHORT
            </button>
          </div>
        </div>

        {/* Order Type: Market vs Limit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="order-type" className="block text-xs font-semibold text-gray-400 mb-1">
              Order Type
            </label>
            <select
              id="order-type"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-xs font-semibold text-gray-400 mb-1">
              Quantity (Shares)
            </label>
            <input
              ref={quantityInputRef}
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10"
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
        </div>

        {/* Limit Price Input if Limit Order is selected */}
        {orderType === 'LIMIT' && (
          <div>
            <label htmlFor="limit-price" className="block text-xs font-semibold text-gray-400 mb-1">
              Limit Price (₹)
            </label>
            <input
              id="limit-price"
              type="number"
              step="0.05"
              min="0.05"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
        )}

        {/* Order Breakdown / Financial Calculation Summary */}
        <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
          isDark ? 'bg-white/[0.02] border-white/6 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
          <div className="flex justify-between">
            <span>Gross Order Value:</span>
            <span className="font-semibold">₹{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Est. STT &amp; Taxes (0.1%):</span>
            <span>₹{estimatedCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-bold pt-1.5 border-t border-white/10 text-sm">
            <span>Net Payable / Receivable:</span>
            <span className={action === 'BUY' ? 'text-violet-400' : 'text-emerald-400'}>
              ₹{netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Live Validation Alert */}
        {validationError && (
          <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError}</span>
          </p>
        )}

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            className="w-1/3"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant={action === 'BUY' ? 'primary' : 'danger'}
            size="md"
            className="w-2/3"
            disabled={Boolean(validationError) || isSubmitting}
            isLoading={isSubmitting}
          >
            Confirm {action === 'BUY' ? 'Buy Order' : 'Sell Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TradeModal;
