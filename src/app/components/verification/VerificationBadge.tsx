import { Shield, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { VerificationStatus } from '@/app/config/verificationConfig';

interface VerificationBadgeProps {
  status: VerificationStatus;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({ 
  status, 
  label, 
  showIcon = true,
  size = 'md' 
}: VerificationBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-700 bg-green-50 border-green-200',
          text: label || 'Verified',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
          text: label || 'Pending Review',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-700 bg-red-50 border-red-200',
          text: label || 'Rejected',
        };
      case 'not_started':
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          text: label || 'Not Started',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.text}</span>
    </div>
  );
}

interface VerificationLevelBadgeProps {
  level: 'basic' | 'standard' | 'professional' | 'elite';
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationLevelBadge({ level, size = 'md' }: VerificationLevelBadgeProps) {
  const getLevelConfig = () => {
    switch (level) {
      case 'elite':
        return {
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          text: '⭐ Elite Verified',
        };
      case 'professional':
        return {
          color: 'text-[#F1A400] bg-[#FDEFD6] border-[#F7C876]',
          text: '💼 Professional Verified',
        };
      case 'standard':
        return {
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          text: '✓ Standard Verified',
        };
      case 'basic':
      default:
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          text: '○ Basic Verified',
        };
    }
  };

  const config = getLevelConfig();

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 border rounded-full font-semibold ${config.color} ${sizeClasses[size]}`}>
      <Shield className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      <span>{config.text}</span>
    </div>
  );
}
