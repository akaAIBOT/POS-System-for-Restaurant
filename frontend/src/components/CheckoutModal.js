import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { printReceipt, printKitchenOrder } from '../utils/printUtils';
import couponAPI from '../services/couponAPI';

export default function CheckoutModal({ cart, total, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [orderType, setOrderType] = useState('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [splitCount, setSplitCount] = useState(1);
  const [cardAmount, setCardAmount] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    loadDeliverySettings();
  }, []);

  const loadDeliverySettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/settings/delivery');
      const data = await response.json();
      setDeliverySettings(data);
    } catch (error) {
      console.error('Failed to load delivery settings');
    }
  };

  const deliveryFee = orderType === 'delivery' && deliverySettings
    ? (total >= deliverySettings.free_delivery_threshold ? 0 : deliverySettings.delivery_fee)
    : 0;

  const subtotal = total + deliveryFee - couponDiscount;
  const totalWithTip = subtotal + tipAmount;
  const finalTotal = totalWithTip;
  const perPersonAmount = totalWithTip / splitCount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Wprowadź kod kuponu');
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await couponAPI.validate(couponCode, total);
      const discount = response.discount_amount;
      setCouponDiscount(discount);
      setCouponApplied(true);
      toast.success(`Kupon zastosowany! Zniżka: ${discount.toFixed(2)} zł`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Nieprawidłowy kod kuponu');
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  const calculateTipPercent = (percent) => {
    const tip = subtotal * (percent / 100);
    setTipAmount(tip);
    setCustomTip('');
  };

  const handleCustomTip = (value) => {
    setCustomTip(value);
    const tip = parseFloat(value) || 0;
    setTipAmount(tip);
  };

  const handleCardAmountChange = (value) => {
    setCardAmount(value);
    const card = parseFloat(value) || 0;
    const remaining = Math.max(0, totalWithTip - card);
    setCashAmount(remaining > 0 ? remaining.toFixed(2) : '');
  };

  const handleCashAmountChange = (value) => {
    setCashAmount(value);
    const cash = parseFloat(value) || 0;
    const remaining = Math.max(0, totalWithTip - cash);
    setCardAmount(remaining > 0 ? remaining.toFixed(2) : '');
  };

  const getSplitPaymentTotal = () => {
    const card = parseFloat(cardAmount) || 0;
    const cash = parseFloat(cashAmount) || 0;
    return card + cash;
  };

  const isSplitPaymentValid = () => {
    if (paymentMethod !== 'split') return true;
    const splitTotal = getSplitPaymentTotal();
    return Math.abs(splitTotal - totalWithTip) < 0.01;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (orderType === 'dine_in' && !tableNumber) {
      toast.error(t('tableNumber') + ' jest wymagany');
      return;
    }
    if (orderType !== 'dine_in' && !customerName) {
      toast.error(t('customerName') + ' jest wymagany');
      return;
    }
    if (orderType !== 'dine_in' && !customerPhone) {
      toast.error(t('customerPhone') + ' jest wymagany');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      toast.error(t('deliveryAddress') + ' jest wymagany');
      return;
    }
    if (paymentMethod === 'split' && !isSplitPaymentValid()) {
      toast.error('Suma płatności kartą i gotówką musi być równa całkowitej kwocie');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        order_type: orderType,
        table_id: orderType === 'dine_in' && tableNumber ? parseInt(tableNumber) : null,
        items: cart.map(item => ({
          item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        notes: notes || null,
        customer_name: orderType !== 'dine_in' && customerName ? customerName : null,
        customer_phone: orderType !== 'dine_in' && customerPhone ? customerPhone : null,
        delivery_address: orderType === 'delivery' && deliveryAddress ? deliveryAddress : null,
        payment_method: paymentMethod,
        payment_status: 'paid',
        total_amount: finalTotal,
        tip_amount: tipAmount > 0 ? tipAmount : null,
        split_count: splitCount > 1 ? splitCount : null,
        coupon_code: couponApplied && couponCode ? couponCode : null,
        discount_amount: couponDiscount > 0 ? couponDiscount : null
      };

      // Add split payment details if applicable
      if (paymentMethod === 'split') {
        orderData.card_amount = parseFloat(cardAmount) || 0;
        orderData.cash_amount = parseFloat(cashAmount) || 0;
      }

      const response = await orderAPI.create(orderData);
      const createdOrder = response.data;

      // Mark coupon as used if applied
      if (couponApplied && couponCode) {
        try {
          await couponAPI.use(couponCode);
        } catch (err) {
          console.error('Failed to mark coupon as used:', err);
        }
      }
      
      // Dodajemy items do createdOrder do drukowania
      const orderForPrint = {
        ...createdOrder,
        items: cart.map(item => ({
          ...item,
          selectedAddons: item.selectedAddons || [],
          selectedParameters: item.selectedParameters || [],
          comment: item.comment || ''
        })),
        total_price: finalTotal,
        order_type: orderType === 'dine_in' ? 'namiejscu' : orderType === 'delivery' ? 'dostawa' : 'odbior'
      };
      
      toast.success(t('orderCreated'));

      // Automatycznie drukujemy zamówienie do kuchni
      setTimeout(() => {
        printKitchenOrder(orderForPrint);
      }, 300);

      // Pytamy o drukowanie paragonu dla klienta
      setTimeout(() => {
        if (window.confirm('Wydrukować paragon dla klienta?')) {
          printReceipt(orderForPrint, false);
        }
      }, 800);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.detail || t('orderError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{t('checkout')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('orderType')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  orderType === 'dine_in'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('dineIn')}
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  orderType === 'takeaway'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('takeaway')}
              </button>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  orderType === 'delivery'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('delivery')}
              </button>
            </div>
          </div>

          {/* Table Number for Dine-in */}
          {orderType === 'dine_in' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🍽️ {t('tableNumber')} *
              </label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="input"
                required
              >
                <option value="">Wybierz stolik</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Stolik {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer Info for Takeout/Delivery */}
          {orderType !== 'dine_in' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('customerName')} *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input"
                  placeholder="Imię i nazwisko"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('customerPhone')} *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input"
                  placeholder="+48 123 456 789"
                  required
                />
              </div>
            </>
          )}

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryAddress')} *
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="input"
                rows="3"
                placeholder="Ulica, numer domu, numer mieszkania"
                required
              />
            </div>
          )}

          {/* Tips Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Napiwek (opcjonalnie)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                type="button"
                onClick={() => calculateTipPercent(10)}
                className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                  Math.abs(tipAmount - subtotal * 0.10) < 0.01 && !customTip
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                10%
              </button>
              <button
                type="button"
                onClick={() => calculateTipPercent(15)}
                className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                  Math.abs(tipAmount - subtotal * 0.15) < 0.01 && !customTip
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                15%
              </button>
              <button
                type="button"
                onClick={() => calculateTipPercent(20)}
                className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                  Math.abs(tipAmount - subtotal * 0.20) < 0.01 && !customTip
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                20%
              </button>
              <button
                type="button"
                onClick={() => { setTipAmount(0); setCustomTip(''); }}
                className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                  tipAmount === 0
                    ? 'border-gray-400 bg-gray-50 text-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Brak
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customTip}
                onChange={(e) => handleCustomTip(e.target.value)}
                className="input flex-1"
                placeholder="Inna kwota napiwku"
              />
              <span className="text-gray-600 font-medium">zł</span>
            </div>
            {tipAmount > 0 && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Napiwek: {tipAmount.toFixed(2)} zł
              </div>
            )}
          </div>

          {/* Split Bill Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Podziel rachunek
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 font-bold text-xl"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800">{splitCount}</div>
                <div className="text-xs text-gray-500">osób</div>
              </div>
              <button
                type="button"
                onClick={() => setSplitCount(splitCount + 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 font-bold text-xl"
              >
                +
              </button>
            </div>
            {splitCount > 1 && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800 font-medium mb-1">
                  Kwota na osobę:
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {perPersonAmount.toFixed(2)} zł
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('paymentMethod')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💵 {t('cash')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💳 {t('card')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('split')}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  paymentMethod === 'split'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💳💵 Dzielona
              </button>
            </div>
          </div>

          {/* Split Payment Details */}
          {paymentMethod === 'split' && (
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                💳💵 Płatność dzielona
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    💳 Kwota kartą
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cardAmount}
                      onChange={(e) => handleCardAmountChange(e.target.value)}
                      className="input flex-1"
                      placeholder="0.00"
                    />
                    <span className="text-gray-700 font-medium">zł</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    💵 Kwota gotówką
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashAmount}
                      onChange={(e) => handleCashAmountChange(e.target.value)}
                      className="input flex-1"
                      placeholder="0.00"
                    />
                    <span className="text-gray-700 font-medium">zł</span>
                  </div>
                </div>
                <div className={`mt-3 p-3 rounded-lg border-2 ${
                  isSplitPaymentValid() 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Suma płatności:</span>
                    <span className={`text-lg font-bold ${
                      isSplitPaymentValid() ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {getSplitPaymentTotal().toFixed(2)} zł
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="font-medium text-gray-700">Do zapłaty:</span>
                    <span className="text-lg font-bold text-gray-800">
                      {totalWithTip.toFixed(2)} zł
                    </span>
                  </div>
                  {isSplitPaymentValid() ? (
                    <div className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                      <span>✓</span> Kwoty się zgadzają
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                      <span>✗</span> Suma musi być równa {totalWithTip.toFixed(2)} zł
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎟️ Kod Kuponu (opcjonalnie)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input flex-1 uppercase"
                placeholder="WEEKEND15"
                disabled={couponApplied}
              />
              {!couponApplied ? (
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {validatingCoupon ? '...' : 'Zastosuj'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Usuń
                </button>
              )}
            </div>
            {couponApplied && couponDiscount > 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold">Kupon zastosowany!</div>
                    <div className="text-sm">Zniżka: <span className="font-bold">{couponDiscount.toFixed(2)} zł</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows="2"
              placeholder="Dodatkowe uwagi..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Suma produktów:</span>
              <span>{total.toFixed(2)} zł</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>{t('deliveryFee')}:</span>
                <span>{deliveryFee.toFixed(2)} zł</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Zniżka z kuponu ({couponCode}):</span>
                <span>-{couponDiscount.toFixed(2)} zł</span>
              </div>
            )}
            {tipAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Napiwek:</span>
                <span>{tipAmount.toFixed(2)} zł</span>
              </div>
            )}
            {orderType === 'delivery' && deliveryFee === 0 && deliverySettings && (
              <div className="text-sm text-green-600">
                {t('freeDelivery')} przy zamówieniu od {deliverySettings.free_delivery_threshold} zł
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>{t('total')}:</span>
              <span className="text-orange-600">{totalWithTip.toFixed(2)} zł</span>
            </div>
            {splitCount > 1 && (
              <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-blue-200">
                <span>Na osobę ({splitCount} os.):</span>
                <span>{perPersonAmount.toFixed(2)} zł</span>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold disabled:opacity-50"
            >
              {loading ? t('loading') : 'Utwórz zamówienie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
