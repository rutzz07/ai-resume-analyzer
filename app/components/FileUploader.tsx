import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '~/lib/utils'; // ✅ import from utils

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0] || null;

    setFile(selectedFile);
    onFileSelect?.(selectedFile);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
  });

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />

        <div
          className={`space-y-4 cursor-pointer text-center ${
            isDragActive ? 'bg-blue-50 border border-blue-400' : ''
          }`}
        >
          {file ? (
            <div
              className="uploader-selected-file flex items-center justify-between p-3 border rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <img src="/images/pdf.png" alt="pdf" className="size-10" />

                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSize(file.size)} {/* ✅ from utils */}
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <button
                className="p-2 cursor-pointer hover:bg-red-100 rounded-full transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  onFileSelect?.(null);
                }}
              >
                <img
                  src="/icons/cross.svg"
                  alt="remove"
                  className="w-4 h-4"
                />
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <img
                  src="/icons/info.svg"
                  alt="upload"
                  className="size-20"
                />
              </div>

              <p className="text-lg text-gray-500">
                <span className="font-semibold">
                  {isDragActive ? "Drop file here..." : "Click to upload"}
                </span>{" "}
                or drag and drop
              </p>

              <p className="text-sm text-gray-500">
                PDF (max 20 MB)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;