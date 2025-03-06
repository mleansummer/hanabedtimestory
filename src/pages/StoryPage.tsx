import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Loader2, AlertCircle, RefreshCw, Download, FileCheck } from 'lucide-react';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { generateImage } from '../lib/openai';
import ImageWithFallback from '../components/ImageWithFallback';
import { generateAndSavePDF } from '../lib/pdfUtils';

interface Story {
  id: string;
  theme: string;
  content: string;
  image_url: string;
  page_images: string[] | null;
  pdf_url?: string;
  has_pdf?: boolean;
  children: {
    name: string;
  };
}

interface StoryPage {
  text: string;
  imageUrl?: string;
}

function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [regeneratingPage, setRegeneratingPage] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    loadStory();
  }, [id]);

  useEffect(() => {
    if (story) {
      const pages = story.content
        .split('\n\n')
        .filter(paragraph => paragraph.trim().length > 0)
        .map((text, index) => ({
          text,
          imageUrl: story.page_images?.[index] || undefined
        }));
      setStoryPages(pages);

      // Only generate images if we don't have them or if we're missing some
      if (!story.page_images || story.page_images.length < pages.length) {
        generateImagesForPages(pages);
      }
    }
  }, [story]);

  useEffect(() => {
    if (isReading && storyPages.length > 0) {
      const timer = setInterval(() => {
        setCurrentPage((prev) => {
          if (prev < storyPages.length - 1) return prev + 1;
          setIsReading(false);
          return prev;
        });
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [isReading, storyPages.length]);

  const loadStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          children (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Ensure page_images is at least an empty array
      data.page_images = data.page_images || [];
      setStory(data);
    } catch (error) {
      console.error('Error loading story:', error);
      navigate('/my-stories');
    }
  };

  const generateImagesForPages = async (pages: StoryPage[]) => {
    setIsGeneratingImages(true);
    setImageError(null);
    try {
      const updatedPages = [...pages];
      const newImages: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        if (!pages[i].imageUrl || failedImages.has(i)) {
          try {
            const imageUrl = await generateImage(pages[i].text, {
              storyId: story?.id,
              theme: story?.theme
            });
            updatedPages[i] = { ...updatedPages[i], imageUrl };
            newImages[i] = imageUrl;
            setStoryPages([...updatedPages]);
            setFailedImages(prev => {
              const next = new Set(prev);
              next.delete(i);
              return next;
            });
          } catch (error) {
            if (error instanceof Error) {
              setImageError(error.message);
              setFailedImages(prev => new Set(prev).add(i));
            }
            break;
          }
        } else {
          newImages[i] = pages[i].imageUrl;
        }
      }

      if (newImages.length > 0 && story) {
        const { error } = await supabase
          .from('stories')
          .update({ page_images: newImages })
          .eq('id', story.id);

        if (error) throw error;
        setStory({ ...story, page_images: newImages });
      }
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleRegenerateImage = async (pageIndex: number) => {
    if (!story) return;
    
    setRegeneratingPage(pageIndex);
    setImageError(null);
    
    try {
      const imageUrl = await generateImage(storyPages[pageIndex].text, {
        storyId: story.id,
        theme: story.theme,
        forceNew: true
      });

      const updatedPages = [...storyPages];
      updatedPages[pageIndex] = { ...updatedPages[pageIndex], imageUrl };
      setStoryPages(updatedPages);

      // Update the story's page_images array
      const newPageImages = story.page_images ? [...story.page_images] : [];
      newPageImages[pageIndex] = imageUrl;
      
      const { error } = await supabase
        .from('stories')
        .update({ page_images: newPageImages })
        .eq('id', story.id);

      if (error) throw error;
      setStory({ ...story, page_images: newPageImages });
      
      // Clear the failed state for this image
      setFailedImages(prev => {
        const next = new Set(prev);
        next.delete(pageIndex);
        return next;
      });
    } catch (error) {
      if (error instanceof Error) {
        setImageError(error.message);
        setFailedImages(prev => new Set(prev).add(pageIndex));
      }
    } finally {
      setRegeneratingPage(null);
    }
  };

  const handleImageError = (pageIndex: number) => {
    setFailedImages(prev => new Set(prev).add(pageIndex));
  };

  const handleDownloadPDF = async () => {
    if (!story) return;

    setIsDownloadingPDF(true);
    try {
      // If PDF exists and we have a URL, open it directly
      if (story.has_pdf && story.pdf_url) {
        window.open(story.pdf_url, '_blank');
        return;
      }

      // Otherwise generate a new PDF
      const storyTitle = `${story.children.name}'s ${story.theme} Adventure`;
      const pdfUrl = await generateAndSavePDF(story.id, storyTitle, storyPages);
      
      // Update local story state
      setStory({ ...story, pdf_url: pdfUrl, has_pdf: true });

      // Open PDF in new tab
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setImageError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const toggleReading = () => {
    if (!isReading) {
      setCurrentPage(0);
    }
    setIsReading(!isReading);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(storyPages.length - 1, prev + 1));
  };

  if (!story || storyPages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-boho-stone/70">Loading story...</div>
      </div>
    );
  }

  const currentStoryPage = storyPages[currentPage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <Button
          variant="secondary"
          transparent
          onClick={() => navigate('/my-stories')}
          className="text-boho-stone hover:text-boho-stone/80 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2 relative -top-[1px]" />
          <span>Back to My Stories</span>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className="inline-flex items-center"
          >
            {story.has_pdf ? (
              <>
                <FileCheck className="h-5 w-5 mr-2" />
                View PDF
              </>
            ) : isDownloadingPDF ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </>
            )}
          </Button>
          <Button
            onClick={toggleReading}
            className="inline-flex items-center"
          >
            {isReading ? (
              <>
                <VolumeX className="h-5 w-5 mr-2" />
                Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5 mr-2" />
                Read Story
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-boho font-bold text-boho-stone">
            {story.children.name}'s {story.theme} Adventure
          </h1>
        </div>

        {imageError && (
          <div className="bg-boho-clay/10 border border-boho-clay rounded-lg p-4 text-boho-stone flex items-center gap-2 mb-8">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{imageError}</p>
          </div>
        )}

        <div className="relative w-full max-w-6xl mx-auto">
          <div className="book-shadow bg-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-0">
              <div className="book-page book-page-left">
                <div className="book-spine"></div>
                <div className="book-content">
                  <div className="absolute left-0 inset-y-0 w-16 flex items-center justify-center">
                    {currentPage > 0 && (
                      <button
                        onClick={handlePrevPage}
                        className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all transform hover:scale-110"
                      >
                        <ArrowLeft className="h-6 w-6 text-boho-stone" />
                      </button>
                    )}
                  </div>
                  <div className="h-full flex flex-col items-center justify-center relative">
                    {isGeneratingImages && !currentStoryPage.imageUrl ? (
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-boho-stone mx-auto" />
                        <p className="mt-2 text-sm text-boho-stone/70">Generating image...</p>
                      </div>
                    ) : (
                      <>
                        <ImageWithFallback
                          src={currentStoryPage.imageUrl || story.image_url}
                          alt={`Story illustration ${currentPage + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                          onError={() => handleImageError(currentPage)}
                        />
                        {(currentStoryPage.imageUrl || failedImages.has(currentPage)) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRegenerateImage(currentPage)}
                            disabled={regeneratingPage === currentPage}
                            className="absolute bottom-4 right-4 bg-white/90"
                          >
                            <RefreshCw 
                              className={`h-4 w-4 mr-2 ${regeneratingPage === currentPage ? 'animate-spin' : ''}`}
                            />
                            {regeneratingPage === currentPage ? 'Regenerating...' : 
                             failedImages.has(currentPage) ? 'Retry Loading' : 'Regenerate Image'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="book-page book-page-right">
                <div className="book-spine book-spine-right"></div>
                <div className="book-content">
                  <div className="absolute right-0 inset-y-0 w-16 flex items-center justify-center">
                    {currentPage < storyPages.length - 1 && (
                      <button
                        onClick={handleNextPage}
                        className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all transform hover:scale-110"
                      >
                        <ArrowRight className="h-6 w-6 text-boho-stone" />
                      </button>
                    )}
                  </div>
                  <div className="h-full flex flex-col justify-center">
                    <div className="prose max-w-none">
                      <p className="text-xl leading-relaxed font-boho animate-fade-in text-boho-stone text-center px-8">
                        {currentStoryPage.text}
                      </p>
                    </div>
                    <div className="mt-8 text-center text-sm font-medium text-boho-stone/70">
                      Page {currentPage + 1} of {storyPages.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryPage;