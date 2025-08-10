import React, { useState } from 'react';
import './GallerySection.css';

interface GallerySectionProps {
  data: {
    images: Array<{
      url: string;
      caption?: string;
      alt?: string;
    }>;
    layout?: 'grid' | 'carousel' | 'masonry';
    columns?: number;
    gap?: string;
  };
}

const GallerySection: React.FC<GallerySectionProps> = ({ data }) => {
  const { 
    images = [], 
    layout = 'grid',
    columns = 3,
    gap = '1rem'
  } = data;
  
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };
  
  const handleClose = () => {
    setSelectedImage(null);
  };
  
  const handlePrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };
  
  const handleNext = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };
  
  if (images.length === 0) {
    return null;
  }
  
  return (
    <>
      <div className="study-detail-gallery-section">
        <div 
          className={`gallery-container gallery-${layout}`}
          style={{
            gridTemplateColumns: layout === 'grid' ? `repeat(${columns}, 1fr)` : undefined,
            gap
          }}
        >
          {images.map((image, index) => (
            <div 
              key={index} 
              className="gallery-item"
              onClick={() => handleImageClick(index)}
            >
              <img 
                src={image.url} 
                alt={image.alt || `Gallery image ${index + 1}`}
                loading="lazy"
              />
              {image.caption && (
                <div className="gallery-caption">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="gallery-lightbox" onClick={handleClose}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={handleClose}>×</button>
            
            {selectedImage > 0 && (
              <button className="lightbox-prev" onClick={handlePrevious}>‹</button>
            )}
            
            {selectedImage < images.length - 1 && (
              <button className="lightbox-next" onClick={handleNext}>›</button>
            )}
            
            <img 
              src={images[selectedImage].url}
              alt={images[selectedImage].alt || `Gallery image ${selectedImage + 1}`}
            />
            
            {images[selectedImage].caption && (
              <div className="lightbox-caption">
                {images[selectedImage].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;