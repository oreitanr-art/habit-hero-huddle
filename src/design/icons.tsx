import React from "react";

export type IconProps = {
  size?: number;
  className?: string;
  title?: string;
};

function SvgWrap({ size = 28, className, title, children }: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Coin */
export function CoinIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "coin"}>
      <defs>
        <linearGradient id="gCoin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--coin-2)" />
          <stop offset="1" stopColor="var(--coin)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="22" fill="url(#gCoin)" stroke="rgba(43,30,0,.35)" strokeWidth="3" />
      <circle cx="32" cy="32" r="14" fill="rgba(255,255,255,.18)" stroke="rgba(43,30,0,.22)" strokeWidth="3" />
      <path d="M28 24h8c3 0 5 2 5 5s-2 5-5 5h-8v10" fill="none" stroke="rgba(43,30,0,.55)" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 44h16" stroke="rgba(43,30,0,.55)" strokeWidth="4" strokeLinecap="round" />
    </SvgWrap>
  );
}

/** Wake with smile */
export function WakeSmileIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "wake"}>
      <path d="M18 40c0 10 8 18 18 18s18-8 18-18" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M22 22c3-5 8-8 14-8s11 3 14 8" fill="none" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="26" cy="34" r="3" fill="var(--ink)"/>
      <circle cx="38" cy="34" r="3" fill="var(--ink)"/>
      <path d="M26 42c3 4 9 4 12 0" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M10 28c3 0 6-2 8-6" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M54 28c-3 0-6-2-8-6" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Toilet */
export function ToiletIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "toilet"}>
      <path d="M24 18h16v12c0 6-5 10-10 10h-6V18Z" fill="rgba(59,130,246,.12)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M22 40h20l4 8H18l4-8Z" fill="rgba(251,191,36,.16)" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M28 24h8" stroke="rgba(43,30,0,.45)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M42 24h6" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Wash face (droplet + face) */
export function WashFaceIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "wash face"}>
      <circle cx="30" cy="30" r="14" fill="rgba(244,114,182,.12)" stroke="var(--accent)" strokeWidth="4"/>
      <circle cx="26" cy="28" r="2.5" fill="var(--ink)"/>
      <circle cx="34" cy="28" r="2.5" fill="var(--ink)"/>
      <path d="M25 35c3 3 7 3 10 0" fill="none" stroke="rgba(43,30,0,.45)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M48 18c0 6-7 10-7 16 0 4 3 7 7 7s7-3 7-7c0-6-7-10-7-16Z"
        fill="rgba(59,130,246,.16)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M44 43l-6 6" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Brush teeth */
export function TeethIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "brush teeth"}>
      <path d="M20 24c0-6 6-10 12-10s12 4 12 10c0 7-2 16-6 16-3 0-4-6-6-6s-3 6-6 6c-4 0-6-9-6-16Z"
        fill="rgba(255,255,255,.9)" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M14 40l12-12" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M10 44l6-6" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M28 20h8" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M44 38c2 0 4-2 4-4" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Comb / hair */
export function CombIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "comb"}>
      <path d="M18 26c5-8 12-12 22-10 6 1 10 5 12 10" fill="rgba(251,191,36,.18)" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M20 38h28" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M22 38v10M28 38v10M34 38v10M40 38v10M46 38v10" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M18 36c2-2 4-3 6-3" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Get dressed (shirt) */
export function ShirtIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "shirt"}>
      <path d="M22 18l10-6 10 6 8 6-6 10-4-2v22H24V32l-4 2-6-10 8-6Z"
        fill="rgba(59,130,246,.14)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M28 16c1 4 3 6 4 6s3-2 4-6" fill="none" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M30 30h4" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Shoes */
export function ShoesIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "shoes"}>
      <path d="M14 38c6 0 10-4 12-10l8 4c2 1 6 2 10 2 8 0 14 6 14 12H14V38Z"
        fill="rgba(244,114,182,.14)" stroke="var(--accent)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M18 40h6" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M38 40h6" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M26 28l3 1" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M30 30l3 1" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Make bed */
export function BedIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "bed"}>
      <path d="M16 28h32c6 0 10 4 10 10v10H6V38c0-6 4-10 10-10Z"
        fill="rgba(251,191,36,.18)" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M16 28v-6h18v6" fill="rgba(59,130,246,.14)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M8 50v6M56 50v6" stroke="rgba(43,30,0,.45)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="18" cy="34" r="3" fill="var(--accent)"/>
      <circle cx="28" cy="34" r="3" fill="var(--accent)"/>
    </SvgWrap>
  );
}

/** Pack bag (food & water) */
export function BagIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "bag"}>
      <path d="M22 22c0-6 4-10 10-10s10 4 10 10" fill="none" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M18 22h28l4 34H14l4-34Z"
        fill="rgba(34,197,94,.14)" stroke="var(--success)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M24 32h16" stroke="rgba(43,30,0,.35)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M42 34c0 5-4 9-9 9" fill="none" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M46 20c0 6-7 10-7 16 0 4 3 7 7 7s7-3 7-7c0-6-7-10-7-16Z"
        fill="rgba(59,130,246,.14)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round"/>
    </SvgWrap>
  );
}

/** Breakfast (plate + toast) */
export function BreakfastIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "breakfast"}>
      <circle cx="28" cy="40" r="14" fill="rgba(255,255,255,.9)" stroke="rgba(43,30,0,.35)" strokeWidth="4"/>
      <circle cx="28" cy="40" r="6" fill="rgba(251,191,36,.18)" stroke="rgba(43,30,0,.18)" strokeWidth="3"/>
      <path d="M44 26h10c3 0 5 2 5 5v4c0 3-2 5-5 5H44V26Z" fill="rgba(59,130,246,.14)" stroke="var(--primary)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M44 26v18" stroke="rgba(43,30,0,.30)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M20 26c2-4 6-6 10-6" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
    </SvgWrap>
  );
}

/** Check (success) */
export function CheckIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "check"}>
      <circle cx="32" cy="32" r="24" fill="rgba(34,197,94,.14)" stroke="var(--success)" strokeWidth="4"/>
      <path d="M20 32l8 8 18-18" fill="none" stroke="var(--success)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </SvgWrap>
  );
}

/** X (danger) */
export function XIcon(props: IconProps) {
  return (
    <SvgWrap {...props} title={props.title ?? "x"}>
      <circle cx="32" cy="32" r="24" fill="rgba(239,68,68,.12)" stroke="var(--danger)" strokeWidth="4"/>
      <path d="M22 22l20 20M42 22L22 42" stroke="var(--danger)" strokeWidth="6" strokeLinecap="round"/>
    </SvgWrap>
  );
}
