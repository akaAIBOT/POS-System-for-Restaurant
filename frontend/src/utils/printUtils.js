// Narzędzia do drukowania paragonów i dokumentów

export const printReceipt = (order, includeKitchen = false) => {
  const printWindow = window.open('', '_blank');
  
  const restaurantInfo = JSON.parse(localStorage.getItem('restaurantSettings') || '{}');
  const receiptHTML = generateReceiptHTML(order, restaurantInfo, includeKitchen);
  
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const printKitchenOrder = (order) => {
  const printWindow = window.open('', '_blank');
  
  const kitchenHTML = generateKitchenHTML(order);
  
  printWindow.document.write(kitchenHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const printDailyReport = (orders, date) => {
  const printWindow = window.open('', '_blank');
  
  const reportHTML = generateDailyReportHTML(orders, date);
  
  printWindow.document.write(reportHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

const generateReceiptHTML = (order, restaurantInfo, includeKitchen) => {
  const date = new Date(order.created_at || Date.now());
  const orderType = {
    'nowe': 'Na miejscu',
    'dostawa': 'Dostawa',
    'odbior': 'Odbiór',
    'namiejscu': 'Na miejscu'
  }[order.order_type] || 'Na miejscu';

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Sprawdzamy obecność opakowania
  const packagingSettings = JSON.parse(localStorage.getItem('packagingSettings') || '{}');
  const packagingCost = (order.order_type === 'dostawa' || order.order_type === 'odbior') && packagingSettings.active
    ? parseFloat(packagingSettings.price || 0)
    : 0;
  
  const total = subtotal + packagingCost;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Paragon - Zamówienie #${order.order_number || order.id}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 10mm;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 80mm;
          margin: 0 auto;
          padding: 10px;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .restaurant-info {
          font-size: 10px;
          margin: 2px 0;
        }
        .order-info {
          margin: 10px 0;
          font-size: 11px;
        }
        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 10px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          margin: 0 10px;
        }
        .item-price {
          text-align: right;
          min-width: 60px;
        }
        .item-details {
          font-size: 10px;
          color: #666;
          margin-left: 10px;
        }
        .totals {
          margin: 10px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .total-label {
          font-weight: bold;
        }
        .grand-total {
          border-top: 2px solid #000;
          padding-top: 5px;
          font-size: 16px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          border-top: 2px dashed #000;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 10px;
        }
        .barcode {
          text-align: center;
          margin: 10px 0;
          font-size: 14px;
          letter-spacing: 2px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">${restaurantInfo.name || 'Wok\'N\'Cats'}</div>
        <div class="restaurant-info">${restaurantInfo.address || 'ul. Przykładowa 123'}</div>
        <div class="restaurant-info">${restaurantInfo.city || 'Warszawa'}</div>
        <div class="restaurant-info">Tel: ${restaurantInfo.phone || '+48 123 456 789'}</div>
        <div class="restaurant-info">NIP: ${restaurantInfo.nip || '1234567890'}</div>
      </div>

      <div class="order-info">
        <div><strong>Paragon fiskalny</strong></div>
        <div>Nr zamówienia: #${order.order_number || order.id}</div>
        <div>Typ: ${orderType}</div>
        <div>Data: ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL')}</div>
        ${order.table_number ? `<div>Stolik: ${order.table_number}</div>` : ''}
      </div>

      <div class="items">
        ${items.map(item => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="item-qty">${item.quantity}x</div>
            <div class="item-price">${(item.price * item.quantity).toFixed(2)} zł</div>
          </div>
          ${item.selectedAddons && item.selectedAddons.length > 0 ? `
            <div class="item-details">
              Dodatki: ${item.selectedAddons.map(a => a.name).join(', ')}
            </div>
          ` : ''}
          ${item.selectedParameters && item.selectedParameters.length > 0 ? `
            <div class="item-details">
              ${item.selectedParameters.map(p => `${p.name}: ${p.selectedOption}`).join(', ')}
            </div>
          ` : ''}
          ${item.comment ? `
            <div class="item-details">Uwagi: ${item.comment}</div>
          ` : ''}
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Produkty:</span>
          <span>${subtotal.toFixed(2)} zł</span>
        </div>
        ${packagingCost > 0 ? `
          <div class="total-row">
            <span>Opakowanie:</span>
            <span>${packagingCost.toFixed(2)} zł</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span class="total-label">RAZEM:</span>
          <span>${total.toFixed(2)} zł</span>
        </div>
      </div>

      ${order.payment_method ? `
        <div class="order-info">
          <div>Metoda płatności: ${order.payment_method === 'card' ? 'Karta' : order.payment_method === 'cash' ? 'Gotówka' : 'Inny'}</div>
        </div>
      ` : ''}

      <div class="barcode">
        *${order.order_number || order.id}*
      </div>

      <div class="footer">
        <div>Dziękujemy za zakupy!</div>
        <div>Zapraszamy ponownie</div>
        <div style="margin-top: 10px;">www.wokncats.pl</div>
      </div>
    </body>
    </html>
  `;
};

const generateKitchenHTML = (order) => {
  const date = new Date(order.created_at || Date.now());
  const orderType = {
    'nowe': 'NA MIEJSCU',
    'dostawa': 'DOSTAWA',
    'odbior': 'ODBIÓR',
    'namiejscu': 'NA MIEJSCU'
  }[order.order_type] || 'NA MIEJSCU';

  const items = order.items || [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Kuchnia - Zamówienie #${order.order_number || order.id}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 5mm;
          }
        }
        body {
          font-family: 'Arial', sans-serif;
          font-size: 14px;
          line-height: 1.5;
          max-width: 80mm;
          margin: 0 auto;
          padding: 5px;
        }
        .header {
          text-align: center;
          background: #000;
          color: #fff;
          padding: 15px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .order-number {
          font-size: 32px;
          margin: 10px 0;
        }
        .order-type {
          font-size: 18px;
          padding: 5px 10px;
          background: ${order.order_type === 'dostawa' ? '#ef4444' : order.order_type === 'odbior' ? '#f59e0b' : '#10b981'};
          color: white;
          display: inline-block;
          border-radius: 5px;
          margin: 10px 0;
        }
        .time {
          font-size: 16px;
          font-weight: bold;
          margin: 10px 0;
        }
        .items {
          margin: 20px 0;
        }
        .item {
          border: 2px solid #000;
          padding: 15px;
          margin: 10px 0;
          page-break-inside: avoid;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
        }
        .item-name {
          font-size: 18px;
          font-weight: bold;
        }
        .item-qty {
          font-size: 24px;
          font-weight: bold;
          background: #000;
          color: #fff;
          padding: 5px 15px;
          border-radius: 5px;
        }
        .item-details {
          margin: 5px 0;
          padding: 5px;
          background: #f3f4f6;
        }
        .comment {
          background: #fef3c7;
          border: 2px dashed #f59e0b;
          padding: 10px;
          margin-top: 10px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 20px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>ZAMÓWIENIE KUCHNIA</div>
        <div class="order-number">#${order.order_number || order.id}</div>
        <div class="order-type">${orderType}</div>
        ${order.table_number ? `<div style="font-size: 20px; margin-top: 10px;">Stolik: ${order.table_number}</div>` : ''}
      </div>

      <div class="time">
        Godz: ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <div class="items">
        ${items.map((item, index) => `
          <div class="item">
            <div class="item-header">
              <div class="item-name">${index + 1}. ${item.name}</div>
              <div class="item-qty">${item.quantity}x</div>
            </div>
            ${item.selectedAddons && item.selectedAddons.length > 0 ? `
              <div class="item-details">
                <strong>Dodatki:</strong><br>
                ${item.selectedAddons.map(a => `• ${a.name}`).join('<br>')}
              </div>
            ` : ''}
            ${item.selectedParameters && item.selectedParameters.length > 0 ? `
              <div class="item-details">
                ${item.selectedParameters.map(p => `<strong>${p.name}:</strong> ${p.selectedOption}`).join('<br>')}
              </div>
            ` : ''}
            ${item.comment ? `
              <div class="comment">
                ⚠️ UWAGA: ${item.comment}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <div style="font-size: 16px; font-weight: bold;">Liczba pozycji: ${items.length}</div>
        <div style="margin-top: 10px;">${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL')}</div>
      </div>
    </body>
    </html>
  `;
};

const generateDailyReportHTML = (orders, date) => {
  const reportDate = date || new Date();
  const dateStr = reportDate.toLocaleDateString('pl-PL');
  
  // Filtrujemy zamówienia za wybrany dzień
  const dayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.toLocaleDateString('pl-PL') === dateStr;
  });

  // Obliczenia
  const totalOrders = dayOrders.length;
  const totalRevenue = dayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
  const cashPayments = dayOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + (o.total_price || 0), 0);
  const cardPayments = dayOrders.filter(o => o.payment_method === 'card').reduce((sum, o) => sum + (o.total_price || 0), 0);
  
  const ordersByType = {
    namiejscu: dayOrders.filter(o => o.order_type === 'nowe' || o.order_type === 'namiejscu').length,
    dostawa: dayOrders.filter(o => o.order_type === 'dostawa').length,
    odbior: dayOrders.filter(o => o.order_type === 'odbior').length
  };

  const restaurantInfo = JSON.parse(localStorage.getItem('restaurantSettings') || '{}');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Raport dzienny - ${dateStr}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .restaurant-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin: 20px 0 10px 0;
        }
        .info-section {
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .info-row.total {
          background: #f3f4f6;
          font-weight: bold;
          font-size: 16px;
          border: 2px solid #000;
          margin-top: 10px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          background: #000;
          color: #fff;
          padding: 10px;
          margin: 20px 0 10px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #f3f4f6;
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .footer {
          border-top: 2px solid #000;
          margin-top: 40px;
          padding-top: 20px;
          text-align: center;
        }
        .signature-line {
          margin: 30px 50px;
          border-top: 1px solid #000;
          text-align: center;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">${restaurantInfo.name || 'Wok\'N\'Cats'}</div>
        <div>${restaurantInfo.address || 'ul. Przykładowa 123'}, ${restaurantInfo.city || 'Warszawa'}</div>
        <div>NIP: ${restaurantInfo.nip || '1234567890'}</div>
        <div class="report-title">RAPORT DZIENNY KASOWY</div>
        <div>Data: ${dateStr}</div>
        <div>Wygenerowano: ${new Date().toLocaleString('pl-PL')}</div>
      </div>

      <div class="section-title">PODSUMOWANIE SPRZEDAŻY</div>
      <div class="info-section">
        <div class="info-row">
          <span>Liczba zamówień:</span>
          <span>${totalOrders}</span>
        </div>
        <div class="info-row">
          <span>Gotówka:</span>
          <span>${cashPayments.toFixed(2)} zł</span>
        </div>
        <div class="info-row">
          <span>Karta:</span>
          <span>${cardPayments.toFixed(2)} zł</span>
        </div>
        <div class="info-row total">
          <span>SUMA OGÓŁEM:</span>
          <span>${totalRevenue.toFixed(2)} zł</span>
        </div>
      </div>

      <div class="section-title">ZAMÓWIENIA WG TYPU</div>
      <div class="info-section">
        <div class="info-row">
          <span>Na miejscu:</span>
          <span>${ordersByType.namiejscu} (${((ordersByType.namiejscu / totalOrders) * 100 || 0).toFixed(1)}%)</span>
        </div>
        <div class="info-row">
          <span>Dostawa:</span>
          <span>${ordersByType.dostawa} (${((ordersByType.dostawa / totalOrders) * 100 || 0).toFixed(1)}%)</span>
        </div>
        <div class="info-row">
          <span>Odbiór:</span>
          <span>${ordersByType.odbior} (${((ordersByType.odbior / totalOrders) * 100 || 0).toFixed(1)}%)</span>
        </div>
      </div>

      <div class="section-title">SZCZEGÓŁY ZAMÓWIEŃ</div>
      <table>
        <thead>
          <tr>
            <th>Nr</th>
            <th>Godzina</th>
            <th>Typ</th>
            <th>Płatność</th>
            <th class="text-right">Kwota</th>
          </tr>
        </thead>
        <tbody>
          ${dayOrders.map(order => {
            const time = new Date(order.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            const type = order.order_type === 'dostawa' ? 'Dostawa' : order.order_type === 'odbior' ? 'Odbiór' : 'Na miejscu';
            const payment = order.payment_method === 'card' ? 'Karta' : order.payment_method === 'cash' ? 'Gotówka' : '-';
            return `
              <tr>
                <td>#${order.order_number || order.id}</td>
                <td>${time}</td>
                <td>${type}</td>
                <td>${payment}</td>
                <td class="text-right">${(order.total_price || 0).toFixed(2)} zł</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background: #f3f4f6;">
            <td colspan="4">RAZEM:</td>
            <td class="text-right">${totalRevenue.toFixed(2)} zł</td>
          </tr>
        </tfoot>
      </table>

      <div class="footer">
        <div class="signature-line">
          Podpis kasjera
        </div>
        <div class="signature-line">
          Podpis menedżera
        </div>
        <div style="margin-top: 20px; font-size: 10px;">
          Raport wygenerowany automatycznie przez system POS Wok'N'Cats
        </div>
      </div>
    </body>
    </html>
  `;
};
