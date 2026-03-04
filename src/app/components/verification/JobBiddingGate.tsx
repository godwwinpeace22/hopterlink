import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  getVerificationConfig,
  ProviderVerificationStatus,
  canBidOnCategory,
} from '@/app/config/verificationConfig';

interface JobBiddingGateProps {
  jobCategory: string;
  providerStatus: ProviderVerificationStatus;
  onNavigateToVerification?: () => void;
  children?: React.ReactNode;
}

export function JobBiddingGate({ 
  jobCategory, 
  providerStatus, 
  onNavigateToVerification,
  children 
}: JobBiddingGateProps) {
  const config = getVerificationConfig(jobCategory);
  
  if (!config) {
    // If category not found, allow bidding (shouldn't happen in production)
    return <>{children}</>;
  }

  const { canBid, missingRequirements } = canBidOnCategory(jobCategory, providerStatus);

  // If provider can bid, show the children (bid form/button)
  if (canBid) {
    return <>{children}</>;
  }

  // Otherwise, show the gate/blocker
  return (
    <Card className="border-2 border-red-200 bg-red-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Lock Icon */}
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="h-6 w-6 text-red-600" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">
              Verification Required to Bid
            </h3>
            <p className="text-sm text-red-800 mb-4">
              {jobCategory} jobs require additional verification for client safety and platform compliance.
            </p>

            {/* Missing Requirements */}
            <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Missing Requirements:
              </p>
              <ul className="space-y-2">
                {missingRequirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Insurance/License Highlights */}
            {config.insuranceRequired && (
              <div className="bg-white border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-700">
                  <strong className="text-red-700">Insurance Required:</strong> Minimum {config.insuranceMinimum} liability coverage
                </p>
              </div>
            )}

            {config.licenseRequired && (
              <div className="bg-white border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-700">
                  <strong className="text-red-700">Trade License Required:</strong>{' '}
                  {config.licenseTypes && config.licenseTypes.length > 0 
                    ? config.licenseTypes.join(', ')
                    : 'Valid professional license'
                  }
                </p>
              </div>
            )}

            {/* CTA Button */}
            <Button
              className="w-full bg-[#F1A400] hover:bg-[#EFA055] text-white"
              onClick={onNavigateToVerification}
            >
              Complete Verification
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-center text-gray-600 mt-3">
              Verification typically takes 2-3 business days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified version for job cards
interface JobCardLockBadgeProps {
  jobCategory: string;
  providerStatus: ProviderVerificationStatus;
}

export function JobCardLockBadge({ jobCategory, providerStatus }: JobCardLockBadgeProps) {
  const { canBid, missingRequirements } = canBidOnCategory(jobCategory, providerStatus);

  if (canBid) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-red-900">Verification Required</p>
          <p className="text-xs text-red-700">
            {missingRequirements.length} requirement{missingRequirements.length !== 1 ? 's' : ''} missing
          </p>
        </div>
      </div>
    </div>
  );
}
