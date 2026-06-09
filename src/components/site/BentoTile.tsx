import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

interface Props {
  to: string;
  title: string;
  caption?: string;
  image: string;
  className?: string;
}

/** Image-led bento tile used on the homepage Explore section. */
export function BentoTile({ to, title, caption, image, className = "" }: Props) {
  return (
    <Link to={to}
      className={`group relative isolate flex h-full min-h-[180px] flex-col justify-end overflow-hidden rounded-3xl shadow-stadium ${className}`}>
      <img src={image} alt="" loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="flex items-end justify-between gap-3 p-5">
        <div>
          {caption && <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{caption}</div>}
          <h3 className="font-display text-2xl text-foreground md:text-3xl">{title}</h3>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-gold-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
