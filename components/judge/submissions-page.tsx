"use client";

import { JudgeNav } from "@/components/judge/judge-nav";
import { JudgeDataTable } from "@/components/judge/judge-data-table";
import { columns } from "@/components/judge/judge-submissions-columns";
import type { JudgeSubmissionRow } from "@/components/judge/judge-submissions-columns";

const dummyData: JudgeSubmissionRow[] = [
  {
    _id: 1,
    teamName: "Byte Brawlers",
    projectName: "EcoRoute",
    description:
      "EcoRoute helps commuters choose greener travel options by calculating real-time carbon footprints for multiple transit modes.",
    devpost: "https://devpost.com/software/ecoroute-nx7k2",
    github: ["https://github.com/bytebrawlers/ecoroute"],
    figma: ["https://figma.com/file/ecoroute"],
    canva: [],
    presentation: "https://slides.com/bytebrawlers/ecoroute",
    invites: ["alice@example.com", "bob@example.com"],
    timestamp: new Date("2026-03-15T14:30:00Z").getTime(),
  },
  {
    _id: 2,
    teamName: "Circuit Sisters",
    projectName: "MediConnect",
    description:
      "MediConnect streamlines patient referrals between clinics using a secure, HIPAA-compliant messaging platform.",
    devpost: "https://devpost.com/software/mediconnect-j3h9",
    github: [
      "https://github.com/circuitsisters/mediconnect-frontend",
      "https://github.com/circuitsisters/mediconnect-backend",
    ],
    figma: [],
    canva: ["https://canva.com/design/mediconnect"],
    presentation: "",
    invites: ["carol@example.com", "dave@example.com", "eve@example.com"],
    timestamp: new Date("2026-03-15T15:10:00Z").getTime(),
  },
  {
    _id: 3,
    teamName: "Hack Heroes",
    projectName: "CampusEats",
    description:
      "CampusEats reduces food waste by connecting students with surplus dining-hall meals at discounted prices.",
    devpost: "https://devpost.com/software/campuseats-w4r1",
    github: ["https://github.com/hackheroes/campuseats"],
    figma: [],
    canva: [],
    presentation: "https://slides.com/hackheroes/campuseats",
    invites: ["frank@example.com"],
    timestamp: new Date("2026-03-15T16:45:00Z").getTime(),
  },
  {
    _id: 4,
    teamName: "Debug Divas",
    projectName: "SkillSwap",
    description:
      "SkillSwap is a peer-to-peer learning marketplace where users exchange lessons in coding, design, and data science.",
    devpost: "https://devpost.com/software/skillswap-t5v2",
    github: [],
    figma: ["https://figma.com/file/skillswap"],
    canva: ["https://canva.com/design/skillswap"],
    presentation: "https://slides.com/debugdivas/skillswap",
    invites: ["grace@example.com", "heidi@example.com", "ivan@example.com"],
    timestamp: new Date("2026-03-16T09:20:00Z").getTime(),
  },
  {
    _id: 5,
    teamName: "Trojan Coders",
    projectName: "GreenPulse",
    description:
      "GreenPulse monitors office energy usage and suggests simple adjustments to cut costs and carbon emissions.",
    devpost: "https://devpost.com/software/greenpulse-m8z3",
    github: ["https://github.com/trojancoders/greenpulse"],
    figma: [],
    canva: [],
    presentation: "",
    invites: ["judy@example.com", "karl@example.com"],
    timestamp: new Date("2026-03-16T10:05:00Z").getTime(),
  },
  {
    _id: 6,
    teamName: "Quantum Quokkas",
    projectName: "StudyBuddy",
    description:
      "StudyBuddy uses spaced repetition and AI-generated quizzes to help students retain information faster.",
    devpost: "https://devpost.com/software/studybuddy-l2p9",
    github: [
      "https://github.com/quantumquokkas/studybuddy-web",
      "https://github.com/quantumquokkas/studybuddy-ml",
    ],
    figma: ["https://figma.com/file/studybuddy"],
    canva: [],
    presentation: "https://slides.com/quantumquokkas/studybuddy",
    invites: ["leo@example.com"],
    timestamp: new Date("2026-03-16T11:30:00Z").getTime(),
  },
];

interface SubmissionsPageProps {
  tenant: string;
}

export function SubmissionsPage({ tenant }: SubmissionsPageProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:py-10">
      <JudgeNav tenant={tenant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Project Submissions</h1>
        <p className="text-sm text-muted-foreground">
          Browse all submitted team projects, demo links, and resources.
        </p>
      </div>

      <JudgeDataTable
        data={dummyData}
        columns={columns}
        csvFields={["teamName", "projectName", "description", "devpost", "github", "figma", "canva", "presentation", "invites", "timestamp"]}
      />
    </div>
  );
}
