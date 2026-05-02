import HeroSection from "@/components/home/HeroSection";
import BrandStrip from "@/components/BrandStrip";
import ShopCategories from "@/components/home/ShopCategories";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStory from "@/components/home/BrandStory";
import Testimonials from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandStrip />
      <ShopCategories />
      <MarqueeStrip />
      <FeaturedProducts />
      <BrandStory />
      <Testimonials />
    </>
  );
}
