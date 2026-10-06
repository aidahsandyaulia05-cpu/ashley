import Hero from "@/components/home/Hero";
import Journey from "@/components/home/Journey";
import CoralLab from "@/components/home/CoralLab";
import ChooseCoral from "@/components/home/ChooseCoral";
import { AdoptionTypes, OnlineOnsite } from "@/components/home/AdoptionTypes";
import Impact from "@/components/home/Impact";
import Community from "@/components/home/Community";
import Stories from "@/components/home/Stories";
import { Programs, GetInvolved } from "@/components/home/Programs";
import CertificateTeaser from "@/components/home/CertificateTeaser";

export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <Journey />
      <ChooseCoral />
      <CoralLab />
      <AdoptionTypes />
      <OnlineOnsite />
      <CertificateTeaser />
      <Impact />
      <Programs />
      <Community />
      <Stories />
      <GetInvolved />
    </div>
  );
}
