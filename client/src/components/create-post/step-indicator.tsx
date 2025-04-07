import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <>
            {/* Step circle with number */}
            <div key={index} className="flex flex-col items-center">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-medium",
                index < currentStep 
                  ? "bg-[#0077B5] text-white" 
                  : index === currentStep 
                    ? "bg-[#0077B5] text-white" 
                    : "bg-neutral-200 text-neutral-600"
              )}>
                {index + 1}
              </div>
              <span className={cn(
                "text-sm mt-2", 
                index <= currentStep 
                  ? "font-medium" 
                  : "text-neutral-600"
              )}>
                {step}
              </span>
            </div>
            
            {/* Connector line between circles (except after last step) */}
            {index < steps.length - 1 && (
              <div className="flex-grow mx-2 h-1 bg-neutral-200">
                <div 
                  className="h-full bg-[#0077B5]"
                  style={{ 
                    width: index < currentStep 
                      ? "100%" 
                      : index === currentStep 
                        ? "50%" 
                        : "0%" 
                  }}
                />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}
