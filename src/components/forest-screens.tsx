import type { ReactNode } from "react";
import forestBg from "@/assets/forest-bg.jpg";
import logo from "@/assets/lawl-logo.png";
import knight from "@/assets/voc-knight.png";
import paladin from "@/assets/voc-paladin.png";
import sorcerer from "@/assets/voc-sorcerer.png";
import druid from "@/assets/voc-druid.png";
import { cn } from "@/lib/utils";

const VOCATION_ART: Record<string, string> = { knight, paladin, sorcerer, druid };
const VOCATION_LABEL: Record<string, string> = { knight: "Knight", paladin: "Paladin", sorcerer: "Sorcerer", druid: "Druid" };

/** Full-screen misty forest backdrop shared by the loading, sign-in and character screens. */
export function ForestScreen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-forest font-body">
      <img src={forestBg} alt="" aria-hidden="true" width={1600} height={907} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-outline/25" aria-hidden="true" />
      <div className={cn("relative z-10 flex min-h-[100dvh] flex-col items-center", className)}>{children}</div>
    </div>
  );
}

export function GameLogo({ className }: { className?: string }) {
  return (
    <img src={logo} alt="Reinos de Lawl" width={504} height={512}
      className={cn("pixelated border-2 border-outline shadow-[0_8px_24px_var(--outline)]", className)} />
  );
}

export function LoadingScreen() {
  return (
    <div role="status" aria-label="Carregando" className="pointer-events-none fixed inset-0 z-50 animate-splash">
      <ForestScreen className="justify-center px-6">
        <GameLogo className="w-44 sm:w-56" />
        <div className="absolute inset-x-4 bottom-8 sm:inset-x-10">
          <p className="mb-2 text-center text-xl text-panel game-text">Carregando…</p>
          <div className="h-5 overflow-hidden rounded-sm border-2 border-outline bg-loading-track">
            <div className="h-full animate-load-bar bg-loading" />
          </div>
        </div>
      </ForestScreen>
    </div>
  );
}

export function HeroCard({ name, voc, level, selected, onSelect }: {
  name: string; voc: string; level: number; selected: boolean; onSelect: () => void;
}) {
  const art = VOCATION_ART[voc];
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={cn(
        "relative flex h-64 w-40 shrink-0 snap-center flex-col rounded-game border-2 border-outline bg-hero-card pt-6 shadow-[inset_0_-6px_0_var(--hero-card-shade)] transition-transform",
        selected ? "scale-105 ring-4 ring-level" : "opacity-90 hover:opacity-100",
      )}>
      <span className="-ml-2 mr-3 truncate rounded-r-sm border-2 border-outline bg-ribbon px-2 py-0.5 text-lg text-level game-text">{name}</span>
      <span className="flex flex-1 items-center justify-center">
        {art ? <img src={art} alt="" aria-hidden="true" width={256} height={256} className="pixelated h-28 w-28 object-contain" />
          : <span className="text-5xl text-panel game-text">{name.charAt(0)}</span>}
      </span>
      <span className="mb-4 flex items-center justify-between pr-3">
        <span className="rounded-r-md border-2 border-l-0 border-outline bg-hero-card-shade px-2 py-0.5 text-sm text-panel game-text">{VOCATION_LABEL[voc] ?? voc}</span>
        <span className="text-2xl text-level game-text">{level}</span>
      </span>
    </button>
  );
}

export function NewHeroCard({ disabled, onCreate }: { disabled: boolean; onCreate: () => void }) {
  return (
    <button type="button" onClick={onCreate} disabled={disabled}
      className="flex h-64 w-40 shrink-0 snap-center items-center justify-center rounded-game border-2 border-outline bg-hero-empty px-3 text-center text-xl leading-tight text-panel game-text hover:brightness-125 disabled:opacity-50">
      {disabled ? "Limite de 5 personagens" : <span>Criar<br />Novo Personagem</span>}
    </button>
  );
}
