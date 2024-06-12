'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from './ui/progress';
import { useRouter } from 'next/navigation';


export function FileUpload({uploadedFilePath, setUploadedFilePath}: {uploadedFilePath: string, setUploadedFilePath: (uploadedFilePath: string) => void}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePath, setFilePath] = useState('');
  const Router = useRouter();
  const [isProcessButtonEnabled, setIsProcessButtonEnabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      uploadFile(event.target.files[0]);
    }
  };
  
  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.items && event.dataTransfer.items[0]) {
      const entry = event.dataTransfer.items[0].webkitGetAsEntry() as FileSystemFileEntry;
      if (entry && entry.isFile) {
        entry.file(file => {
          setSelectedFile(file);
          uploadFile(file);
        });
      }
    }
  };
  
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadFile = (file: File) => {
    // First, get the signed URL from the server
    fetch('/api/getSignedUrl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Then, use the signed URL to upload the file
        const signedUrl = data.signedUrl;
        return fetch(signedUrl, {
          method: 'PUT',
          body: file,
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // File upload was successful
        setFilePath(file.name);
        setUploadedFilePath(file.name);
        setIsProcessButtonEnabled(true);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="flex flex-col items-center p-4 justify-center">
      <div className="max-w-md w-full space-y-4">
        <div className="space-y-2 justify-center items-center">
          <h2 className="text-3xl font-bold tracking-tighter">Upload Documents</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Drag and drop your files here or click to browse your local files.
          </p>
        </div>
        <div 
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        {selectedFile ? (
          <span className="font-semibold">{selectedFile.name}</span>
        ) : (
          <>
            <span className="font-semibold">Click to upload </span>
            or drag and drop{"\n"}
          </>
        )}
      </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ZIP files only</p>
          </div>
          <Input 
            onChange={onFileChange}
            className="sr-only" 
            id="file-upload" 
            multiple 
            name="file-upload" 
            type="file" 
          />
        </div>
        <Progress value={uploadProgress} />
{/*         <Button className="w-full" type="submit" onClick={processZipFile} disabled={!isProcessButtonEnabled}>
          Process Documents
        </Button> */}
      </div>
    </div>
  )
}

// ... rest of your code
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}
