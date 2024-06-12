import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

interface Document {
  id: string;
  name: string;
  section: string;
  uploaded: boolean;
  validating: boolean;
  validated: boolean;
  fileName: string;
}

interface RequiredDocumentComponentProps {
  documents: Document[];
  onFileUpload: (index: number, file: File) => void;
  section: string;
}

export function RequiredDocumentComponent({ documents, onFileUpload, section }: RequiredDocumentComponentProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDocumentClick = (doc: Document) => {
    const index = documents.findIndex((d) => d.id === doc.id);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, doc: Document) => {
    const index = documents.findIndex((d) => d.id === doc.id);
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(index, file);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto py-8 px-4 md:px-6">
      <div className="space-y-4">
        <div className="space-y-1">
          {documents
            .filter((doc) => doc.section === section)
            .map((doc) => {
              const originalIndex = documents.findIndex((d) => d.id === doc.id);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md bg-white border-[#7d6430] border-2 border-opacity-30 px-4 py-2 dark:bg-gray-800 cursor-pointer"
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-sm">{doc.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.uploaded ? (
                      <>
                        {doc.validating ? (
                          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                        ) : doc.validated ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : null}
                        <span className="text-sm text-gray-500 dark:text-gray-400">{doc.fileName}</span>
                      </>
                    ) : (
                      <span className="text-sm text-red-500 dark:text-red-400">Not uploaded</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[originalIndex] = el;
                    }}
                    className="hidden"
                    onChange={(event) => handleFileChange(event, doc)}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
