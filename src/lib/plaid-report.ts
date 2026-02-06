import { plaidClient } from "./plaid";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePlaidReport(
  accessToken: string,
  companyName?: string,
  companyNumber?: string
): Promise<{ filename: string; buffer: Buffer }[]> {
  // 1. Fetch Data from Plaid
  const balancesPromise = plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });

  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  const startDate = twoYearsAgo.toISOString().split("T")[0];
  const endDate = now.toISOString().split("T")[0];

  // Increase count to max allowed (500) to reduce number of API calls
  const count = 500;
  let offset = 0;

  let allTransactions: any[] = [];
  let hasMore = true;

  let retries = 0;
  // Increase MAX_RETRIES to allow up to 1 minute for Historical Pull to complete
  const MAX_RETRIES = 20;

  // Fetch transactions in batches using pagination
  while (hasMore) {
    console.log(`fetching Plaid transactions: offset=${offset}, count=${count}, start=${startDate}, end=${endDate}`);
    try {
      const res = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: count,
          offset: offset,
        },
      });

      // Reset retries on success
      retries = 0;

      const transactions = res.data.transactions;
      const totalAvailable = res.data.total_transactions;
      console.log(`fetched ${transactions.length} transactions. Total available: ${totalAvailable}`);

      allTransactions = [...allTransactions, ...transactions];

      // UPDATED LOGIC: Continue fetching until we have reached totalAvailable
      if (allTransactions.length >= totalAvailable || transactions.length === 0) {
        console.log("Reached end of transactions. Stopping.");
        hasMore = false;
      } else {
        offset += count;
      }
    } catch (error: any) {
      const errorCode = error.response?.data?.error_code;
      const errorMessage = error.message;
      console.warn(`Error fetching Plaid transactions (offset ${offset}): code=${errorCode}, msg=${errorMessage}`);

      if (errorCode === "PRODUCT_NOT_READY") {
        retries++;
        if (retries > MAX_RETRIES) {
          const msg = `Plaid Sync Timeout: PRODUCT_NOT_READY after max retries (${MAX_RETRIES}).`;
          console.error(msg);
          throw new Error(msg);
        } else {
          console.log(`PRODUCT_NOT_READY: Waiting 3 seconds before retrying (Attempt ${retries}/${MAX_RETRIES})...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } else {
        console.error("Non-retriable Plaid error, stopping fetch:", error);
        hasMore = false;
      }
    }
  }

  const [balanceRes] = await Promise.all([balancesPromise]);
  const accounts = balanceRes.data.accounts;

  // 2. Generate PDFs (One per account)
  const reports: { filename: string; buffer: Buffer }[] = [];

  for (const account of accounts) {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [24, 39, 68];
    const secondaryColor: [number, number, number] = [100, 116, 139];
    const accentColor: [number, number, number] = [241, 245, 249];
    const tableHeaderColor: [number, number, number] = [24, 39, 68];

    const addHeader = () => {
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Open Banking Report", 14, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 25, { align: "right" });
    };

    addHeader();
    let currentY = 55;

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Company Details", 14, currentY);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY + 3, 196, currentY + 3);
    currentY += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text("Company Name:", 14, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(companyName || "N/A", 50, currentY);
    doc.setTextColor(...secondaryColor);
    doc.text("Registration No:", 110, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(companyNumber || "N/A", 145, currentY);
    currentY += 15;

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Account Details", 14, currentY);
    currentY += 5;

    const accountRow = [
      account.name,
      account.mask || "****",
      account.type + (account.subtype ? ` (${account.subtype})` : ""),
      account.balances.current?.toFixed(2) + ` ${account.balances.iso_currency_code}`,
      account.balances.available?.toFixed(2) + ` ${account.balances.iso_currency_code}`,
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Account Name", "Mask", "Type", "Current", "Available"]],
      body: [accountRow],
      theme: "grid",
      headStyles: { fillColor: tableHeaderColor, textColor: 255, fontStyle: 'bold', halign: 'left' },
      bodyStyles: { textColor: [51, 65, 85], fontSize: 10 },
      alternateRowStyles: { fillColor: accentColor },
      columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 20;

    if (currentY > 250) {
      doc.addPage();
      addHeader();
      currentY = 55;
    }

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`Transactions Analysis`, 14, currentY);
    currentY += 10;

    const accountTxns = allTransactions
      .filter((t) => t.account_id === account.account_id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalChange = accountTxns.reduce((sum, t) => sum + t.amount, 0);
    const startBalance = (account.balances.current || 0) + totalChange;
    let runningBalance = startBalance;

    const transactionRows = [];
    const startDateStrLabel = accountTxns.length > 0
      ? new Date(accountTxns[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ')
      : "";

    transactionRows.push([
      startDateStrLabel,
      "BALANCE BROUGHT FORWARD",
      "", "",
      startBalance.toFixed(2) + (startBalance < 0 ? " Dr" : " Cr")
    ]);

    let lastDate = "";
    accountTxns.forEach((t, index) => {
      runningBalance -= t.amount;
      const isCredit = t.amount < 0;
      const amountStr = Math.abs(t.amount).toFixed(2);
      const d = new Date(t.date);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ');

      const showDate = dateStr !== lastDate;
      lastDate = dateStr;

      const nextTxn = accountTxns[index + 1];
      let showBalance = false;
      if (!nextTxn) {
        showBalance = true;
      } else {
        const nextDateStr = new Date(nextTxn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ');
        if (nextDateStr !== dateStr) showBalance = true;
      }

      let code = isCredit ? "CR" : (t.payment_channel === "online" || t.payment_channel === "in store") ? "VIS" : (t.name.toLowerCase().includes("dd") ? "DD" : "BP");
      const balSuffix = runningBalance < 0 ? " Dr" : " Cr";

      transactionRows.push([
        showDate ? dateStr : "",
        `${code}  ${t.name}`,
        !isCredit ? amountStr : "",
        isCredit ? amountStr : "",
        showBalance ? (runningBalance.toFixed(2) + balSuffix) : ""
      ]);
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Date", "Payment type and details", "Paid out", "Paid in", "Balance"]],
      body: transactionRows,
      theme: "striped",
      styles: { lineColor: [220, 220, 220], lineWidth: 0.1 },
      headStyles: { fillColor: tableHeaderColor, textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: [51, 65, 85], fontSize: 8 },
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold', textColor: [100, 116, 139] } },
      margin: { top: 45 },
      didDrawPage: (data) => { if (data.pageNumber > 1) addHeader(); }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" });
      doc.text("Funding Match AI - Confidential", 14, doc.internal.pageSize.height - 10);
    }

    const safeAccountName = account.name.replace(/[^a-zA-Z0-9]/g, "_");
    reports.push({
      filename: `OpenBanking_${safeAccountName}_${account.mask}.pdf`,
      buffer: Buffer.from(doc.output("arraybuffer"))
    });
  }

  return reports;
}