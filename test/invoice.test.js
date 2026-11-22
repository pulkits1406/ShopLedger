var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function calculate(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('invoice matches checkout HSN GST, capped coupon discount, and total for #1004', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508' }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(
    {
      subtotal: result.invoice.subtotal,
      discount: result.invoice.discount,
      tax: result.invoice.tax,
      cgst: result.invoice.cgst,
      sgst: result.invoice.sgst,
      total: result.invoice.total,
      rows: result.invoice.rows
    },
    {
      subtotal: 2240,
      discount: 150,
      tax: 104.5,
      cgst: 52.25,
      sgst: 52.25,
      total: 2194.5,
      rows: [
        { name: 'Groundnut Oil', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
      ]
    }
  );
  assert.equal(result.invoice.total, result.checkout.total);
});

test('CURRENT BEHAVIOUR: #1001 invoice uses explicit 5% and 12% line GST without a coupon', function () {
  var order = {
    coupon: '',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Ghee', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1090,
    discount: 0,
    tax: 86,
    cgst: 43,
    sgst: 43,
    total: 1176,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  });
  assert.equal(result.invoice.total, result.checkout.total);
  assert.equal(result.invoice.tax, result.checkout.tax);
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 applies its discount before GST', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Sunflower Oil', price: 190, qty: 2, hsn: '1512', gstRate: 5 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: '-', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 applies the ₹150 coupon cap before GST', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.deepEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 all-18% items without a coupon match checkout figures', function () {
  var order = {
    coupon: '',
    items: [
      { name: 'Tea', price: 140, qty: 1, hsn: '0902', gstRate: 18 },
      { name: 'Kokum Sherbet', price: 180, qty: 2, hsn: '2106', gstRate: 18 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Tea', sku: '-', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet', sku: '-', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.equal(result.invoice.total, result.checkout.total);
  assert.equal(result.invoice.tax, result.checkout.tax);
});
