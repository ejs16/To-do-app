import React from 'react';

interface TimelineComponentProps {
  steps: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completedSteps: Set<number>;
  toggleCompletion: (index: number) => void;
}

export function TimelineComponent({
  steps,
  currentStep,
  setCurrentStep,
  completedSteps,
  toggleCompletion,
}: TimelineComponentProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex w-full max-w-6xl items-center justify-between">
        <div className="absolute inset-x-0 left-0 right-0 flex items-center justify-between">
          <div className="h-1 rounded-md flex-1 bg-gray-300 dark:bg-gray-700" />
        </div>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`z-10 flex flex-col items-center ${currentStep === index ? 'text-black' : ''}`}
            onClick={() => toggleCompletion(index)}
          >
            <div
              className={`mb-4 m-16 aspect-square w-8 rounded-full p-2 ${
                currentStep === index
                  ? 'bg-gray-700 border-2 border-white'
                  : completedSteps.has(index)
                  ? 'bg-[#7D6430]'
                  : 'bg-gray-500'
              } text-gray-50 dark:bg-gray-50 dark:text-gray-900`}
            >
              {!completedSteps.has(index) ? (
                index === steps.length - 1 ? (
                  <CircleIcon className="h-full w-full" />
                ) : (
                  <XIcon className="h-full w-full" />
                )
              ) : (
                <CheckIcon className="h-full w-full" />
              )}
            </div>
            <div className="text-sm font-medium">{step}</div>
          </div>
        ))}
      </div>
    </div>
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

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
