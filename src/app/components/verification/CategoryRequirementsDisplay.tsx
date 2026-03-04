import { AlertCircle, Shield, FileCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  CategoryVerificationConfig, 
  getRiskLevelColor,
  RiskLevel 
} from '@/app/config/verificationConfig';

interface CategoryRequirementsDisplayProps {
  config: CategoryVerificationConfig;
  showDetailedInfo?: boolean;
}

export function CategoryRequirementsDisplay({ 
  config, 
  showDetailedInfo = true 
}: CategoryRequirementsDisplayProps) {
  
  const getRiskLevelLabel = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'Low Risk';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
      case 'sensitive':
        return 'Sensitive Category';
      default:
        return '';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'sensitive':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-[#F1A400]" />
          Required Verification for {config.category}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Level Badge */}
        <div className={`inline-flex items-center gap-2 border rounded-lg px-3 py-2 ${getRiskLevelColor(config.riskLevel)}`}>
          {getRiskIcon(config.riskLevel)}
          <span className="font-semibold">{getRiskLevelLabel(config.riskLevel)}</span>
        </div>

        {/* Key Requirements Summary */}
        {showDetailedInfo && (
          <div className="bg-[#FDEFD6] border border-[#F7C876] rounded-lg p-4">
            <h4 className="font-semibold text-[#2B2B2B] mb-3">Key Requirements:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {config.backgroundCheckRequired && (
                <li className="flex items-start gap-2">
                  <span className="text-[#F1A400] mt-0.5">✓</span>
                  <span>
                    <strong>{config.enhancedBackgroundCheck ? 'Enhanced ' : ''}Background Check</strong>
                    {config.enhancedBackgroundCheck && ' including vulnerable sector screening'}
                  </span>
                </li>
              )}
              {config.licenseRequired && (
                <li className="flex items-start gap-2">
                  <span className="text-[#F1A400] mt-0.5">✓</span>
                  <span>
                    <strong>Trade License</strong>
                    {config.licenseTypes && config.licenseTypes.length > 0 && (
                      <span className="block text-xs text-gray-600 mt-1">
                        Accepted: {config.licenseTypes.join(', ')}
                      </span>
                    )}
                  </span>
                </li>
              )}
              {config.insuranceRequired && (
                <li className="flex items-start gap-2">
                  <span className="text-[#F1A400] mt-0.5">✓</span>
                  <span>
                    <strong>Liability Insurance</strong>
                    {config.insuranceMinimum && (
                      <span className="text-red-600 font-semibold"> (Minimum {config.insuranceMinimum})</span>
                    )}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Full Requirements List */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Complete Checklist:</h4>
          <div className="space-y-2">
            {config.requirements.map((req) => (
              <div 
                key={req.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {req.required ? (
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">?</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{req.label}</span>
                    {req.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        Required
                      </span>
                    )}
                    {!req.required && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{req.description}</p>
                  {req.processingTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      ⏱️ Processing time: {req.processingTime}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        {(config.riskLevel === 'high' || config.riskLevel === 'sensitive') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-900 mb-1">
                  {config.riskLevel === 'sensitive' ? 'Sensitive Category' : 'High Risk Category'}
                </p>
                <p className="text-red-800">
                  All requirements must be verified before you can bid on {config.category.toLowerCase()} jobs. 
                  This protects both clients and providers on our platform.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
