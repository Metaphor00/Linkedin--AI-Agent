import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { FaCloudUploadAlt, FaTimes, FaPlus } from 'react-icons/fa';

interface FileUploaderProps {
  onChange: (files: File[]) => void;
  onRemove: (index: number) => void;
  files: File[];
  maxFiles?: number;
  maxSizeInMB?: number;
  className?: string;
  accept?: string;
}

export function FileUploader({
  onChange,
  onRemove,
  files,
  maxFiles = 10,
  maxSizeInMB = 5,
  className,
  accept = "image/*"
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList | null): File[] => {
    if (!fileList) return [];
    
    // Convert FileList to array and filter invalid files
    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check if it's an image and not too large
      if (file.type.startsWith('image/') && file.size <= maxSizeInBytes) {
        validFiles.push(file);
      }
    }
    
    // Only add files up to max allowed
    return validFiles.slice(0, maxFiles - files.length);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && files.length < maxFiles) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onChange([...files, ...validFiles]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
    }
    // Reset the input value so the same file can be selected again if removed
    e.target.value = '';
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Create object URLs for previewing images
  const filePreviewUrls = files.map((file) => URL.createObjectURL(file));

  return (
    <div className={className}>
      <div
        className={cn(
          "border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center transition-colors",
          dragActive && "border-[#0077B5] bg-blue-50",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="space-y-4">
          <FaCloudUploadAlt className="mx-auto text-4xl text-[#0077B5]" />
          <div>
            <p className="text-neutral-800 font-medium">Drag and drop image files here</p>
            <p className="text-neutral-600 text-sm">or</p>
          </div>
          <button 
            type="button"
            className="px-4 py-2 bg-[#0077B5] text-white rounded hover:bg-[#005582] transition-colors"
          >
            Browse Files
          </button>
          <p className="text-xs text-neutral-600">Maximum {maxFiles} images, {maxSizeInMB}MB each</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      
      {/* Preview of uploaded photos */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {filePreviewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img 
                src={url} 
                className="h-24 w-24 object-cover rounded-md" 
                alt={`Uploaded file ${index + 1}`} 
              />
              <button 
                type="button"
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <FaTimes />
              </button>
            </div>
          ))}
          
          {files.length < maxFiles && (
            <div 
              className="h-24 w-24 border-2 border-dashed border-neutral-200 rounded-md flex items-center justify-center text-neutral-600 cursor-pointer hover:bg-neutral-50"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <FaPlus />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
