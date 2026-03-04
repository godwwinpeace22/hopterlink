// Service Category Risk Levels and Verification Requirements

export type RiskLevel = 'low' | 'medium' | 'high' | 'sensitive';

export interface VerificationRequirement {
  id: string;
  label: string;
  description: string;
  required: boolean;
  processingTime?: string;
}

export interface CategoryVerificationConfig {
  category: string;
  riskLevel: RiskLevel;
  insuranceRequired: boolean;
  insuranceMinimum?: string; // e.g., "$1M", "$2M"
  licenseRequired: boolean;
  licenseTypes?: string[];
  backgroundCheckRequired: boolean;
  enhancedBackgroundCheck: boolean;
  requirements: VerificationRequirement[];
}

export const SERVICE_CATEGORIES: CategoryVerificationConfig[] = [
  // LOW RISK CATEGORIES
  {
    category: 'Virtual Assistant',
    riskLevel: 'low',
    insuranceRequired: false,
    licenseRequired: false,
    backgroundCheckRequired: false,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Tutoring',
    riskLevel: 'low',
    insuranceRequired: false,
    licenseRequired: false,
    backgroundCheckRequired: false,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  
  // MEDIUM RISK CATEGORIES
  {
    category: 'Cleaning Services',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Handyman',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Painting',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Landscaping',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Moving Help',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Snow Clearing',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Auto Services',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  
  // HIGH RISK CATEGORIES (Licensed trades)
  {
    category: 'Electrical',
    riskLevel: 'high',
    insuranceRequired: true,
    insuranceMinimum: '$2M',
    licenseRequired: true,
    licenseTypes: ['Master Electrician License', 'Journeyman Electrician License', 'Electrical Contractor License'],
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'license',
        label: 'Trade License',
        description: 'Valid electrical trade license (Red Seal or Provincial)',
        required: true,
        processingTime: '2-3 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $2M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'Plumbing',
    riskLevel: 'high',
    insuranceRequired: true,
    insuranceMinimum: '$2M',
    licenseRequired: true,
    licenseTypes: ['Master Plumber License', 'Journeyman Plumber License', 'Plumbing Contractor License'],
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'license',
        label: 'Trade License',
        description: 'Valid plumbing trade license (Red Seal or Provincial)',
        required: true,
        processingTime: '2-3 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $2M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'HVAC',
    riskLevel: 'high',
    insuranceRequired: true,
    insuranceMinimum: '$2M',
    licenseRequired: true,
    licenseTypes: ['HVAC Technician License', 'Gas Fitter License', 'Refrigeration License'],
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'license',
        label: 'Trade License',
        description: 'Valid HVAC/Gas Fitter license',
        required: true,
        processingTime: '2-3 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $2M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
  {
    category: 'General Contractor',
    riskLevel: 'high',
    insuranceRequired: true,
    insuranceMinimum: '$5M',
    licenseRequired: true,
    licenseTypes: ['General Contractor License', 'Building Contractor License'],
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'license',
        label: 'Contractor License',
        description: 'Valid general contractor license',
        required: true,
        processingTime: '2-3 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $5M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'wcb',
        label: 'Workers Compensation',
        description: 'WCB coverage (if you have employees)',
        required: false,
        processingTime: '24-48 hours',
      },
    ],
  },
  
  // SENSITIVE CATEGORIES
  {
    category: 'Childcare',
    riskLevel: 'sensitive',
    insuranceRequired: true,
    insuranceMinimum: '$2M',
    licenseRequired: false, // Varies by province
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: true,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Enhanced Background Check',
        description: 'Enhanced criminal background check',
        required: true,
        processingTime: '5-7 business days',
      },
      {
        id: 'vulnerable_sector',
        label: 'Vulnerable Sector Check',
        description: 'Police vulnerable sector screening',
        required: true,
        processingTime: '2-4 weeks',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $2M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'first_aid',
        label: 'First Aid & CPR',
        description: 'Valid First Aid and CPR certification',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'references',
        label: 'Professional References',
        description: 'Minimum 3 professional references',
        required: true,
        processingTime: '3-5 business days',
      },
    ],
  },
  {
    category: 'Eldercare',
    riskLevel: 'sensitive',
    insuranceRequired: true,
    insuranceMinimum: '$2M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: true,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Enhanced Background Check',
        description: 'Enhanced criminal background check',
        required: true,
        processingTime: '5-7 business days',
      },
      {
        id: 'vulnerable_sector',
        label: 'Vulnerable Sector Check',
        description: 'Police vulnerable sector screening',
        required: true,
        processingTime: '2-4 weeks',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $2M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'first_aid',
        label: 'First Aid & CPR',
        description: 'Valid First Aid and CPR certification',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'references',
        label: 'Professional References',
        description: 'Minimum 3 professional references',
        required: true,
        processingTime: '3-5 business days',
      },
    ],
  },
  {
    category: 'Personal Care',
    riskLevel: 'medium',
    insuranceRequired: true,
    insuranceMinimum: '$1M',
    licenseRequired: false,
    backgroundCheckRequired: true,
    enhancedBackgroundCheck: false,
    requirements: [
      {
        id: 'email',
        label: 'Email Verification',
        description: 'Verify your email address',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Verification',
        description: 'Verify your phone number via SMS',
        required: true,
      },
      {
        id: 'identity',
        label: 'Identity Verification',
        description: 'Government-issued ID',
        required: true,
        processingTime: '24-48 hours',
      },
      {
        id: 'background',
        label: 'Background Check',
        description: 'Criminal background check',
        required: true,
        processingTime: '3-5 business days',
      },
      {
        id: 'insurance',
        label: 'Liability Insurance',
        description: 'Minimum $1M general liability coverage',
        required: true,
        processingTime: '24-48 hours',
      },
    ],
  },
];

// Helper function to get verification config for a category
export function getVerificationConfig(category: string): CategoryVerificationConfig | undefined {
  return SERVICE_CATEGORIES.find(c => c.category.toLowerCase() === category.toLowerCase());
}

// Helper function to get risk level color
export function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'sensitive':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Verification status type
export type VerificationStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

export interface ProviderVerificationStatus {
  email: VerificationStatus;
  phone: VerificationStatus;
  identity: VerificationStatus;
  background?: VerificationStatus;
  enhanced_background?: VerificationStatus;
  vulnerable_sector?: VerificationStatus;
  license?: VerificationStatus;
  insurance?: VerificationStatus;
  wcb?: VerificationStatus;
  first_aid?: VerificationStatus;
  references?: VerificationStatus;
}

// Helper to check if provider can bid on jobs in a category
export function canBidOnCategory(
  category: string,
  providerStatus: ProviderVerificationStatus
): { canBid: boolean; missingRequirements: string[] } {
  const config = getVerificationConfig(category);
  
  if (!config) {
    return { canBid: true, missingRequirements: [] };
  }
  
  const missingRequirements: string[] = [];
  
  config.requirements.forEach(req => {
    if (req.required) {
      const status = providerStatus[req.id as keyof ProviderVerificationStatus];
      if (status !== 'approved') {
        missingRequirements.push(req.label);
      }
    }
  });
  
  return {
    canBid: missingRequirements.length === 0,
    missingRequirements,
  };
}
