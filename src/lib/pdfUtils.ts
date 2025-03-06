import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from './supabase';

interface StoryPage {
  text: string;
  imageUrl?: string;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

async function createPageCanvas(
  content: string,
  imageUrl: string | undefined,
  pageNumber: number,
  totalPages: number
): Promise<HTMLCanvasElement> {
  // Create a container for the page content
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.minHeight = '1131px';
  container.style.padding = '40px';
  container.style.backgroundColor = 'white';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  try {
    // Add the image if available
    if (imageUrl) {
      try {
        const img = await loadImage(imageUrl);
        const imgContainer = document.createElement('div');
        imgContainer.style.textAlign = 'center';
        imgContainer.style.marginBottom = '40px';
        
        const imgElement = document.createElement('img');
        imgElement.src = img.src;
        imgElement.style.maxWidth = '600px';
        imgElement.style.maxHeight = '600px';
        imgElement.style.objectFit = 'contain';
        imgContainer.appendChild(imgElement);
        
        container.appendChild(imgContainer);

        // Wait for image to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }

    // Add the text content
    const textDiv = document.createElement('div');
    textDiv.style.fontSize = '18px';
    textDiv.style.lineHeight = '1.6';
    textDiv.style.marginTop = '20px';
    textDiv.style.fontFamily = 'Arial, sans-serif';
    textDiv.textContent = content;
    container.appendChild(textDiv);

    // Add page number
    const pageNumberDiv = document.createElement('div');
    pageNumberDiv.style.textAlign = 'center';
    pageNumberDiv.style.marginTop = '20px';
    pageNumberDiv.style.fontSize = '14px';
    pageNumberDiv.style.color = '#666';
    pageNumberDiv.textContent = `Page ${pageNumber} of ${totalPages}`;
    container.appendChild(pageNumberDiv);

    // Create canvas with a delay to ensure content is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      logging: false,
      width: 800,
      height: 1131,
      windowWidth: 800,
      windowHeight: 1131,
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.querySelector('div');
        if (clonedContainer) {
          clonedContainer.style.position = 'static';
          clonedContainer.style.left = '0';
        }
      }
    });

    document.body.removeChild(container);
    return canvas;
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
}

export async function generateAndSavePDF(
  storyId: string,
  storyTitle: string,
  pages: StoryPage[]
): Promise<string> {
  try {
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [800, 1131], // Approximate A4 in pixels at 96 DPI
      hotfixes: ['px_scaling']
    });

    // Create cover page
    const coverCanvas = await createPageCanvas(
      storyTitle,
      pages[0]?.imageUrl, // Use first page image for cover
      0,
      pages.length + 1
    );
    pdf.addImage(
      coverCanvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      800,
      1131
    );

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      pdf.addPage();

      try {
        // Add a small delay between pages to prevent memory issues
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pageCanvas = await createPageCanvas(
          page.text,
          page.imageUrl,
          i + 1,
          pages.length
        );

        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          0,
          800,
          1131
        );
      } catch (error) {
        console.error(`Error processing page ${i + 1}:`, error);
        // Create a page with just the text if image fails
        const fallbackCanvas = await createPageCanvas(
          page.text,
          undefined,
          i + 1,
          pages.length
        );
        pdf.addImage(
          fallbackCanvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          0,
          800,
          1131
        );
      }
    }

    // Generate PDF blob
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], `${storyTitle}.pdf`, { type: 'application/pdf' });

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('story-pdfs')
      .upload(`${storyId}/${Date.now()}.pdf`, file);

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-pdfs')
      .getPublicUrl(data.path);

    // Update the story record
    await supabase
      .from('stories')
      .update({ pdf_url: publicUrl, has_pdf: true })
      .eq('id', storyId);

    return publicUrl;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}