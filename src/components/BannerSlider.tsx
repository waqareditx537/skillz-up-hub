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
  const [bannerHeight, setBannerHeight] = useState(200);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id,title,image_url,redirect_url,sort_order")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data);
      });

    // Fetch banner height setting
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "banner_height")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setBannerHeight(parseInt(data.value) || 200);
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
      className="relative w-full overflow-hidden rounded-2xl select-none shadow-lg"
      style={{ height: `${bannerHeight}px` }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1.5 sm:p-2 transition-all z-10 min-h-[36px] min-w-[36px] flex items-center justify-center backdrop-blur-sm"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1.5 sm:p-2 transition-all z-10 min-h-[36px] min-w-[36px] flex items-center justify-center backdrop-blur-sm"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all duration-300 min-h-[8px] ${
                i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"
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
