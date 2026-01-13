"use client";

import React, { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

export const BankStatementsStep = () => {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Watch the file field to allow displaying selected files
  const uploadedFiles = watch("bankStatements");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // For simplicity, we'll just set the files in the form state.
    // In a real app, you might want to append duplicates or handle max size here.
    setValue("bankStatements", Array.from(files), { shouldValidate: true });
  };

  const removeFile = (index: number) => {
    const currentFiles = (uploadedFiles as File[]) || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    setValue("bankStatements", newFiles.length > 0 ? newFiles : undefined, { shouldValidate: true });
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      <div className="flex flex-col gap-2">
        <p className="font-['Roobert-Regular',Helvetica] text-sm text-[#ffffffcc] leading-relaxed">
          Please upload the <span className="text-white font-semibold">last 6 months</span> of business bank statements.
          <br />
          <span className="text-xs opacity-70">Accepted formats: PDF, CSV</span>
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative flex flex-col items-center justify-center w-full p-8 border border-dashed rounded-xl transition-all duration-200 ${dragActive
          ? "border-[#b0efbd] bg-[#b0efbd]/5 scale-[0.99]"
          : "border-[#ffffff33] bg-[#ffffff05] hover:bg-[#ffffff0a] hover:border-[#ffffff66]"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.csv"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-full bg-[#ffffff0f]">
            <Upload className="w-6 h-6 text-[#b0efbd]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-white font-['Roobert-SemiBold',Helvetica] text-md">
              Click to upload or drag and drop
            </p>
            <p className="text-[#ffffffcc] text-sm">
              PDF or CSV (max 10MB)
            </p>
          </div>
          <button
            type="button"
            onClick={onButtonClick}
            className="mt-2 px-4 py-2 rounded-xl bg-[#ffffff1a] hover:bg-[#ffffff2a] text-white text-sm font-medium transition-colors border border-[#ffffff1a]"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles && Array.isArray(uploadedFiles) && uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-sm text-[#ffffffcc] font-medium px-1">Selected Files:</p>
          {uploadedFiles.map((file: File, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-[#b0efbd] shrink-0" />
                <span className="text-sm text-white truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-[#ffffffcc] shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-[#ffffff1a] rounded-full text-[#ffffffcc] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
