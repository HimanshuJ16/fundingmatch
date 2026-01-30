import { plaidClient } from "./plaid";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePlaidReport(
  accessToken: string,
  companyName?: string,
  companyNumber?: string
): Promise<Buffer> {
  // 1. Fetch Data from Plaid
  const balancesPromise = plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const transactionsPromise = plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: oneYearAgo.toISOString().split("T")[0],
    end_date: now.toISOString().split("T")[0],
    options: {
      count: 500,
      offset: 0,
    },
  });

  const [balanceRes, initialTransRes] = await Promise.all([
    balancesPromise,
    transactionsPromise,
  ]);

  const accounts = balanceRes.data.accounts;
  let allTransactions = [...initialTransRes.data.transactions];
  const totalTransactions = initialTransRes.data.total_transactions;
  const item = balanceRes.data.item;

  // Fetch remaining transactions if any
  while (allTransactions.length < totalTransactions) {
    const res = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: oneYearAgo.toISOString().split("T")[0],
      end_date: now.toISOString().split("T")[0],
      options: {
        count: 500, // Max per request (batch size)
        offset: allTransactions.length,
      },
    });
    allTransactions = [...allTransactions, ...res.data.transactions];
  }

  // 2. Generate PDF
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [24, 39, 68]; // #182744
  const secondaryColor: [number, number, number] = [100, 116, 139]; // #64748b
  const accentColor: [number, number, number] = [241, 245, 249]; // #f1f5f9

  // Header Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F"); // Full width header bar

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Open Banking Report", 14, 25);

  // Subtitle / Date in header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 25, { align: "right" });

  let currentY = 55;

  // Metadata Section
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Company Details", 14, currentY);

  doc.setDrawColor(226, 232, 240); // divider line
  doc.line(14, currentY + 3, 196, currentY + 3);

  currentY += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Row 1
  doc.setTextColor(...secondaryColor);
  doc.text("Company Name:", 14, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(companyName || "N/A", 50, currentY);

  doc.setTextColor(...secondaryColor);
  doc.text("Registration No:", 110, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(companyNumber || "N/A", 145, currentY);

  currentY += 15;

  // Accounts Section
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Account Balances", 14, currentY);
  currentY += 5;

  const accountRows = accounts.map((acc) => [
    acc.name,
    acc.mask || "****",
    acc.type + (acc.subtype ? ` (${acc.subtype})` : ""),
    acc.balances.current?.toFixed(2) + ` ${acc.balances.iso_currency_code}`,
    acc.balances.available?.toFixed(2) + ` ${acc.balances.iso_currency_code}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Account Name", "Mask", "Type", "Current", "Available"]],
    body: accountRows,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 10
    },
    alternateRowStyles: {
      fillColor: accentColor
    },
    columnStyles: {
      3: { halign: 'right' }, // Current
      4: { halign: 'right' }  // Available
    }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 20;

  // Transactions Section
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`Transaction History`, 14, currentY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  doc.text(`Last 12 Months • Total: ${allTransactions.length} transactions`, 14, currentY + 5);

  currentY += 10;

  const transactionRows = allTransactions.map((t) => [
    t.date,
    t.name,
    t.amount.toFixed(2) + ` ${t.iso_currency_code}`,
    (t.category || []).join(", "),
    t.merchant_name || "",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Date", "Description", "Amount", "Category", "Merchant"]],
    body: transactionRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 8
    },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' } // Amount
    }
  });

  // Add Footer / Page Numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
    doc.text(
      "Funding Match AI - Confidential",
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Return formatted as Buffer
  return Buffer.from(doc.output("arraybuffer"));
}
