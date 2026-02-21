import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  redirect_url: string;
}

const BannerSlider = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id,title,image_url,redirect_url,sort_order")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data);
      });
  }, []);

  const next = useCallback(() => setCurrent((p) => (p + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent((p) => (p - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [banners.length, isHovered, next]);

  const handleClick = (banner: Banner) => {
    if (!banner.redirect_url) return;
    if (banner.redirect_url.startsWith("http")) {
      window.open(banner.redirect_url, "_blank", "noopener,noreferrer");
    } else {
      navigate(banner.redirect_url);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl select-none shadow-lg"
      style={{ height: "clamp(120px, 25vw, 260px)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer"
          style={{ transform: `translateX(${(index - current) * 100}%)` }}
          onClick={() => handleClick(banner)}
        >
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
            draggable={false}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {banner.title && (
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <p className="text-white font-bold text-sm sm:text-lg md:text-2xl drop-shadow-lg line-clamp-1">{banner.title}</p>
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-1 sm:p-1.5 transition-all z-10 min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-1 sm:p-1.5 transition-all z-10 min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-1.5 sm:bottom-2 right-3 sm:right-4 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all duration-300 min-h-[8px] ${
                i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
