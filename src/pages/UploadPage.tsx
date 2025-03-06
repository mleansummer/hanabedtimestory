import React, { useState } from 'react';
import { Book, Wand2 } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import type { StoryData } from '../App';

interface UploadPageProps {
  onStoryGenerated: (data: StoryData) => void;
}

function UploadPage({ onStoryGenerated }: UploadPageProps) {
  const [childName, setChildName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate story generation
    setTimeout(() => {
      const mockStory = {
        childName,
        theme: selectedTheme,
        imageUrl: previewUrl!,
        story: `Once upon a time, there was a brave child named ${childName} who embarked on an incredible ${selectedTheme.toLowerCase()} journey. [This is a placeholder story that would normally be generated by an AI service...]`
      };
      onStoryGenerated(mockStory);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-900 mb-4 flex items-center justify-center gap-3">
          <Book className="h-8 w-8" />
          Magical Bedtime Stories
        </h1>
        <p className="text-lg text-gray-600">
          Transform your child into the hero of their very own bedtime adventure
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Upload a Photo
            </h2>
            <FileUpload onFileSelect={handleFileSelect} />
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="rounded-lg max-h-48 mx-auto"
                />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Child's Name
            </h2>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter your child's name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Choose Story Theme
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {['Adventure', 'Safari', 'Friendship', 'Kindness'].map((theme) => (
                  <Button
                    key={theme}
                    variant="secondary"
                    className={`w-full ${selectedTheme === theme ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!selectedFile || !childName || !selectedTheme || isGenerating}
            className="w-full md:w-auto"
          >
            <Wand2 className="inline-block mr-2 h-5 w-5" />
            {isGenerating ? 'Creating Magic...' : 'Generate Story'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;