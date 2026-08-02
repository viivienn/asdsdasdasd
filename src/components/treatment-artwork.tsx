import { useId } from "react";

/**
 * Original, site-owned editorial illustrations for Aesthetic Index.
 * Newly drawn inline SVG artwork informed only by the general real-world
 * form factor of each product or device. No manufacturer photography,
 * logos, packaging artwork or trade dress is reproduced.
 */

const P = {
  ivory: "#F8F4ED",
  ivoryDeep: "#EFE7DA",
  card: "#FDFBF7",
  ink: "#2E2A26",
  inkSoft: "#6B655D",
  rule: "#DBD3C6",
  wine: "#7A2B3B",
  wineSoft: "#B98993",
  rose: "#E3C3B4",
  sage: "#AFC6B2",
  sageDeep: "#53705B",
  gold: "#C3A469",
  teal: "#6F9BA6",
  lavender: "#B7A8CD",
  glass: "#E9EEEC",
  steel: "#C9CCC8",
};

function Studio({ uid }: { uid: string }) {
  return (
    <g>
      <rect width="400" height="500" fill={`url(#${uid}-bg)`} />
      <ellipse cx="120" cy="90" rx="200" ry="150" fill={`url(#${uid}-key)`} />
      <ellipse cx="320" cy="380" rx="180" ry="150" fill={`url(#${uid}-wineglow)`} />
      <ellipse cx="70" cy="420" rx="170" ry="140" fill={`url(#${uid}-sageglow)`} />
    </g>
  );
}

function Floor({ uid, cx = 200, rx = 108, cy = 408 }: { uid: string; cx?: number; rx?: number; cy?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="17" fill={`url(#${uid}-shadow)`} />;
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor={P.card} />
        <stop offset="55%" stopColor={P.ivory} />
        <stop offset="100%" stopColor={P.ivoryDeep} />
      </linearGradient>
      <radialGradient id={`${uid}-key`}>
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-wineglow`}>
        <stop offset="0%" stopColor={P.wine} stopOpacity="0.13" />
        <stop offset="100%" stopColor={P.wine} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-sageglow`}>
        <stop offset="0%" stopColor={P.sageDeep} stopOpacity="0.1" />
        <stop offset="100%" stopColor={P.sageDeep} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-shadow`}>
        <stop offset="0%" stopColor={P.ink} stopOpacity="0.24" />
        <stop offset="70%" stopColor={P.ink} stopOpacity="0.07" />
        <stop offset="100%" stopColor={P.ink} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="22%" stopColor={P.glass} />
        <stop offset="70%" stopColor="#D5DCD8" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F2F2EF" />
        <stop offset="35%" stopColor={P.steel} />
        <stop offset="65%" stopColor="#EDEDE9" />
        <stop offset="100%" stopColor="#AFB3AF" />
      </linearGradient>
      <linearGradient id={`${uid}-shell`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#F0EBE2" />
        <stop offset="100%" stopColor="#DDD5C8" />
      </linearGradient>
    </defs>
  );
}

/* ---------- shared primitives ---------- */

function Vial({
  uid,
  x,
  y,
  w = 78,
  h = 150,
  label,
  accent,
  stripe,
}: {
  uid: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  accent: string;
  stripe?: string;
}) {
  return (
    <g>
      <rect x={x} y={y + 26} width={w} height={h - 26} rx={9} fill={`url(#${uid}-glass)`} stroke={P.rule} />
      <rect x={x + w * 0.28} y={y} width={w * 0.44} height={20} rx={4} fill={`url(#${uid}-glass)`} stroke={P.rule} />
      <rect x={x + w * 0.2} y={y + 12} width={w * 0.6} height={22} rx={6} fill={`url(#${uid}-metal)`} stroke={P.rule} />
      <rect x={x + w * 0.2} y={y + 20} width={w * 0.6} height={3} fill="#FFFFFF" opacity="0.7" />
      <rect x={x + 7} y={y + 62} width={w - 14} height={h - 92} rx={5} fill={label} stroke={P.rule} />
      {stripe ? <rect x={x + 7} y={y + 62} width={w - 14} height={7} rx={3} fill={stripe} /> : null}
      <rect x={x + 16} y={y + 82} width={w - 40} height={5} rx={2.5} fill={accent} opacity="0.85" />
      <rect x={x + 16} y={y + 94} width={w - 52} height={4} rx={2} fill={P.inkSoft} opacity="0.35" />
      <rect x={x + 16} y={y + 104} width={w - 30} height={3} rx={1.5} fill={P.inkSoft} opacity="0.22" />
      <rect x={x + 11} y={y + 34} width={7} height={h - 46} rx={3.5} fill="#FFFFFF" opacity="0.55" />
    </g>
  );
}

function Syringe({
  uid,
  x,
  y,
  h = 250,
  gel,
  accent,
}: {
  uid: string;
  x: number;
  y: number;
  h?: number;
  gel: string;
  accent: string;
}) {
  const w = 46;
  return (
    <g>
      <rect x={x - 16} y={y} width={w + 32} height={12} rx={6} fill={`url(#${uid}-shell)`} stroke={P.rule} />
      <rect x={x + 14} y={y + 12} width={18} height={40} rx={9} fill={`url(#${uid}-metal)`} />
      <rect x={x} y={y + 46} width={w} height={h - 96} rx={14} fill={`url(#${uid}-glass)`} stroke={P.rule} />
      <rect x={x + 6} y={y + 78} width={w - 12} height={h - 142} rx={9} fill={gel} opacity="0.75" />
      <rect x={x + 9} y={y + 54} width={6} height={h - 108} rx={3} fill="#FFFFFF" opacity="0.6" />
      <rect x={x - 6} y={y + h - 52} width={w + 12} height={14} rx={7} fill={accent} />
      <path
        d={`M${x + 18} ${y + h - 38} l5 30 l5 -30 z`}
        fill={`url(#${uid}-metal)`}
        stroke={P.rule}
        strokeWidth="0.6"
      />
      <rect x={x + 9} y={y + 60} width={w - 18} height={2} fill={P.inkSoft} opacity="0.2" />
      <rect x={x + 9} y={y + 70} width={w - 26} height={2} fill={P.inkSoft} opacity="0.16" />
    </g>
  );
}

function Carton({
  uid,
  x,
  y,
  w,
  h,
  body,
  accent,
}: {
  uid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  body: string;
  accent: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={body} stroke={P.rule} />
      <rect x={x} y={y} width={w * 0.34} height={h} rx={6} fill="#FFFFFF" opacity="0.35" />
      <rect x={x} y={y + h * 0.2} width={w} height={8} fill={accent} opacity="0.9" />
      <rect x={x + 10} y={y + h * 0.38} width={w - 30} height={4} rx={2} fill={P.inkSoft} opacity="0.35" />
      <rect x={x + 10} y={y + h * 0.46} width={w - 42} height={4} rx={2} fill={P.inkSoft} opacity="0.2" />
      <rect x={x + 10} y={y + h * 0.72} width={18} height={18} rx={4} fill={accent} opacity="0.3" />
    </g>
  );
}

function Console({
  uid,
  x,
  y,
  w,
  h,
  screen,
}: {
  uid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  screen: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill={`url(#${uid}-shell)`} stroke={P.rule} />
      <rect x={x + 14} y={y + 16} width={w - 28} height={h * 0.34} rx={10} fill={screen} />
      <rect x={x + 14} y={y + 16} width={w - 28} height={h * 0.12} rx={10} fill="#FFFFFF" opacity="0.18" />
      <rect x={x + 22} y={y + h * 0.56} width={w - 44} height={5} rx={2.5} fill={P.inkSoft} opacity="0.25" />
      <rect x={x + 22} y={y + h * 0.66} width={w - 74} height={5} rx={2.5} fill={P.inkSoft} opacity="0.16" />
    </g>
  );
}

function Handpiece({
  uid,
  x,
  y,
  rotate = 0,
  body,
  tip,
}: {
  uid: string;
  x: number;
  y: number;
  rotate?: number;
  body: string;
  tip: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="0" y="0" width="40" height="112" rx="16" fill={body} stroke={P.rule} strokeWidth="0.8" />
      <rect x="6" y="10" width="8" height="86" rx="4" fill="#FFFFFF" opacity="0.35" />
      <rect x="8" y="104" width="24" height="16" rx="5" fill={tip} />
      <rect x="10" y="30" width="20" height="5" rx="2.5" fill="#FFFFFF" opacity="0.4" />
    </g>
  );
}

/* ---------- per-product artwork ---------- */

type Art = (uid: string) => React.ReactElement;

const botox: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={86} cy={402} />
    <Vial uid={uid} x={161} y={228} label="#EDE7F3" accent={P.lavender} stripe={P.lavender} />
    <path d="M120 300 h30 M250 300 h30" stroke={P.rule} strokeWidth="2" strokeLinecap="round" />
    <circle cx="112" cy="300" r="4" fill={P.lavender} opacity="0.6" />
    <circle cx="288" cy="300" r="4" fill={P.wineSoft} opacity="0.6" />
  </g>
);

const dysport: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={92} cy={404} />
    <Vial uid={uid} x={152} y={218} w={86} h={166} label="#FBFBF9" accent={P.teal} stripe={P.teal} />
    <rect x="120" y="356" width="160" height="6" rx="3" fill={P.teal} opacity="0.18" />
    <circle cx="300" cy="214" r="26" fill={P.teal} opacity="0.1" />
  </g>
);

const haFiller: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={70} cy={412} />
    <path
      d="M60 360 q60 -34 130 -12 q70 22 150 -14"
      fill="none"
      stroke={P.sage}
      strokeWidth="8"
      opacity="0.35"
      strokeLinecap="round"
    />
    <path
      d="M60 384 q70 -22 140 -4 q70 18 140 -18"
      fill="none"
      stroke={P.rose}
      strokeWidth="6"
      opacity="0.4"
      strokeLinecap="round"
    />
    <g transform="rotate(-14 200 240)">
      <Syringe uid={uid} x={177} y={110} h={250} gel={P.sage} accent={P.wineSoft} />
    </g>
    <circle cx="292" cy="176" r="12" fill={P.sage} opacity="0.4" />
    <circle cx="316" cy="204" r="7" fill={P.sage} opacity="0.28" />
  </g>
);

const juvederm: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={116} cy={406} />
    <Carton uid={uid} x={92} y={186} w={62} h={206} body="#F6E4DE" accent={P.rose} />
    <Carton uid={uid} x={166} y={162} w={68} h={230} body="#FBF6EE" accent={P.wineSoft} />
    <Carton uid={uid} x={246} y={200} w={62} h={192} body="#F2E3E5" accent={P.wine} />
    <rect x="92" y="392" width="216" height="4" rx="2" fill={P.ink} opacity="0.08" />
  </g>
);

const restylane: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={116} cy={406} />
    <Carton uid={uid} x={92} y={198} w={62} h={194} body="#FBF8F1" accent={P.sageDeep} />
    <Carton uid={uid} x={166} y={166} w={68} h={226} body="#E8E6E1" accent={P.teal} />
    <Carton uid={uid} x={246} y={188} w={62} h={204} body="#F4F1EA" accent={P.ink} />
    <rect x="92" y="392" width="216" height="4" rx="2" fill={P.ink} opacity="0.08" />
  </g>
);

const voluma: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={92} cy={410} />
    <path
      d="M96 190 q40 -46 104 -46 q64 0 104 46"
      fill="none"
      stroke={P.gold}
      strokeWidth="5"
      opacity="0.35"
      strokeLinecap="round"
    />
    <path
      d="M112 226 q34 62 88 78"
      fill="none"
      stroke={P.wineSoft}
      strokeWidth="4"
      opacity="0.35"
      strokeLinecap="round"
    />
    <path
      d="M288 226 q-34 62 -88 78"
      fill="none"
      stroke={P.wineSoft}
      strokeWidth="4"
      opacity="0.35"
      strokeLinecap="round"
    />
    <Carton uid={uid} x={112} y={214} w={62} h={178} body="#F7EFDF" accent={P.gold} />
    <g transform="rotate(6 236 300)">
      <Syringe uid={uid} x={214} y={168} h={222} gel={P.gold} accent={P.wine} />
    </g>
  </g>
);

const kysse: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={92} cy={410} />
    <path
      d="M120 172 q40 -30 80 0 q40 -30 80 0 q-40 46 -80 46 q-40 0 -80 -46"
      fill="none"
      stroke={P.wineSoft}
      strokeWidth="4"
      opacity="0.5"
      strokeLinecap="round"
    />
    <path d="M120 172 h160" stroke={P.rose} strokeWidth="3" opacity="0.5" strokeLinecap="round" />
    <Carton uid={uid} x={112} y={232} w={62} h={160} body="#F9EDEC" accent="#C0596A" />
    <g transform="rotate(6 236 312)">
      <Syringe uid={uid} x={214} y={192} h={200} gel="#E7B6BC" accent={P.wine} />
    </g>
  </g>
);

const sculptra: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={82} cy={406} />
    {[
      [138, 210, 5],
      [162, 176, 4],
      [196, 152, 6],
      [232, 174, 4],
      [258, 206, 5],
      [210, 122, 3],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={P.sageDeep} opacity={0.14 + i * 0.05} />
    ))}
    <path
      d="M132 236 q68 -60 136 0"
      fill="none"
      stroke={P.sage}
      strokeWidth="4"
      opacity="0.45"
      strokeLinecap="round"
    />
    <Vial uid={uid} x={158} y={238} w={84} h={148} label="#F6F5EE" accent={P.sageDeep} stripe={P.sage} />
    <rect x="167" y="330" width="66" height="42" rx={5} fill="#E9E5D8" opacity="0.9" />
    <rect x="167" y="330" width="66" height="6" rx={3} fill="#FFFFFF" opacity="0.5" />
  </g>
);

const radiesse: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={74} cy={412} />
    <path
      d="M70 330 q66 -40 132 -8 q66 32 130 -18"
      fill="none"
      stroke="#D9C7A4"
      strokeWidth="10"
      opacity="0.35"
      strokeLinecap="round"
    />
    <g transform="rotate(-10 200 240)">
      <Syringe uid={uid} x={177} y={108} h={252} gel="#F1EDE4" accent="#B99A63" />
      <g>
        {[
          [190, 200],
          [206, 218],
          [196, 240],
          [212, 262],
          [198, 286],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="6" fill="#FFFFFF" stroke="#D8CEBB" />
        ))}
      </g>
    </g>
    <circle cx="300" cy="196" r="8" fill={P.gold} opacity="0.35" />
  </g>
);

const thermage: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={116} cy={414} />
    <g opacity="0.4">
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M74 ${150 + i * 22} q126 -${52 - i * 8} 252 0`}
          fill="none"
          stroke={P.wineSoft}
          strokeWidth={4 - i}
          strokeLinecap="round"
        />
      ))}
    </g>
    <Console uid={uid} x={80} y={216} w={168} h={176} screen="#3B3A37" />
    <circle cx="164" cy="352" r="16" fill="none" stroke={P.teal} strokeWidth="4" opacity="0.7" />
    <Handpiece uid={uid} x={266} y={244} rotate={10} body="#F2EDE4" tip={P.wine} />
  </g>
);

const ultherapy: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={118} cy={414} />
    <Console uid={uid} x={72} y={186} w={180} h={206} screen="#33383A" />
    <g>
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={104 + col * 36}
            cy={216 + row * 18}
            r="3.2"
            fill={P.teal}
            opacity={0.85 - row * 0.22}
          />
        )),
      )}
    </g>
    <path
      d="M96 300 h150 M96 314 h120 M96 328 h90"
      stroke={P.inkSoft}
      strokeWidth="3"
      opacity="0.18"
      strokeLinecap="round"
    />
    <Handpiece uid={uid} x={272} y={230} rotate={8} body="#FAF7F1" tip={P.teal} />
  </g>
);

const morpheus8: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={86} cy={412} />
    <rect x="128" y="122" width="144" height="118" rx="16" fill="#2F2F2E" opacity="0.08" />
    <g>
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={152 + col * 24}
            cy={146 + row * 22}
            r="3"
            fill={P.wineSoft}
            opacity={0.35 + row * 0.15}
          />
        )),
      )}
    </g>
    <g transform="translate(146 246) rotate(-6)">
      <rect x="0" y="0" width="112" height="52" rx="20" fill="#3A3733" />
      <rect x="10" y="10" width="52" height="10" rx="5" fill="#FFFFFF" opacity="0.16" />
      <rect x="96" y="14" width="46" height="130" rx="18" fill="#312E2B" transform="rotate(18 96 14)" />
    </g>
    <rect x="150" y="326" width="120" height="12" rx="6" fill={P.wine} opacity="0.18" />
  </g>
);

const potenza: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={112} cy={414} />
    <Console uid={uid} x={86} y={198} w={164} h={194} screen="#EDE9E1" />
    <g>
      {[
        [0, 0, P.wineSoft],
        [1, 0, P.sage],
        [0, 1, P.teal],
        [1, 1, P.gold],
      ].map(([col, row, fill], i) => (
        <rect
          key={i}
          x={116 + (col as number) * 52}
          y={224 + (row as number) * 30}
          width="42"
          height="22"
          rx="6"
          fill={fill as string}
          opacity="0.6"
        />
      ))}
    </g>
    <Handpiece uid={uid} x={268} y={236} rotate={10} body="#FBF8F2" tip={P.sageDeep} />
    <path
      d="M264 214 q26 -24 54 -10"
      fill="none"
      stroke={P.rule}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </g>
);

const hydrafacial: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={112} cy={414} />
    <path
      d="M118 356 q40 -70 108 -54 q66 16 96 -52"
      fill="none"
      stroke={P.sage}
      strokeWidth="12"
      opacity="0.35"
      strokeLinecap="round"
    />
    <path
      d="M118 366 q46 -60 110 -44 q60 14 92 -46"
      fill="none"
      stroke={P.teal}
      strokeWidth="6"
      opacity="0.3"
      strokeLinecap="round"
    />
    <Console uid={uid} x={84} y={200} w={150" .length ? 150 : 150} h={192} screen="#31393B" />
    <path
      d="M234 250 q40 10 26 40 q-14 30 22 42"
      fill="none"
      stroke={P.rule}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <Handpiece uid={uid} x={278} y={238} rotate={12} body="#FAF8F3" tip={P.teal} />
  </g>
);

const diamondglow: Art = (uid) => (
  <g>
    <Floor uid={uid} rx={100} cy={414} />
    <g transform="translate(200 152)">
      <path d="M0 -46 L38 -12 L0 46 L-38 -12 Z" fill="#F3EEE3" stroke={P.rule} />
      <path d="M0 -46 L0 46 M-38 -12 L38 -12 M-20 -30 L0 46 M20 -30 L0 46" stroke={P.gold} strokeWidth="1.6" opacity="0.7" />
      <path d="M0 -46 L38 -12 L0 46 Z" fill="#FFFFFF" opacity="0.28" />
    </g>
    <Console uid={uid} x={96} y={228} w={144} h={164} screen="#EAE5DB" />
    <path
      d="M240 288 q34 8 24 34"
      fill="none"
      stroke={P.rule}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <Handpiece uid={uid} x={266} y={252} rotate={12} body="#F7F1E6" tip={P.sageDeep} />
    <circle cx="120" cy="196" r="6" fill={P.sage} opacity="0.4" />
    <circle cx="300" cy="204" r="9" fill={P.gold} opacity="0.28" />
  </g>
);

const ART: Record<string, Art> = {
  botox,
  dysport,
  "ha-filler": haFiller,
  juvederm,
  restylane,
  "juvederm-voluma": voluma,
  "restylane-kysse": kysse,
  sculptra,
  radiesse,
  thermage,
  ultherapy,
  morpheus8,
  potenza,
  hydrafacial,
  diamondglow,
};

export function hasTreatmentArtwork(slug: string) {
  return Boolean(ART[slug]);
}

export function TreatmentArtwork({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const art = ART[slug];
  if (!art) return null;

  return (
    <svg
      role="img"
      aria-label={`Original editorial illustration of ${name}`}
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <Defs uid={uid} />
      <Studio uid={uid} />
      {art(uid)}
    </svg>
  );
}
