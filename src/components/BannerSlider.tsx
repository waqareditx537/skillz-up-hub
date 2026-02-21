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
      style={{ height: "clamp(140px, 28vw, 280px)" }}
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
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {banner.title && (
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-bold text-lg md:text-2xl drop-shadow-lg">{banner.title}</p>
            </div>
          )}
        </div>
      ))}

      {/* Arrows — only show if multiple */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 right-4 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all duration-300 ${
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
