'use client';

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef, use } from 'react';
import { useSearchParams } from 'next/navigation'

//const prompt = `Please note that todays date is: {date} and format it nicely - and try your hardest to fill out this template for {person} - also make sure that you remove all section headers in response: *[date]* USCIS 2500 Westfield Drive Elgin, IL 60124-7836 **Overview** Dear Sir or Madam, *Overview of petitioner's career trajectory* *Information about where to find biographic information and current immigration status (i.e. exhibit A, pages X)* **Beneficiary's specialization** *Overview of petitioner’s role and its importance.* ***U.S. Position*** *Information about the job the petitioner will have after receiving permanent status and its importance. Include the name of the company, the company description, the role description, and the responsibilities.* **Summary of beneficiary's extraordinary ability** *This is the section to list all criteria that the petitioner qualifies for, and a brief description of it. Example below:* - *Command a high salary or other significantly high remuneration in relation to others in the field* - *Mr. John has earned a salary x% higher than the average salary in the field.* **Evidence demonstrating beneficiary’s eligibility** *This section is a follow-up to the previous one. This is where we show evidence for all the criteria mentioned above. Example below:* - *Command a high salary or other significantly high remuneration in relation to others in the field* - *Mr. John earns X amount at this company. The average person in the same field earns Y.* **Substantial and prospective benefits to the U.S.** *The goal of this section is to make the case that the beneficiary's specialization and role will contribute to the U.S. economy and is of high importance. Include information about the market, its growth, and how the beneficiary's role contributes to it.* **Conclusion** *Summarize all the arguments above (i.e. he meets x/10 criteria, his role is important, etc.); and respectfully request the approval of the petition.* Sincerely, *Name of the firm* *Name of the attorney* *Signature of the attorney*`

const prompt = `You are a legal assistant, skilled in the rules and regulations of immigration law. Your goal is to produce a high-quality support letter for a person whose context and information you have about this person - do not make any details up. Your goal is to leverage that context to draft the support document. The rough outline is below, but you should expand on each of those sections. For example, the introduction should be accurate, relevant, and provide examples of the particular candidate. The suggested criteria should be listed out based on the context information that you have and can use for the most persuasive case.

Please note that today's date is: {date} and format it nicely. Use the provided documents to use the rough template below for {person}, ensuring you include specific evidence and details relevant to the individual. Remove all section headers in the response. Make sure to extract and include specific details such as salary, job titles, and company names from the supporting documents provided.

*[date]*

Before fillout out the template: build a comprehensive understanding of the person's career trajectory, profile, specialization, and the job they will have after receiving permanent status. Use this information to craft a compelling support letter that highlights the person's extraordinary ability and the benefits they bring to the U.S. economy.

USCIS
2500 Westfield Drive
Elgin, IL 60124-7836

Dear Sir or Madam,

{person}'s career has been marked by significant achievements and milestones. They have demonstrated exceptional expertise and contributions in their field, as evidenced by their numerous awards and recognitions. According to the biographic information and current immigration status found in the supporting documents (e.g., Exhibit A, pages X), {person} has consistently excelled in their professional endeavors.

{person} specializes in {specific field or industry}, where they have played a pivotal role in advancing knowledge and innovation. Their unique skills and contributions have set them apart from their peers. For instance, {person} has developed groundbreaking techniques in {specific area}, which have been widely adopted and praised within the industry.

Upon receiving permanent status, {person} will join {Company Name}, a leading organization in {industry}. {Company Name} is renowned for its commitment to excellence and innovation. In their new role as {Job Title}, {person} will be responsible for {brief role description and responsibilities}. This position is crucial to the company's continued success and growth, as {person}'s expertise will drive key projects and initiatives forward.

{person} meets several criteria for extraordinary ability, including:

List out the most relevant criteria based on the context information you have. For example:
- Command a high salary or other significantly high remuneration in relation to others in the field

Sincerely,

{Name of the firm}
{Name of the attorney}
{Signature of the attorney}`;


export function DocumentEditor() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  type Message = {
    text: string;
    sender: string;
    timestamp: number;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'default';
  const cid = atob(id as string);

  const [documentContent, setDocumentContent] = useState(() => {
    // Load documentContent from localStorage when initializing state
    return localStorage.getItem(`documentContent-${id}`) || '';
  });

  useEffect(() => {
    // Save documentContent to localStorage whenever it changes
    localStorage.setItem(`documentContent-${id}`, documentContent);
    if (documentContent === '') {
      getLetterDraft();
    }
  }, [documentContent, getLetterDraft, id]);

  const handlePlayClick = () => {
    // Clear documentContent to trigger useEffect
    setDocumentContent('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const handleCursorPosition = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentContent(e.target.value);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleMoveToDocument = (messageText: string) => {
    setDocumentContent(prevContent => {
      const position = cursorPosition !== null ? cursorPosition : prevContent.length;
      const start = prevContent.slice(0, position);
      const end = prevContent.slice(position);
      return start + '\n' + messageText + end;
    });
  };

  const handlePlaceholderClick = (placeholder: string) => {
    // Handle the click event here
    console.log(`Placeholder clicked: ${placeholder}`);
  };

  async function getLetterDraft() {
    setDocumentLoading(true);
    try {
      const message = prompt.replace(/\{person\}/g, 'eduardo');
      const message2 = message.replace(/\{date\}/g, new Date().toLocaleDateString('en-US'));
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ cid, q: message2 }),
      });
      const data = await response.json();
      // Update the component state with the fetched data
      // For example, you can set it to the response data
      setDocumentContent(data.a);
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Error fetching data:', error);
    } finally {
      setDocumentLoading(false);
      const botMessage = { text: "Let me know if I can help change anything :)", sender: 'bot', timestamp: Date.now() };
      setMessages((prevMessages) => {
        const isMessageAlreadyExists = prevMessages.some(
          (message) => message.text === botMessage.text && message.sender === botMessage.sender
        );

        if (!isMessageAlreadyExists) {
          const newMessages = [...prevMessages, botMessage];
          if (typeof window !== 'undefined') {
            localStorage.setItem('messages', JSON.stringify(newMessages));
          }
          return newMessages;
        } else {
          return prevMessages;
        }
      });
    }
  }

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInput('');
    setIsLoading(true);

    const userMessage = { text: input, sender: 'user', timestamp: Date.now() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ cid, q: input }),
    });
    
    const data = await response.json();
    const botMessage = { text: data.a, sender: 'bot', timestamp: Date.now() };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setIsLoading(false);

  };

  const renderContent = () => {
    return documentContent.split(/\[(.*?)\]/).map((part, index) => {
      if (index % 2 === 0) {
        return part;
      } else {
        return (
          <span
            key={index}
            style={{ backgroundColor: '#ddd', cursor: 'pointer' }}
            onClick={() => handlePlaceholderClick(part)}
          >
            {part}
          </span>
        );
      }
    });
  };


  return (
    <div key="1" className="flex" style={{ height: 'calc(100vh - 8rem)' }}>
      <div className="w-4/6 flex flex-col h-full pl-6 pt-6 pr-6 pb-6 bg-[#FCFCF7] dark:bg-gray-800 overflow-hidden">
        <div className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-[#FCFCF7] rounded-t-lg dark:bg-gray-700">
            <div className="flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-200">Document.txt</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handlePlayClick} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" size="sm" variant="ghost">
                <PlayIcon />
                <span className="sr-only">Regenerate</span>
              </Button>
              <Button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" size="sm" variant="ghost">
                <SaveIcon className="w-4 h-4" />
                <span className="sr-only">Save</span>
              </Button>
              <Button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" size="sm" variant="ghost">
                <DownloadIcon className="w-4 h-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-white rounded-b-lg dark:bg-gray-800" style={{ position: 'relative' }}>
            {/*             <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
                padding: '1em', // Same padding as textarea
                overflowY: 'auto', // Enable scrolling
                whiteSpace: 'pre-wrap', // Preserve line breaks and spaces
                wordWrap: 'break-word', // Enable long word breaking
                fontSize: '1em', // Same font size as textarea
                lineHeight: '1.2em', // Same line height as textarea
                color: 'transparent' // Hide the text
              }}
              dangerouslySetInnerHTML={{
                __html: documentContent.replace(/(\[.*?\])/g, (match, placeholder) => `<span style="background-color: #ddd; cursor: pointer; color: black; pointer-events: auto;" onclick="handlePlaceholderClick('${placeholder}')">${placeholder}</span>`),
              }}
            /> */}
            <Textarea
              className="w-full h-full resize-none border-none focus:outline-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
              value={documentContent}
              onChange={handleChange}
              onMouseUp={handleMouseUp}
              placeholder="Start typing..."
              style={{
                background: 'transparent',
                zIndex: 1,
                padding: '1em', // Same padding as div
                fontSize: '1em', // Same font size as div
                lineHeight: '1.2em', // Same line height as div
              }}
            />
            {documentLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)', // Semi-transparent background
                  zIndex: 2,
                }}
              >
                <Spinner /> {/* Replace with your spinner component */}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-2/6 flex flex-col h-full pt-6 pl-6 pr-6 pb-6 bg-gray shadow dark:bg-gray-800 relative" style={{ height: 'calc(100vh - 8rem)' }}>
        <header className="flex items-center justify-between px-4 py-4 bg-white shadow dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <BotIcon className="w-8 h-8 text-red-900 dark:text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight">Pravina AI Bot</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Let&apos;s help you draft a support letter!</p>
        </header>
        <main className="flex-1 overflow-auto pb-20">
          <div className="flex flex-col space-y-4 pb-4 mt-4">
            {messages.map((message, index) => (
              <div key={index} className={message.sender === 'user' ? 'p-4 m-4 text-sm bg-gray-200 rounded-lg  max-w-[95%] shadow-md dark:bg-gray-700 dark:text-gray-200' : 'p-4 text-sm bg-blue-50 rounded-lg  max-w-[95%] shadow-md dark:bg-gray-700 dark:text-gray-200'}>
                <p>{message.text}</p>
                {message.sender === 'bot' && (
                  <Button onClick={() => handleMoveToDocument(message.text)} className="text-blue-500 hover:text-blue-600" size="sm" variant="ghost">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span className="sr-only">Move to document</span>
                  </Button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="absolute bottom-0 inset-x-0 px-4 py-4 bg-white shadow dark:bg-gray-800">
          <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => handleSubmit(event)} className="flex w-full gap-2">
            <Input className="flex-grow px-4 py-2 rounded-md bg-[#FCFCF7] text-gray-800 dark:bg-gray-700 dark:text-gray-200" placeholder="Type your question..." type="text" value={input} onChange={(event) => setInput(event.target.value)} />
            <Button
              className={`px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              variant="outline"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? <Spinner /> : <SendIcon className="w-5 h-5" />}
              <span className="sr-only">Send message</span>
            </Button>
            <Button className="px-4 py-2 rounded-md bg-red-900 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" color="red" variant="outline">
              <TrashIcon className="w-5 h-5" />
              <span className="sr-only">Clear chat</span>
            </Button>
          </form>
        </footer>
      </div>
    </div>
  )
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}




function Spinner() {
  return (
    <div className="spinner">
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border-left-color: white;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
function PlayIcon() {
  return (
    <div className="playIcon">
      <style jsx>{`
        .playIcon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="24"
        height="24"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </div>
  );
}


function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 12H5" />
      <path d="m12 19 -7 -7 7 -7" />
    </svg>
  )
}

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}


function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
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
  )
}


function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  )
}


function SendIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}


function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}
