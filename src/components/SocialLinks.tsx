import { NAP } from "@/lib/site";
import { FacebookIcon, InstagramIcon } from "./Icons";

export function SocialLinks({ tone = "white" }: { tone?: "white" | "navy" }) {
  return (
    <div className={tone === "navy" ? "social social--navy" : "social"}>
      <a href={NAP.facebook} target="_blank" rel="noopener noreferrer" aria-label="Kent Bespoke Carpentry on Facebook"><FacebookIcon /></a>
      <a href={NAP.instagram} target="_blank" rel="noopener noreferrer" aria-label="Kent Bespoke Carpentry on Instagram"><InstagramIcon /></a>
    </div>
  );
}
