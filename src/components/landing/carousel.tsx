import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const fileItems = [
  { name: "PDF", icon: "/pdf.png" },
  { name: "Word", icon: "/docx.png" },
  { name: "Excel", icon: "/xls.png" },
  { name: "PPT", icon: "/ppt.png" },
  { name: "Image", icon: "/jpg.png" },
  { name: "Video", icon: "/mp4.png" },
  { name: "Audio", icon: "/mp3.png" },
  { name: "Code", icon: "/cpp.png" },
];

// Endless carousel animation for file items

const EndlessCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    let animationFrame: number;
    let scrollLeft = 0;
    const speed = 0.3; // px per frame

    const animate = () => {
      scrollLeft += speed;
      if (scrollLeft >= carousel.scrollWidth / 2) {
        scrollLeft = 0;
      }
      carousel.scrollLeft = scrollLeft;
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Duplicate items for seamless loop
  const items = [...fileItems, ...fileItems, ...fileItems];

  return (
    <div className="relative w-full overflow-x-hidden h-40 m-6 bg-purple-950 rounded-full">
      <div
        ref={carouselRef}
        className="flex h-40 md:gap-8 md:px-4 whitespace-nowrap overflow-x-scroll no-scrollbar"
        style={{ scrollBehavior: "auto" }}
      >
        {items.map((item, idx) => (
          <motion.div
            key={item.name + idx}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            }}
            className="flex flex-col items-center justify-center md:p-6 md:m-4 rounded-xl cursor-pointer min-w-[120px]"
          >
            <img
              src={item.icon}
              alt={item.name}
              className="w-14 h-14 mb-3 drop-shadow"
              loading="lazy"
            />
            <span className="text-base font-semibold text-white">
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>
      {/* Gradient overlays for aesthetic fade */}
      {/* <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white/90 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white/90 to-transparent pointer-events-none" /> */}
    </div>
  );
};

export default EndlessCarousel;
