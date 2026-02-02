import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { usePlaidLink } from "react-plaid-link";
import { QuickMatchFormData } from "@/schemas/quickmatchform.schema";

interface BankStatementsStepProps {
  isAnalyzing?: boolean;
}

export const BankStatementsStep = ({ isAnalyzing: isParentAnalyzing = false }: BankStatementsStepProps) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext<QuickMatchFormData>();
  const [method, setMethod] = useState<"upload" | "link">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const fetchAccounts = async (connectionId: string) => {
    try {
      const response = await fetch("/api/plaid/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    }
  };

  const fetchAnalysis = async (connectionId: string) => {
    try {
      const response = await fetch("/api/plaid/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });
      if (response.ok) {
        const data = await response.json();

        // Backend now returns:
        // data.data -> Aggregated Object (for Form)
        // data.accounts -> Array of Account Details (for UI)

        setAnalysisData(data.accounts || []); // Use array for display loop (User prefers this UI)
        setValue("bankAnalysis", data.data); // Persist aggregated object to form state

        console.log("Financial Analysis Data (Aggregated):", data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analysis", error);
    }
  };

  // Sync method with form state
  useEffect(() => {
    setValue("bankStatementMethod", method);
  }, [method, setValue]);

  // Generate Link Token when method is set to "link"
  useEffect(() => {
    if (method === "link" && !linkToken) {
      const generateToken = async () => {
        try {
          const response = await fetch("/api/plaid/create_link_token", {
            method: "POST",
          });
          const data = await response.json();
          setLinkToken(data.link_token);
        } catch (error) {
          console.error("Error generating link token:", error);
        }
      };
      generateToken();
    }
  }, [method, linkToken]);

  // Local load state for Plaid analysis (File analysis is handled by parent)
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...files, ...newFiles];

      setFiles(updatedFiles);
      setValue("bankStatements", updatedFiles);

      // Reset analysis when new files are added to force re-analysis
      setValue("bankAnalysis", null);
    }
  };

  // analyzeFiles function removed - moved to parent

  const removeFile = (index: number) => {
    if (isParentAnalyzing) return; // Prevent removal during analysis
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setValue("bankStatements", newFiles);
    setValue("bankAnalysis", null); // Reset analysis on file removal
  };

  const onSuccess = React.useCallback(async (public_token: string) => {
    try {
      const response = await fetch("/api/plaid/exchange_public_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_token }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLinked(true);
        setValue("openBankingLinked", true);
        setValue("plaidConnectionId", data.connection_id);

        // Fetch account details immediately
        setIsAnalyzing(true);
        try {
          await Promise.all([
            fetchAccounts(data.connection_id),
            fetchAnalysis(data.connection_id)
          ]);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  }, [setValue]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const handleDisconnect = () => {
    setIsLinked(false);
    setValue("openBankingLinked", false);
    // You might want to generate a new link token here or reuse logic
  };

  return (
    <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
      {/* Method Toggle */}
      <div className="flex p-1 gap-1 relative self-stretch w-full bg-[#ffffff0a] rounded-xl border border-solid border-[#ffffff33]">
        <button
          type="button"
          onClick={() => setMethod("upload")}
          className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all ${method === "upload"
            ? "bg-[#ffffff1a] shadow-sm text-white font-medium"
            : "text-[#ffffff99] hover:text-white"
            }`}
        >
          <span className="font-['Roobert-Regular',Helvetica] text-sm md:text-base">Upload Files</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod("link")}
          className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all ${method === "link"
            ? "bg-[#ffffff1a] shadow-sm text-white font-medium"
            : "text-[#ffffff99] hover:text-white"
            }`}
        >
          <span className="font-['Roobert-Regular',Helvetica] text-sm md:text-base">Open Banking</span>
        </button>
      </div>

      {method === "upload" ? (
        <div className="flex flex-col items-start gap-4 self-stretch w-full">
          <div className="relative self-stretch w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#ffffff33] rounded-xl cursor-pointer hover:bg-[#ffffff0a] transition-colors bg-[#ffffff05]"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-[#ffffff99]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-[#ffffffcc] font-['Roobert-Regular',Helvetica]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-[#ffffff80] font-['Roobert-Regular',Helvetica]">PDF, CSV (last 6 months)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#ffffff0a] rounded-lg border border-[#ffffff1a]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-[#ffffff1a] flex items-center justify-center text-xs text-white uppercase font-bold shrink-0">
                      {file.name.split('.').pop()}
                    </div>
                    <span className="text-sm text-white truncate font-['Roobert-Regular',Helvetica]">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isParentAnalyzing}
                    className={`p-1.5 rounded-full transition-colors ${isParentAnalyzing ? 'opacity-50 cursor-not-allowed text-[#ffffff66]' : 'hover:bg-[#ffffff1a] text-[#ffffff99] hover:text-white'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Analysis Status for Uploads - Handled by Parent Button Text mostly */}

              {/* Display Analysis Results if available */}
              {watch("bankAnalysis") && (
                <div className="bg-[#ffffff05] p-3 rounded border border-[#00ff9d33]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#00ff9d]"></div>
                    <p className="text-xs text-[#00ff9d] uppercase tracking-wider font-semibold">AI Analysis Complete</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <p className="text-[#ffffff99]">Est. Monthly Income</p>
                      <p className="text-white font-mono">
                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: watch("bankAnalysis").currency_code || 'GBP' }).format(watch("bankAnalysis").average_monthly_income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#ffffff99]">Est. EOD Balance</p>
                      <p className="text-white font-mono">
                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: watch("bankAnalysis").currency_code || 'GBP' }).format(watch("bankAnalysis").average_eod_balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#ffffff99]">Detected Repayments</p>
                      <p className="text-white font-mono">
                        {watch("bankAnalysis").detected_repayments.count} ({watch("bankAnalysis").detected_repayments.lenders.join(', ') || 'None'})
                      </p>
                    </div>
                    <div>
                      <p className="text-[#ffffff99]">Repayment Value</p>
                      <p className="text-white font-mono">
                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: watch("bankAnalysis").currency_code || 'GBP' }).format(watch("bankAnalysis").detected_repayments.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 self-stretch w-full py-4">
          {!isLinked ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-24 h-24 bg-[#ffffff0a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <img
                    src="/assets/plaid-logo.svg"
                    alt="Plaid"
                    className="w-16 h-16 object-contain brightness-0 invert opacity-90"
                    onError={(e) => (e.currentTarget.src = "https://cdn.iconjs.com/icons/icon-files/svg-file/logos/plaid-1.svg")}
                  />
                </div>
                <p className="text-[#ffffffcc] text-sm font-['Roobert-Regular',Helvetica] max-w-[80%] mx-auto">
                  Connect your business bank account securely. We use Plaid to verify your income and speed up your application.
                </p>
              </div>

              <button
                type="button"
                onClick={() => open()}
                disabled={!ready}
                className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-[#121e36] text-white rounded-xl hover:bg-[#1a2b4d] transition-colors border border-[#ffffff33] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!linkToken ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Initializing...</span>
                  </>
                ) : (
                  <span className="font-['Roobert-SemiBold',Helvetica]">
                    {ready ? "Connect Bank Account" : "Loading..."}
                  </span>
                )}
              </button>

              <p className="text-xs text-[#ffffff66] text-center max-w-xs">
                By clicking connect, you agree to Plaid's <a href="#" className="underline hover:text-white">Privacy Policy</a>
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full p-6 bg-[#b0efbd1a] border border-[#b0efbd] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#b0efbd] flex items-center justify-center text-[#121e36]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-white font-['Roobert-SemiBold',Helvetica] text-lg">Account Connected</h3>
                <p className="text-[#ffffffcc] text-sm font-['Roobert-Regular',Helvetica] mb-4">Your business bank account has been successfully linked.</p>

                {/* Account Details Display */}
                {accounts.length > 0 && (
                  <div className="text-left w-full bg-[#ffffff0a] p-3 rounded-lg border border-[#ffffff1a] mb-2">
                    <p className="text-xs text-[#ffffff99] uppercase tracking-wider mb-2">Connected Accounts</p>
                    <div className="flex flex-col gap-2">
                      {accounts.map((acc: any) => (
                        <div key={acc.account_id} className="flex justify-between items-center text-sm">
                          <span className="text-white font-medium">{acc.name}</span>
                          <span className="text-[#ffffff99]">
                            {acc.mask ? `****${acc.mask}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Status */}
                {analysisData ? (
                  <div className="text-left w-full bg-[#ffffff0a] p-3 rounded-lg border border-[#ffffff1a] mb-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00ff9d]"></div>
                      <p className="text-xs text-[#00ff9d] uppercase tracking-wider font-semibold">AI Analysis Complete</p>
                    </div>

                    {analysisData.map((accAnalysis: any, idx: number) => (
                      <div key={idx} className="bg-[#ffffff05] p-3 rounded border border-[#ffffff0a]">
                        <p className="text-sm font-semibold text-white mb-2">{accAnalysis.name} ({accAnalysis.mask ? `****${accAnalysis.mask}` : 'N/A'})</p>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                          <div>
                            <p className="text-[#ffffff99]">Avg. Monthly Income</p>
                            <p className="text-white font-mono">
                              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: accAnalysis.balances.iso_currency_code || 'GBP' }).format(accAnalysis.analysis.average_monthly_income)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#ffffff99]">Avg. EOD Balance</p>
                            <p className="text-white font-mono">
                              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: accAnalysis.balances.iso_currency_code || 'GBP' }).format(accAnalysis.analysis.average_eod_balance)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#ffffff99]">Active Repayments</p>
                            <p className="text-white font-mono">
                              {accAnalysis.analysis.detected_repayments.count} detected
                            </p>
                          </div>
                          <div>
                            <p className="text-[#ffffff99]">Total Repayment Value</p>
                            <p className="text-white font-mono">
                              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: accAnalysis.balances.iso_currency_code || 'GBP' }).format(accAnalysis.analysis.detected_repayments.total_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <p className="text-[10px] text-[#ffffff66] italic">
                      Based on last 12 months of transaction history.
                    </p>
                  </div>
                ) : (
                  isLinked && (
                    <div className="text-left w-full bg-[#ffffff0a] p-3 rounded-lg border border-[#ffffff1a] mb-2 flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-[#ffffff99]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <p className="text-xs text-[#ffffff99]">Analyzing income, repayments, and balances...</p>
                    </div>
                  )
                )}

              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-sm text-[#ffffff99] hover:text-white underline mt-2"
              >
                Disconnect account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
