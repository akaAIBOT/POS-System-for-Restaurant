export const printKitchenReceipt = (order, orderItems) => {
  const printWindow = window.open('', '', 'width=300,height=600');
  
  const orderTypeMap = {
    'dine_in': 'NA MIEJSCU',
    'delivery': 'DOSTAWA',
    'takeaway': 'ODBIÓR WŁASNY'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Zamówienie Kuchnia #${order.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.4;
          padding: 10px;
          width: 280px;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .order-number {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .label {
          font-weight: bold;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
        .items {
          margin: 15px 0;
        }
        .item {
          margin: 8px 0;
          padding: 5px 0;
          border-bottom: 1px dotted #ccc;
        }
        .item-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 3px;
        }
        .item-quantity {
          font-size: 24px;
          font-weight: bold;
          display: inline-block;
          margin-right: 10px;
          min-width: 30px;
        }
        .notes {
          background: #f5f5f5;
          padding: 8px;
          margin: 10px 0;
          border: 1px solid #ddd;
        }
        .notes-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px dashed #000;
        }
        .timestamp {
          font-size: 12px;
          color: #666;
        }
        .type-badge {
          display: inline-block;
          padding: 5px 10px;
          background: #000;
          color: #fff;
          font-weight: bold;
          margin: 10px 0;
        }
        @media print {
          body {
            width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">🍜 WOK'N'CATS</div>
        <div style="font-size: 18px; font-weight: bold;">ZAMÓWIENIE DLA KUCHNI</div>
        <div class="order-number">#${order.id}</div>
        <div class="type-badge">${orderTypeMap[order.order_type] || order.order_type.toUpperCase()}</div>
      </div>

      <div class="info-row">
        <span class="label">Data:</span>
        <span>${new Date(order.created_at).toLocaleString('pl-PL')}</span>
      </div>

      ${order.table_id ? `
      <div class="info-row">
        <span class="label">Stolik:</span>
        <span style="font-size: 20px; font-weight: bold;">Nr ${order.table_id}</span>
      </div>
      ` : ''}

      ${order.customer_name ? `
      <div class="info-row">
        <span class="label">Klient:</span>
        <span>${order.customer_name}</span>
      </div>
      ` : ''}

      ${order.customer_phone ? `
      <div class="info-row">
        <span class="label">Telefon:</span>
        <span>${order.customer_phone}</span>
      </div>
      ` : ''}

      <div class="divider"></div>

      <div class="items">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 10px;">POZYCJE:</div>
        ${orderItems.map(item => `
          <div class="item">
            <div>
              <span class="item-quantity">${item.quantity}x</span>
              <span class="item-name">${item.name}</span>
            </div>
          </div>
        `).join('')}
      </div>

      ${order.notes ? `
      <div class="notes">
        <div class="notes-title">⚠️ UWAGI:</div>
        <div style="font-size: 14px;">${order.notes}</div>
      </div>
      ` : ''}

      <div class="footer">
        <div class="timestamp">Wydrukowano: ${new Date().toLocaleString('pl-PL')}</div>
        <div style="margin-top: 10px; font-size: 12px;">--- KONIEC ZAMÓWIENIA ---</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 500);
        }
      </script>
    </body>
    </html>
  `;

  if (printWindow && printWindow.document) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Nie można otworzyć okna drukowania. Sprawdź uprawnienia przeglądarki.');
  }
};

export const printCustomerReceipt = (order, orderItems, total, deliveryFee = 0) => {
  const printWindow = window.open('', '', 'width=300,height=600');
  
  const orderTypeMap = {
    'dine_in': 'Na miejscu',
    'delivery': 'Dostawa',
    'takeaway': 'Odbiór własny'
  };

  const paymentMethodMap = {
    'cash': 'Gotówka',
    'card': 'Karta',
    'online': 'Online'
  };

  const subtotal = total - deliveryFee;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Paragon #${order.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          padding: 10px;
          width: 280px;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
        }
        .company-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .receipt-title {
          font-size: 16px;
          font-weight: bold;
          margin: 10px 0;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          font-size: 11px;
        }
        .items {
          margin: 10px 0;
        }
        .item {
          margin: 5px 0;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
        }
        .item-name {
          flex: 1;
        }
        .item-price {
          text-align: right;
          min-width: 60px;
        }
        .totals {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #000;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .total-row.final {
          font-size: 16px;
          font-weight: bold;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #000;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
        }
        @media print {
          body {
            width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🍜 WOK'N'CATS</div>
        <div>ul. Przykładowa 123</div>
        <div>00-000 Warszawa</div>
        <div>NIP: 123-456-78-90</div>
        <div class="receipt-title">PARAGON FISKALNY</div>
      </div>

      <div class="divider"></div>

      <div class="info-row">
        <span>Zamówienie:</span>
        <span>#${order.id}</span>
      </div>
      <div class="info-row">
        <span>Data:</span>
        <span>${new Date(order.created_at).toLocaleString('pl-PL', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</span>
      </div>
      <div class="info-row">
        <span>Typ:</span>
        <span>${orderTypeMap[order.order_type] || order.order_type}</span>
      </div>
      ${order.table_id ? `
      <div class="info-row">
        <span>Stolik:</span>
        <span>Nr ${order.table_id}</span>
      </div>
      ` : ''}

      <div class="divider"></div>

      <div class="items">
        ${orderItems.map(item => `
          <div class="item">
            <div class="item-row">
              <span class="item-name">${item.quantity}x ${item.name}</span>
              <span class="item-price">${(item.price * item.quantity).toFixed(2)} zł</span>
            </div>
            <div style="font-size: 10px; color: #666; margin-left: 15px;">
              ${item.quantity} x ${item.price.toFixed(2)} zł
            </div>
          </div>
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Suma:</span>
          <span>${subtotal.toFixed(2)} zł</span>
        </div>
        ${deliveryFee > 0 ? `
        <div class="total-row">
          <span>Dostawa:</span>
          <span>${deliveryFee.toFixed(2)} zł</span>
        </div>
        ` : ''}
        <div class="total-row final">
          <span>RAZEM:</span>
          <span>${total.toFixed(2)} zł</span>
        </div>
        ${order.payment_method ? `
        <div class="total-row" style="margin-top: 10px;">
          <span>Płatność:</span>
          <span>${paymentMethodMap[order.payment_method] || order.payment_method}</span>
        </div>
        ` : ''}
      </div>

      <div class="divider"></div>

      <div class="footer">
        <div style="margin: 10px 0;">Dziękujemy za zamówienie!</div>
        <div>www.wokncats.pl</div>
        <div>tel: +48 123 456 789</div>
        <div style="margin-top: 10px; font-size: 10px;">
          Wydrukowano: ${new Date().toLocaleString('pl-PL')}
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 500);
        }
      </script>
    </body>
    </html>
  `;

  if (printWindow && printWindow.document) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Не удалось открыть окно печати. Проверьте разрешения браузера.');
  }
};
