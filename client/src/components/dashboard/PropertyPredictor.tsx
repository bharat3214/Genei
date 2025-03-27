import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PropertyPrediction } from "@/lib/types";

interface PropertyPredictorProps {
  properties?: PropertyPrediction;
  isLoading?: boolean;
  onGenerateReport?: () => void;
}

export default function PropertyPredictor({ 
  properties, 
  isLoading = false,
  onGenerateReport
}: PropertyPredictorProps) {
  const getStatusColor = (value: number) => {
    if (value >= 0.8) return "bg-success-500";
    if (value >= 0.6) return "bg-success-500";
    if (value >= 0.4) return "bg-warning-500";
    return "bg-error-500";
  };
  
  const getStatusText = (property: string, value: number) => {
    // For toxicity, lower is better
    if (property === "toxicityRisk") {
      if (value <= 0.2) return <span className="text-success-500 font-medium">Low</span>;
      if (value <= 0.5) return <span className="text-warning-500 font-medium">Medium</span>;
      return <span className="text-error-500 font-medium">High</span>;
    }
    
    // For other properties, higher is better
    if (value >= 0.8) return <span className="text-success-500 font-medium">Excellent</span>;
    if (value >= 0.6) return <span className="text-success-500 font-medium">Good</span>;
    if (value >= 0.4) return <span className="text-warning-500 font-medium">Fair</span>;
    return <span className="text-error-500 font-medium">Poor</span>;
  };
  
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Property Prediction</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="spinner"></div>
              <p className="mt-4 text-sm text-gray-500">Analyzing molecule properties...</p>
            </div>
          </div>
        ) : properties ? (
          <div className="space-y-4">
            {/* ADMET Properties */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">ADMET Properties</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-900">Bioavailability</span>
                  </div>
                  <div className="col-span-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={cn("h-2 rounded-full", getStatusColor(properties.bioavailability))} style={{ width: `${properties.bioavailability * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(properties.bioavailability)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-900">Solubility</span>
                  </div>
                  <div className="col-span-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={cn("h-2 rounded-full", getStatusColor(properties.solubility))} style={{ width: `${properties.solubility * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(properties.solubility)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-900">Blood-Brain Barrier</span>
                  </div>
                  <div className="col-span-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={cn("h-2 rounded-full", getStatusColor(properties.bloodBrainBarrier))} style={{ width: `${properties.bloodBrainBarrier * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(properties.bloodBrainBarrier)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-900">Toxicity Risk</span>
                  </div>
                  <div className="col-span-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full", properties.toxicityRisk <= 0.2 ? "bg-success-500" : properties.toxicityRisk <= 0.5 ? "bg-warning-500" : "bg-error-500")} 
                        style={{ width: `${properties.toxicityRisk * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusText("toxicityRisk", properties.toxicityRisk)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Physical Properties */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Physical Properties</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Molecular Weight</div>
                  <div className="text-sm font-medium">{properties.molecularWeight?.toFixed(2) || "N/A"} g/mol</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">LogP</div>
                  <div className="text-sm font-medium">{properties.logP?.toFixed(2) || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">H-Bond Donors</div>
                  <div className="text-sm font-medium">{properties.hDonors || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">H-Bond Acceptors</div>
                  <div className="text-sm font-medium">{properties.hAcceptors || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No property data available</p>
          </div>
        )}
        
        {/* Generate Report Button */}
        <div className="mt-6">
          <Button 
            variant="default" 
            className="w-full"
            onClick={onGenerateReport}
            disabled={!properties || isLoading}
          >
            <span className="material-icons text-sm mr-1">description</span>
            Generate Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
