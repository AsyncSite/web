import React from 'react';
import './CTASection.css';

interface CTAData {
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  subtitle?: string;
}

const CTASection: React.FC<{ data: CTAData }> = ({ data }) => {
  const handleClick = () => {
    if (data.buttonLink) {
      if (data.buttonLink.startsWith('http')) {
        window.open(data.buttonLink, '_blank');
      } else {
        window.location.href = data.buttonLink;
      }
    }
  };

  return (
    <section className="cta-section">
      <div className="cta-container">
        {data.title && <h2 className="cta-title">{data.title}</h2>}
        {data.subtitle && <p className="cta-subtitle">{data.subtitle}</p>}
        {data.buttonText && (
          <button className="cta-button" onClick={handleClick}>
            {data.buttonText}
          </button>
        )}
      </div>
    </section>
  );
};

export default CTASection;
