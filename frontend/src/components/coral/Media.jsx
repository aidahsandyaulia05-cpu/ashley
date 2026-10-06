import { mediaSrc } from "@/lib/api";

export const Media = ({ item, className = "", controls = true, testid }) =>
  item.kind === "video" ? (
    <video src={mediaSrc(item.url)} className={className} controls={controls} muted={!controls} playsInline preload="metadata" data-testid={testid} />
  ) : (
    <img src={mediaSrc(item.url)} alt="" loading="lazy" className={className} data-testid={testid} />
  );
