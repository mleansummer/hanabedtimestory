import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  previewUrl?: string | null;
}

const FileUpload = ({ onFileSelect, previewUrl }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  if (previewUrl) {
    return (
      <div className="relative">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-64 object-cover rounded-lg"
        />
        <div
          {...getRootProps()}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center cursor-pointer transition-opacity hover:bg-opacity-70"
        >
          <input {...getInputProps()} />
          <div className="text-white text-center">
            <Upload className="mx-auto h-8 w-8 text-white" />
            <p className="mt-2">Change photo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-boho-stone bg-boho-stone/5' : 'border-gray-300 hover:border-boho-stone'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-boho-stone" />
      <p className="mt-4 text-lg font-medium text-boho-stone">
        {isDragActive ? "Drop the image here" : "Drag & drop your kid's photo"}
      </p>
      <p className="mt-2 text-sm text-gray-500">or click to select a file</p>
      <p className="mt-1 text-xs text-gray-400">Supported formats: JPEG, JPG, PNG</p>
    </div>
  );
};

export default FileUpload;