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
  const count = 100; // Reduced from 500 to improve reliability
  let offset = 0;

  let allTransactions: any[] = [];
  let hasMore = true;

  let retries = 0;
  const MAX_RETRIES = 10; // Increased to ~30s total wait to allow Production sync

  // Fetch transactions in batches
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
      console.log(`fetched ${transactions.length} transactions. Total available according to Plaid: ${totalAvailable}`);

      allTransactions = [...allTransactions, ...transactions];

      if (transactions.length < count) {
        console.log("Reached end of transactions (returned < count). Stopping.");
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
          console.error(`PRODUCT_NOT_READY: Max retries (${MAX_RETRIES}) reached. Stopping fetch with partial data.`);
          hasMore = false;
        } else {
          console.log(`PRODUCT_NOT_READY: Waiting 3 seconds before retrying (Attempt ${retries}/${MAX_RETRIES})...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          // Loop continues, retrying the same offset
        }
      } else {
        // For other errors, we might want to retry if it's a network glitch?
        // But for now, let's stop to avoid infinite loops on hard errors.
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
    const primaryColor: [number, number, number] = [24, 39, 68]; // #182744
    const secondaryColor: [number, number, number] = [100, 116, 139]; // #64748b
    const accentColor: [number, number, number] = [241, 245, 249]; // #f1f5f9
    const tableHeaderColor: [number, number, number] = [24, 39, 68];

    // Helper for Header
    const addHeader = () => {
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
    };

    addHeader();

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

    // Account Details Section (Specific to this account)
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
      headStyles: {
        fillColor: tableHeaderColor,
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

    // 3. Transactions For This Account

    // Check if we need a new page before transactions title? 
    // Usually not needed right after account details, but good to check space.
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

    // Filter and Sort Transactions: Oldest First (Ascending)
    const accountTxns = allTransactions
      .filter((t) => t.account_id === account.account_id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate Start Balance
    const totalChange = accountTxns.reduce((sum, t) => sum + t.amount, 0);
    const startBalance = (account.balances.current || 0) + totalChange; // "current" is what Plaid returns as NOW balance
    let runningBalance = startBalance;

    const transactionRows = [];

    // 1. Add "Balance Brought Forward" Row
    const startDateStr = accountTxns.length > 0
      ? new Date(accountTxns[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ')
      : "";

    transactionRows.push([
      startDateStr,
      "BALANCE BROUGHT FORWARD",
      "", "",
      startBalance.toFixed(2) + (startBalance < 0 ? " Dr" : " Cr")
    ]);

    let lastDate = "";

    accountTxns.forEach((t, index) => {
      // Apply transaction to balance
      runningBalance -= t.amount;

      const isCredit = t.amount < 0;
      const amountStr = Math.abs(t.amount).toFixed(2);

      // Date Format: DD MMM YY
      const d = new Date(t.date);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ');

      // Show Date? (Only on first transaction of the day)
      const showDate = dateStr !== lastDate;
      lastDate = dateStr;

      // Show Balance? (Only on last transaction of the day OR last transaction in list)
      const nextTxn = accountTxns[index + 1];
      let showBalance = false;
      if (!nextTxn) {
        showBalance = true;
      } else {
        const nextDateStr = new Date(nextTxn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ');
        if (nextDateStr !== dateStr) showBalance = true;
      }

      // Heuristic for Transaction Code
      let code = "";
      // @ts-ignore
      const channel = t.payment_channel;

      if (isCredit) {
        code = "CR";
      } else {
        if (channel === "online" || channel === "in store") {
          code = "VIS";
        } else if (t.name.toLowerCase().includes("direct debit") || t.name.toLowerCase().includes("dd")) {
          code = "DD";
        } else {
          code = "BP";
        }
      }

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
      styles: {
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: tableHeaderColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        fontSize: 8
      },
      columnStyles: {
        2: { halign: 'right' }, // Paid out
        3: { halign: 'right' }, // Paid in
        4: { halign: 'right', fontStyle: 'bold', textColor: [100, 116, 139] }  // Balance
      },
      // Handle page breaks specifically
      margin: { top: 45 },
      didDrawPage: (data) => {
        // Re-add header on new pages (if autoTable triggers page break)
        if (data.pageNumber > 1) {
          addHeader();
        }
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

    const safeAccountName = account.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `OpenBanking_${safeAccountName}_${account.mask}.pdf`;

    reports.push({
      filename,
      buffer: Buffer.from(doc.output("arraybuffer"))
    });
  }

  return reports;
}
