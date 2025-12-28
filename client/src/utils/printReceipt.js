export const printReceipt = (order) => {
  // 1. Define the receipt layout (CSS for 58mm paper)
  const receiptHTML = `
    <html>
      <head>
        <title>Receipt #${order._id.slice(-4)}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 58mm; font-size: 12px; margin: 0; padding: 5px; }
          .center { text-align: center; }
          .bold { fontWeight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin:0;">🌊 M-Laundromat</h2>
          <p>Quezon City, Manila<br>Tel: 0912-345-6789</p>
        </div>
        
        <div class="line"></div>
        
        <div>
          <strong>Date:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br>
          <strong>Order ID:</strong> #${order._id.slice(-6).toUpperCase()}<br>
          <strong>Customer:</strong> ${order.customerName}<br>
          <strong>Service:</strong> ${order.serviceType}
        </div>

        <div class="line"></div>

        <div class="row">
          <span>Wash (${order.washCount})</span>
          <span>--</span>
        </div>
        <div class="row">
          <span>Dry (${order.dryCount})</span>
          <span>--</span>
        </div>

        ${order.addOns.map(item => `
          <div class="row">
            <span>${item.itemName} (x${item.quantity})</span>
            <span>--</span>
          </div>
        `).join('')}

        <div class="line"></div>

        <div class="row" style="font-size: 16px; font-weight: bold;">
          <span>TOTAL:</span>
          <span>₱${order.totalPrice}</span>
        </div>

        <div class="line"></div>
        
        <div class="center" style="margin-top: 10px;">
          THANK YOU!<br>
          Please come again.
        </div>
      </body>
    </html>
  `;

  // 2. Open a hidden popup window
  const printWindow = window.open('', '', 'height=600,width=400');
  
  // 3. Write the HTML and trigger print
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait a split second for styles to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};