import { Hero } from "@/components/hero/Hero";
import { ScrollStory } from "@/components/story/ScrollStory";
import { ExperienceSection } from "@/components/story/ExperienceSection";
import { ProductShowcase } from "@/components/product/ProductShowcase";
import { RevealExperience } from "@/components/story/RevealExperience";
import { Reviews } from "@/components/social/Reviews";
import { UGC } from "@/components/social/UGC";
import { FAQ } from "@/components/story/FAQ";
import { FinalCTA } from "@/components/story/FinalCTA";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { ViewTracker } from "@/components/analytics/ViewTracker";

export default function Home() {
  return (
    <>
      <ViewTracker event="home" />
      <Hero />
      <ScrollStory />
      <ExperienceSection />
      <ProductShowcase />
      <RevealExperience />
      <Reviews />
      <UGC />
      <FAQ />
      <FinalCTA />
      <StickyBuyBar />
    </>
  );
}
