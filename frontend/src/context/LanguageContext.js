import React, { createContext, useContext, useState } from 'react';

const translations = {
  pl: {
    // Common
    add: 'Dodaj',
    edit: 'Edytuj',
    delete: 'Usuń',
    save: 'Zapisz',
    cancel: 'Anuluj',
    close: 'Zamknij',
    search: 'Szukaj',
    loading: 'Ładowanie...',
    total: 'Razem',
    yes: 'Tak',
    no: 'Nie',
    
    // Auth
    login: 'Zaloguj się',
    logout: 'Wyloguj',
    email: 'Email',
    password: 'Hasło',
    welcomeBack: 'Witaj z powrotem!',
    
    // Cashier
    newOrder: 'Dodaj zamówienie',
    delivery: 'Dostawa',
    takeaway: 'Odbiór własny',
    current: 'Bieżące',
    archive: 'Archiwum',
    kitchen: 'Kuchnia',
    addToOrder: 'Dodaj do zamówienia',
    cart: 'Koszyk',
    emptyCart: 'Koszyk jest pusty',
    clearCart: 'Wyczyść koszyk',
    checkout: 'Zapłać',
    itemAdded: 'Dodano do zamówienia',
    itemRemoved: 'Usunięto pozycję',
    
    // Order Types
    dineIn: 'Na miejscu',
    orderType: 'Typ zamówienia',
    tableNumber: 'Numer stolika',
    customerName: 'Imię klienta',
    customerPhone: 'Telefon',
    deliveryAddress: 'Adres dostawy',
    notes: 'Uwagi',
    paymentMethod: 'Metoda płatności',
    cash: 'Gotówka',
    card: 'Karta',
    online: 'Online',
    deliveryFee: 'Koszt dostawy',
    freeDelivery: 'Darmowa dostawa',
    
    // Order Status
    pending: 'Oczekujące',
    preparing: 'W przygotowaniu',
    ready: 'Gotowe',
    completed: 'Zakończone',
    cancelled: 'Anulowane',
    
    // Messages
    orderCreated: 'Zamówienie utworzone pomyślnie',
    orderError: 'Błąd przy tworzeniu zamówienia',
    printReceipt: 'Drukuj paragon',
    printKitchen: 'Drukuj dla kuchni',
    
    // Admin sections
    dashboard: 'Pulpit',
    reports: 'Raporty',
    menu: 'Menu',
    addons: 'Grupy dodatków',
    parameters: 'Parametry',
    packaging: 'Opakowania',
    promotions: 'Promocje',
    coupons: 'Kupony',
    crossSelling: 'Cross-selling',
    marketing: 'Marketing automatyczny',
    qrCodes: 'Kody QR',
    settings: 'Ustawienia',
  },
  en: {
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    total: 'Total',
    yes: 'Yes',
    no: 'No',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    welcomeBack: 'Welcome back!',
    
    // Cashier
    newOrder: 'New Order',
    delivery: 'Delivery',
    takeaway: 'Takeaway',
    current: 'Current',
    archive: 'Archive',
    kitchen: 'Kitchen',
    addToOrder: 'Add to Order',
    cart: 'Cart',
    emptyCart: 'Cart is empty',
    clearCart: 'Clear Cart',
    checkout: 'Checkout',
    itemAdded: 'Added to order',
    itemRemoved: 'Item removed',
    
    // Order Types
    dineIn: 'Dine In',
    orderType: 'Order Type',
    tableNumber: 'Table Number',
    customerName: 'Customer Name',
    customerPhone: 'Phone',
    deliveryAddress: 'Delivery Address',
    notes: 'Notes',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    online: 'Online',
    deliveryFee: 'Delivery Fee',
    freeDelivery: 'Free Delivery',
    
    // Order Status
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Messages
    orderCreated: 'Order created successfully',
    orderError: 'Error creating order',
    printReceipt: 'Print Receipt',
    printKitchen: 'Print Kitchen Order',
    
    // Admin sections
    dashboard: 'Dashboard',
    reports: 'Reports',
    menu: 'Menu',
    addons: 'Addons Groups',
    parameters: 'Parameters',
    packaging: 'Packaging',
    promotions: 'Promotions',
    coupons: 'Coupons',
    crossSelling: 'Cross-selling',
    marketing: 'Marketing Automation',
    qrCodes: 'QR Codes',
    settings: 'Settings',
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pl');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pl' ? 'en' : 'pl');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
