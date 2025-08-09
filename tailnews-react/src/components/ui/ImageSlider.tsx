'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SlideItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category?: {
    name: string;
    slug: string;
  };
}

interface ImageSliderProps {
  slides: SlideItem[];
  slidesPerView?: number;
  spaceBetween?: number;
  autoplay?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  className?: string;
}

const ImageSlider = ({
  slides,
  slidesPerView = 3,
  spaceBetween = 30,
  autoplay = true,
  navigation = true,
  pagination = true,
  className = ''
}: ImageSliderProps) => {
  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={spaceBetween}
        slidesPerView={1}
        navigation={navigation}
        pagination={pagination ? { clickable: true } : false}
        autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
        breakpoints={{
          640: {
            slidesPerView: Math.min(2, slidesPerView),
          },
          768: {
            slidesPerView: Math.min(2, slidesPerView),
          },
          1024: {
            slidesPerView: slidesPerView,
          },
        }}
        className="post-carousel"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full pb-3">
              <div className="hover-img bg-white shadow-sm rounded-lg overflow-hidden">
                <Link href={`/posts/${slide.slug}`}>
                  {slide.featuredImage ? (
                    <Image
                      src={slide.featuredImage.url}
                      alt={slide.featuredImage.alt}
                      width={400}
                      height={240}
                      className="max-w-full w-full mx-auto h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </Link>
                <div className="py-3 px-6">
                  <h3 className="text-lg font-bold leading-tight mb-2">
                    <Link href={`/posts/${slide.slug}`} className="hover:text-red-600">
                      {slide.title}
                    </Link>
                  </h3>
                  {slide.excerpt && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {slide.excerpt}
                    </p>
                  )}
                  {slide.category && (
                    <Link href={`/category/${slide.category.slug}`} className="text-gray-500 hover:text-red-600 text-sm">
                      <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                      {slide.category.name}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;