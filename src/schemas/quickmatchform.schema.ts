import { z } from "zod";

export const quickMatchSchema = z.object({
  // Step 1: Business Type (Assumed from existing context, though not explicitly in previous file)
  businessType: z.enum(["limited_company", "sole_trader", "partnership", "other"]).optional(), // Adjust based on actual values

  // Step 2: Business Details (Limited Company)
  companyName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  registeredAddress: z.string().optional(),

  // Step 2: Business Details (Sole Trader)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tradingName: z.string().optional(),
  timeTrading: z.string().optional(), // e.g. "1 year", "2 years"

  // Step 3: Director Details (Limited Company)
  directorName: z.string().optional(),
  directorDateOfBirth: z.string().optional(), // String date from input type="date"

  // Step 3: Personal Details (Sole Trader) - re-uses residentialAddress, homeOwnerStatus, and directorDateOfBirth (as dateOfBirth)
  // We can alias or just use the same field names where semantic meaning overlaps, or add specific ones.
  // Using specific ones for clarity if needed, but 'residentialAddress' and 'homeOwnerStatus' are shared concepts.
  residentialAddress: z.string().optional(),
  homeOwnerStatus: z.boolean().optional(),

  // Step 4: Contact Details (Common)
  email: z.string().email("Invalid email address").optional(), // specific validation but optional until step reached
  mobileNumber: z.string().min(10, "Invalid mobile number").optional(),

  // Step 5: Funding Amount (Common)
  fundingAmount: z.string().optional(),
  fundingAmountCustom: z.string().optional(),

  // Step 6: Credit Check Consent
  consentCreditCheck: z.boolean().refine(val => val === true, {
    message: "You must consent to the credit check to proceed"
  }),

  // Step 7: Bank Statements
  // We'll validate the presence of files in the component or use custom validation if needed.
  // Storing as any for now to hold FileList or Array<File>
  bankStatements: z.any().optional(),
});

export type QuickMatchFormData = z.infer<typeof quickMatchSchema>;
