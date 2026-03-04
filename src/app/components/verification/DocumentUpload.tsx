import { useState } from 'react';
import { Upload, CheckCircle, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { VerificationBadge } from './VerificationBadge';
import { VerificationStatus } from '@/app/config/verificationConfig';

interface DocumentUploadProps {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  processingTime?: string;
  status?: VerificationStatus;
  acceptedFormats?: string;
  onUpload?: (file: File) => void;
  rejectionReason?: string;
}

export function DocumentUpload({
  id,
  label,
  description,
  required = false,
  processingTime,
  status = 'not_started',
  acceptedFormats = 'image/*,.pdf',
  onUpload,
  rejectionReason,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Generate preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }

      // Call onUpload callback
      if (onUpload) {
        onUpload(selectedFile);
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const getBorderColor = () => {
    switch (status) {
      case 'approved':
        return 'border-green-300 bg-green-50';
      case 'pending':
        return 'border-yellow-300 bg-yellow-50';
      case 'rejected':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 hover:border-[#F7C876]';
    }
  };

  return (
    <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${getBorderColor()}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
          status === 'approved' ? 'bg-green-100' :
          status === 'pending' ? 'bg-yellow-100' :
          status === 'rejected' ? 'bg-red-100' :
          'bg-[#FDEFD6]'
        }`}>
          {status === 'approved' ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : status === 'pending' ? (
            <FileText className="h-6 w-6 text-yellow-600" />
          ) : status === 'rejected' ? (
            <AlertCircle className="h-6 w-6 text-red-600" />
          ) : (
            <Upload className="h-6 w-6 text-[#F1A400]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Label className="text-lg font-semibold">
              {label} {required && <span className="text-red-600">*</span>}
            </Label>
            <VerificationBadge status={status} size="sm" />
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{description}</p>

          {processingTime && status !== 'approved' && (
            <p className="text-xs text-gray-500 mb-3">
              ⏱️ Processing time: {processingTime}
            </p>
          )}

          {/* Upload Section */}
          {status === 'not_started' && (
            <>
              <input
                type="file"
                accept={acceptedFormats}
                onChange={handleFileChange}
                className="hidden"
                id={id}
              />
              <label htmlFor={id}>
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {file ? file.name : 'Choose File'}
                  </span>
                </Button>
              </label>

              {file && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Ready to upload</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="ml-auto text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {preview && (
                <div className="mt-3">
                  <img src={preview} alt="Preview" className="max-w-xs rounded border" />
                </div>
              )}
            </>
          )}

          {/* Pending Status */}
          {status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="text-yellow-800 font-medium">Document under review</p>
              <p className="text-yellow-700 text-xs mt-1">
                Our verification team is reviewing your document. You'll be notified once approved.
              </p>
            </div>
          )}

          {/* Approved Status */}
          {status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold">Document Verified</span>
              </div>
            </div>
          )}

          {/* Rejected Status */}
          {status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
              <p className="text-red-800 font-medium mb-1">Document Rejected</p>
              {rejectionReason && (
                <p className="text-red-700 text-xs mb-2">{rejectionReason}</p>
              )}
              <input
                type="file"
                accept={acceptedFormats}
                onChange={handleFileChange}
                className="hidden"
                id={`${id}-reupload`}
              />
              <label htmlFor={`${id}-reupload`}>
                <Button type="button" size="sm" variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-2" />
                    Upload New Document
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
