import Hero from '@/components/Hero';
import WhatIsDeepfake from '@/components/sections/WhatIsDeepfake';
import SocialEngineeringSimulator from '@/components/sections/SocialEngineeringSimulator';
import DeepfakeDetection from '@/components/sections/DeepfakeDetection';
import HowToProtect from '@/components/sections/HowToProtect';
import AboutProject from '@/components/sections/AboutProject';
import ContactForm from '@/components/sections/ContactForm';

export default function Home() {
  return (
    <>
      <Hero />
      <WhatIsDeepfake />
      <SocialEngineeringSimulator />
      <DeepfakeDetection />
      <HowToProtect />
      <AboutProject />
      <ContactForm />
    </>
  );
}
