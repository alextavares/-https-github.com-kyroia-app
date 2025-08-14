"use client";
export default function OnboardingLayout({ children, currentStep, totalSteps, title, subtitle }) {
    return (<div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }}/>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card p-8">
        <div className="w-full max-w-sm">
          {/* Mock Interface Preview */}
          <div className="bg-background rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-card border-b border-border p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IA</span>
              </div>
              <div>
                <div className="font-medium">Kyroia</div>
                <div className="text-xs text-muted-foreground">GPT-4o</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm">Hello! What can I do for you today?</div>
                  </div>
                </div>
              </div>

              {/* Template Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg p-3">
                  <div className="text-xs font-medium">Marketing</div>
                  <div className="text-xs text-muted-foreground mt-1">Create campaigns</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg p-3">
                  <div className="text-xs font-medium">Writing</div>
                  <div className="text-xs text-muted-foreground mt-1">Improve content</div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <div className="text-sm text-muted-foreground flex-1">Message Kyroia</div>
                <div className="w-4 h-4 bg-primary/50 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25ib2FyZGluZ0xheW91dC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJPbmJvYXJkaW5nTGF5b3V0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFZWixNQUFNLENBQUMsT0FBTyxVQUFVLGdCQUFnQixDQUFDLEVBQ3ZDLFFBQVEsRUFDUixXQUFXLEVBQ1gsVUFBVSxFQUNWLEtBQUssRUFDTCxRQUFRLEVBQ2M7SUFDdEIsT0FBTyxDQUNMLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FDOUM7TUFBQSxDQUFDLHNCQUFzQixDQUN2QjtNQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw2Q0FBNkMsQ0FDMUQ7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQ3hDO1VBQUEsQ0FBQyxrQkFBa0IsQ0FDbkI7VUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0NBQWtDLENBQy9DO1lBQUEsQ0FBQyxHQUFHLENBQ0YsU0FBUyxDQUFDLHlEQUF5RCxDQUNuRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFFN0Q7VUFBQSxFQUFFLEdBQUcsQ0FFTDs7VUFBQSxDQUFDLFlBQVksQ0FDYjtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FDcEM7WUFBQSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsb0NBQW9DLENBQ2hEO2NBQUEsQ0FBQyxLQUFLLENBQ1I7WUFBQSxFQUFFLEVBQUUsQ0FDSjtZQUFBLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FDMUM7Y0FBQSxDQUFDLFFBQVEsQ0FDWDtZQUFBLEVBQUUsQ0FBQyxDQUNMO1VBQUEsRUFBRSxHQUFHLENBRUw7O1VBQUEsQ0FBQyxhQUFhLENBQ2Q7VUFBQSxDQUFDLEdBQUcsQ0FBQyxT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