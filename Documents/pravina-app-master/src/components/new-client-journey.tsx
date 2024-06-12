'use client';

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RequiredDocumentComponent } from '@/components/required-document-component';
import { TimelineComponent } from "./timeline-component";

export function NewClientJourney({ session }: { session: any }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [firstItemFilled, setFirstItemFilled] = useState(false);
  const [lastItemFilled, setLastItemFilled] = useState(false);
  const [letterTypeFilled, setLetterTypeFilled] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState('');
  const currentSession = session;
  const [currentClientId, setCurrentClientId] = useState('');
  const [firstError, setFirstError] = useState('');
  const [lastError, setLastError] = useState('');
  const [letterTypeError, setLetterTypeError] = useState('');

  const [first, setFirst] = useState<string>('');
  const [last, setLast] = useState<string>('');
  const [letterType, setLetterType] = useState<string>('');
  const [basicValidated, setBasicValidated] = useState<boolean>(false);
  const [evidenceValidated, setEvidenceValidated] = useState<boolean>(false);

  const steps = ['Name', 'Visa Type', 'Documents', 'Evidence', 'Support Letter'];
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());


  const [documents, setDocuments] = useState([
    { id: 'res', name: 'Resume', uploaded: false, fileName: '', fileId: '', validated: false, required: true, section: 'Basic', validating: false },
    { id: 'pp', name: 'Passport', uploaded: false, fileName: '', fileId: '', validated: false, required: true, section: 'Basic', validating: false },
    { id: 'visa', name: 'Visa', uploaded: false, fileName: '', fileId: '', validated: false, required: true, section: 'Basic', validating: false },
    { id: '94', name: 'I-94', uploaded: false, fileName: '', fileId: '', validated: false, required: false, section: 'Basic', validating: false },
    { id: 'ev1', name: 'Evidence 1', uploaded: false, fileName: '', fileId: '', validated: false, required: false, section: 'Evidence', validating: false },
    { id: 'ev2', name: 'Evidence 2', uploaded: false, fileName: '', fileId: '', validated: false, required: false, section: 'Evidence', validating: false },
    { id: 'ev3', name: 'Evidence 3', uploaded: false, fileName: '', fileId: '', validated: false, required: false, section: 'Evidence', validating: false },
    { id: 'ev4', name: 'Evidence 4', uploaded: false, fileName: '', fileId: '', validated: false, required: false, section: 'Evidence', validating: false },
  ]);

  const [processing, setProcessing] = useState({});

  const handleFileUpload = (index: number, file: File) => {
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
          headers: {
            'Content-Type': file.type, // Set the correct content type for the upload
          },
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // File upload was successful
        // Call /api/upload with the S3 URL
        return fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            s3Url: response.url,
            cid: currentClientId,
            name: file.name,
            fileSize: file.size,
          }),
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const newDocument = {
          ...documents[index],
          fileName: file.name,
          uploaded: true,
          fileId: data.id, // Assuming the file name is used as the ID
          validating: true,
        };
        setDocuments(prevDocuments => {
          const newDocuments = [...prevDocuments];
          newDocuments[index] = newDocument;
          return newDocuments;
        });
        processFile(data.id);
        console.log("File uploaded successfully");
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const processFile = async (id: string) => {
    try {
      setProcessing(prevState => ({ ...prevState, [id]: true }));
  
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, clientId: currentClientId }),
      });
  
      if (!response.ok) {
        throw new Error('Error processing file');
      }
  
      const data = await response.json();
      const taskId = data.taskId;
  
      if (taskId) {
        const intervalId = setInterval(() => {
          fetch(`/api/process-status?taskId=${taskId}`)
            .then(response => response.json())
            .then(async data => {
              if (data.status === 'completed') {
                clearInterval(intervalId);
                const file = await getFile(id);
                console.log(file);
                setDocuments(prevDocuments => prevDocuments.map(doc => {
                  if (doc.fileId === id) {
                    return {
                      ...doc,
                      processed: true,
                      validating: false,
                      validated: doc.name === file.category,
                    };
                  }
                  return doc;
                }));
                setProcessing(prevState => ({ ...prevState, [id]: false }));
              }
            });
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setProcessing(prevState => ({ ...prevState, [id]: false }));
    }
  };
  

  const getFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files?fileId=${fileId}`);
      if (response.ok) {
        const file = await response.json();
        return file;
      } else {
        throw new Error('Error fetching file');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  

  const toggleCompletion = (stepIndex: number) => {
    setCompletedSteps((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };
  

  useEffect(() => {
    // if first name is already filled, set firstItemFilled to true
    if (first.trim() !== '') {
      setFirstItemFilled(true);
      setFirstError('');
    } else {
      setFirstItemFilled(false);
    }

    // if last name is already filled, set lastItemFilled to true
    if (last.trim() !== '') {
      setLastItemFilled(true);
      setLastError('');
    } else {
      setLastItemFilled(false);
    }

    // if letter type is already filled, set letterTypeFilled to true
    if (letterType.trim() !== '') {
      setLetterTypeFilled(true);
      setLetterTypeError('');
    } else {
      setLetterTypeFilled(false);
    }

    let isAllValidated = true;
    if (currentCard === 2) {
      documents.forEach(doc => {
        if (doc.section === 'Basic' && doc.required && !doc.validated) {
          isAllValidated = false;
        }
      });
      setBasicValidated(isAllValidated);
    }

    if (currentCard === 3) {
      documents.forEach(doc => {
        if (doc.section === 'Evidence' && doc.required && !doc.validated) {
          isAllValidated = false;
        }
      });
      setEvidenceValidated(isAllValidated);
    }
  }, [first, last, letterType, currentCard, documents]);

  const router = useRouter();

  if (!currentSession) {
    return <div>Unauthorized</div>;
  }

  const validateForm = (currentCard: number): boolean => {
    if (currentCard === 0) {
      return first.trim() !== '' && last.trim() !== '';
    }
    if (currentCard === 1) {
      return letterType.trim() !== '';
    }
    if (currentCard === 2) {
      return basicValidated;
    }
    if (currentCard === 3) {
      return evidenceValidated;
    }
    return true;
  };
  

  const saveClientRecord = () => {
    fetch('api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: currentClientId.trim() === '' ? '' : currentClientId,
        first: first.trim() === '' ? 'n/a' : first,
        last: last.trim() === '' ? 'n/a' : last,
        letterType: letterType.trim() === '' ? 'n/a' : letterType,
        uploadedFilePath,
      })
    })
      .then(response => {
        if (response.ok) {
          console.log('Data saved successfully');
          response.json().then(data => {
            const encodedId = btoa(data);
            setCurrentClientId(data);
            //router.push(`/processing/?id=${encodedId}`);
          });
        } else {
          console.log('Failed to save data');
        }
      })
      .catch(error => {
        console.error('Error saving data:', error);
      });
  };

  const saveAndRedirect = () => {
    fetch('api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first,
        last,
        letterType,
        uploadedFilePath,
      })
    })
      .then(response => {
        if (response.ok) {
          console.log('Data saved successfully');
          response.json().then(data => {
            const encodedId = btoa(data);
            router.push(`/processing/?id=${encodedId}`);
          });
        } else {
          console.log('Failed to save data');
        }
      })
      .catch(error => {
        console.error('Error saving data:', error);
      });
  };

  const handleLetterTypeButtonClick = (type: string) => {
    setLetterType(type);
    setLetterTypeFilled(true);
  };
  

  const handleNextClick = () => {
    if (!validateForm(currentCard)) {
      return;
    }

    if (currentCard === 1) {
      saveClientRecord();
    }

    setCurrentCard((currentCard + 1) % cards.length);
    setCurrentStep((currentCard + 1) % cards.length);

    updateCompletedSteps(firstItemFilled && lastItemFilled, 0);
    updateCompletedSteps(letterTypeFilled, 1);
    updateCompletedSteps(basicValidated, 2);
    updateCompletedSteps(evidenceValidated, 3);
  };

  const handleGenerateLetter = () => {
    const encodedId = btoa(currentClientId);
    router.push(`/editor/?id=${encodedId}`);
  };

  const updateCompletedSteps = (condition: boolean, currentCard: number) => {
    if (condition) {
      setCompletedSteps((prev) => new Set([...Array.from(prev), currentCard]));
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentCard);
        return newSet;
      });
    }
  };
  

  const handlePreviousClick = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setCurrentStep(currentCard - 1);
    }

    updateCompletedSteps(firstItemFilled && lastItemFilled, 0);
    updateCompletedSteps(letterTypeFilled, 1);
  };

  const cards = [
    <div key="card-0" className="w-[500px] h-[500px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#082940]">Client Details</CardTitle>
          <CardDescription>Enter client information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#082940]" htmlFor="first">First Name</Label>
            <Input id="first" placeholder="First" value={first} onChange={e => setFirst(e.target.value)} />
            {firstError && <div className="text-red-600 text-sm justify-center flex">{firstError}</div>}
          </div>
          <div className="space-y-2">
            <Label className="text-[#082940]" htmlFor="last">Last Name</Label>
            <Input id="last" placeholder="Last" value={last} onChange={e => setLast(e.target.value)} />
            {lastError && <div className="text-red-600 text-sm justify-center flex">{lastError}</div>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={handlePreviousClick} variant="outline">Back</Button>
          <Button onClick={handleNextClick} variant="outline">Next</Button>
        </CardFooter>
      </Card>
    </div>,
    <div key="card-1" className="w-[500px] h-[500px]">
      <Card className="w-150 h-150">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#082940]">What type of visa is {first} applying for?</CardTitle>
          <CardDescription className="text-center mt-2">
            Lorem ipsum dolor sit amet consectetur. Eget nec pharetra turpis velit lectus sit. Mattis erat quis sed ultrices aliquam cras. Vulputate nec.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant={letterType === 'EB1' ? 'default' : 'outline'}
              onClick={() => handleLetterTypeButtonClick('EB1')}
            >
              EB1
            </Button>
            <Button disabled={true}
              variant={letterType === 'H1B' ? 'default' : 'outline'}
              onClick={() => handleLetterTypeButtonClick('H1B')}
            >
              H1B
            </Button>
            <Button disabled={true}
              variant={letterType === 'O1' ? 'default' : 'outline'}
              onClick={() => handleLetterTypeButtonClick('O1')}
            >
              O1
            </Button>
            <Button disabled={true}
              variant={letterType === 'Other' ? 'default' : 'outline'}
              onClick={() => handleLetterTypeButtonClick('Other')}
            >
              Other
            </Button>
          </div>
          {letterTypeError && <div className="text-red-600 text-sm justify-center flex">{letterTypeError}</div>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 mt-4">
          <Button onClick={handlePreviousClick} variant="outline">Back</Button>
          <Button onClick={handleNextClick} variant="outline">Next</Button>
        </CardFooter>
      </Card>
    </div>,
    <div key="card-2" className="w-[500px] h-[500px]">
      <Card className="w-150 h-150">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#082940]">Basic Documents</CardTitle>
          <CardDescription className="text-center mt-2">
            Great! Now let&apos;s upload he basic documents, please include the following:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <RequiredDocumentComponent documents={documents} section='Basic' onFileUpload={handleFileUpload} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={handlePreviousClick} variant="outline">Back</Button>
          <Button onClick={handleNextClick} variant="outline">Next</Button>
        </CardFooter>
      </Card>
    </div>,
    <div key="card-3" className="w-[500px] h-[500px]">
      <Card className="w-150 h-150">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#082940]">Evidence Documents</CardTitle>
          <CardDescription className="text-center mt-2">
            Great! Now let&apos;s upload the evidence documents, please include the following:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <RequiredDocumentComponent documents={documents} section='Evidence' onFileUpload={handleFileUpload} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={handlePreviousClick} variant="outline">Back</Button>
          <Button onClick={handleNextClick} variant="outline">Next</Button>
        </CardFooter>
      </Card>
    </div>,
    <div key="card-4" className="w-[500px] h-[500px]">
      <Card className="w-150 h-150">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Letter Generation</CardTitle>
          <CardDescription className="text-center mt-2">
            Great! Now let&apos;s generate the support letter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button onClick={handleGenerateLetter} variant="outline">Generate Letter</Button>
        </CardFooter>
      </Card>
    </div>,
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center " style={{ height: 'calc(100vh - 8rem)' }}>
        <div className="mt-8 flex w-full max-w-4xl justify-center">
          {cards[currentCard]}
        </div>
        <div className="mt-4">
          <TimelineComponent
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            completedSteps={completedSteps}
            toggleCompletion={toggleCompletion}
          />
        </div>
      </div>
    </>
  );
}

function CheckIcon(props: any) {
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

function XIcon(props: any) {
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
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
