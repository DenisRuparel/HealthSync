"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
};

export const FileUploader = ({ files, onChange }: FileUploaderProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any) => {
      if (rejectedFiles.length > 0) {
        const errorMessages = rejectedFiles.map((file: any) => {
          if (file.errors[0]?.code === "file-invalid-type") {
            return "Invalid file type. Only JPG, PNG, and PDF are allowed.";
          } else if (file.errors[0]?.code === "file-too-large") {
            return "File size must be under 2MB.";
          }
          return "Invalid file.";
        });

        setError(errorMessages.join(" "));
        return;
      }

      setError(null);
      onChange(acceptedFiles);
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  return (
    <div {...getRootProps()} className="file-upload">
      <input {...getInputProps()} />
      {files && files.length > 0 ? (
        <Image
          src={convertFileToUrl(files[0])}
          width={1000}
          height={1000}
          alt="uploaded image"
          className="max-h-[400px] overflow-hidden object-cover"
        />
      ) : (
        <>
          <Image
            src="/assets/icons/upload.svg"
            width={40}
            height={40}
            alt="upload"
          />
          <div className="file-upload_label">
            <p className="text-14-regular ">
              <span className="text-green-500">Click to upload </span>
              or drag and drop
            </p>
            <p className="text-12-regular">PNG, JPG & PDF (max. 2MB)</p>
          </div>
        </>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};