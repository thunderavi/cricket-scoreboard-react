import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ImageSlider = () => {
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  const images = [
    { src: '/image/stadium.jpeg', alt: 'Cricket stadium', badge: 'Stadium' },
    { src: '/image/batsman.jpeg', alt: 'Cricket player', badge: 'Batsman' },
    { src: '/image/action.jpeg', alt: 'Match action', badge: 'Match Day' },
    { src: '/image/match.webp', alt: 'Cricket ball', badge: 'Perfect Shot' },
  ];

  // Duplicate images for smooth infinite scroll
  const allImages = [...images, ...images];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Calculate total width of all slides
    const slideWidth = 200; // 180px + 20px gap
    const totalWidth = slideWidth * images.length;

    // GSAP animation for infinite scroll
    animationRef.current = gsap.to(slider, {
      x: -totalWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
    });

    // Pause on hover
    slider.addEventListener('mouseenter', () => {
      animationRef.current.pause();
    });

    slider.addEventListener('mouseleave', () => {
      animationRef.current.play();
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return (
    <div className="slider-viewport">
      <div className="slider-track" ref={sliderRef}>
        {allImages.map((image, index) => (
          <div className="slide" key={index}>
            <img src={image.src} alt={image.alt} />
            <div className="slide-badge">{image.badge}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .slider-viewport {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.02),
            rgba(0, 0, 0, 0.06)
          );
          border-radius: 14px;
          padding: 18px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(2, 6, 23, 0.6);
          position: relative;
        }

        .slider-track {
          display: flex;
          gap: 20px;
          align-items: center;
          will-change: transform;
        }

        .slide {
          flex: 0 0 180px;
          height: 220px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          background: #0c1116;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform-origin: center;
          transition: transform 0.45s ease;
        }

        .slide:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 22px 40px rgba(0, 0, 0, 0.6);
          z-index: 6;
        }

        .slide:hover img {
          transform: scale(1.06);
        }

        .slide-badge {
          position: absolute;
          left: 10px;
          bottom: 10px;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0.25)
          );
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 13px;
          color: #fff;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        @media (max-width: 575px) {
          .slide {
            flex: 0 0 160px;
            height: 180px;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;