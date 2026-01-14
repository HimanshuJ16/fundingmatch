import { z } from "zod";

export const quickMatchSchema = z.object({
  // Step 1: Business Type (Assumed from existing context, though not explicitly in previous file)
  businessType: z.enum(["limited_company", "sole_trader", "partnership", "other"]).optional(), // Adjust based on actual values

  // Step 2: Business Details (Limited Company)
  // Step 2: Business Details (Limited Company)
  companyName: z.string().min(1, "Company name is required"),
  companyRegistrationNumber: z.string().min(1, "Company number is required"),
  registeredAddress: z.string().min(1, "Address is required"),

  // Step 2: Business Details (Sole Trader)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  tradingName: z.string().min(1, "Trading name is required"),
  timeTrading: z.string().min(1, "Time trading is required"), // e.g. "1 year", "2 years"

  // Step 3: Director Details (Limited Company)
  directorName: z.string().min(1, "Director name is required"),
  directorDateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth")
    .refine((val) => {
      const date = new Date(val);
      const year = date.getFullYear();
      const now = new Date();
      const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
      return year > 1900 && date <= eighteenYearsAgo;
    }, "You must be at least 18 years old and enter a valid year"),

  // Step 3: Personal Details (Sole Trader) - re-uses residentialAddress, homeOwnerStatus, and directorDateOfBirth (as dateOfBirth)
  // We can alias or just use the same field names where semantic meaning overlaps, or add specific ones.
  // Using specific ones for clarity if needed, but 'residentialAddress' and 'homeOwnerStatus' are shared concepts.
  residentialAddress: z.string().min(1, "Residential address is required"),
  homeOwnerStatus: z.boolean().optional(),

  // Step 4: Contact Details (Common)
  // Step 4: Contact Details (Common)
  email: z.string().min(1, "Email address is required").email("Invalid email address"),
  mobileNumber: z.string().min(1, "Mobile number is required").min(10, "Invalid mobile number"),

  // Step 5: Funding Amount (Common)
  fundingAmount: z.string().min(1, "Funding amount is required"),
  fundingAmountCustom: z.string().optional(),

  // Step 6: Credit Check Consent
  consentCreditCheck: z.boolean().refine(val => val === true, {
    message: "You must consent to the credit check to proceed"
  }),

  // Step 7: Bank Statements
  // We'll validate the presence of files in the component or use custom validation if needed.
  // Storing as any for now to hold FileList or Array<File>
  bankStatements: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.fundingAmount === "Custom" && (!data.fundingAmountCustom || data.fundingAmountCustom.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a custom amount",
      path: ["fundingAmountCustom"],
    });
  }
});

export type QuickMatchFormData = z.infer<typeof quickMatchSchema>;
