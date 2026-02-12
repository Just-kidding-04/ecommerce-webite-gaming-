import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

export default function ImageCarousel({ images = [] }) {
  if (!images.length) return null
  return (
    <Swiper spaceBetween={10} slidesPerView={1} className="rounded-lg overflow-hidden">
      {images.map((img, i) => (
        <SwiperSlide key={i}>
          <img src={img} alt={`Product image ${i + 1}`} className="w-full h-96 object-contain bg-slate-100" />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
