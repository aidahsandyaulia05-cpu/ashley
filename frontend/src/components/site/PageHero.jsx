import { Reveal } from "./Bits";

export const PageHero = ({ image, eyebrow, title, sub, children, testid }) => (
  <section className="relative overflow-hidden bg-abyss pb-24 pt-40 text-ivory sm:pb-32 sm:pt-48" data-testid={testid}>
    <img src={image} alt="" className="water absolute inset-0 h-full w-full object-cover opacity-55" />
    <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/75 to-abyss/10" />
    <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-transparent" />
    <div className="rays absolute inset-0" />
    <div className="container-x relative">
      <Reveal className="max-w-3xl">
        <p className="eyebrow text-seafoam">{eyebrow}</p>
        <h1 className="display mt-5 text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {sub && <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">{sub}</p>}
        {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
      </Reveal>
    </div>
  </section>
);
