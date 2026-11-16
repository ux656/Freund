"use client";

import { Github, Mail, MessageCircle, Linkedin, Twitter } from "lucide-react";

const leader = {
  name: "أحمد محمود",
  role: "قائد فريق التطوير",
  bio: "مسؤول عن تنظيم الفريق والإشراف على جميع المشاريع.",
  verified: true,
  contacts: { github: "ahmed", email: "ahmed@example.com", website: "/" },
};

const devs = [
  { name: "سارة علي", role: "مطور واجهات أمامية", verified: true, contacts: { github: "sara", email: "sara@example.com" } },
  { name: "محمد خالد", role: "مطور واجهات خلفية", contacts: { github: "mohamed", linkedin: "mohamed" } },
  { name: "نورا حسن", role: "مهندس بيانات", contacts: { telegram: "nora", github: "nora" } },
];

const iconMap = { github: Github, email: Mail, telegram: MessageCircle, linkedin: Linkedin, twitter: Twitter };

function ContactIcons({ contacts }: { contacts: Record<string, string | undefined> }) {
  return (
    <div className="flex gap-1.5">
      {Object.entries(contacts).map(([k, v]) => {
        const Icon = iconMap[k as keyof typeof iconMap];
        if (!Icon || !v) return null;
        const url =
          k === "email" ? `mailto:${v}` : k === "github" ? `https://github.com/${v}` : k === "telegram" ? `https://t.me/${v}` : k === "linkedin" ? `https://linkedin.com/in/${v}` : v;
        return (
          <a key={k} href={url} target="_blank" rel="noopener" className="grid size-8 place-items-center rounded-lg border border-border bg-surface-2 text-text-2 transition-colors hover:border-primary/40 hover:text-primary">
            {k === "website" ? <img src="/reboot.png" alt="Reboot" className="size-5 object-contain" /> : Icon ? <Icon size={14} /> : null}
          </a>
        );
      })}
    </div>
  );
}

export default function Developers() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">فريق التطوير</h1>

      <div className="lg lg-surface rounded-glass p-6 text-center">
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border-2 border-primary/30 bg-primary/10 text-2xl font-semibold text-primary">
          {leader.name.charAt(0)}
        </div>
        <h2 className="text-lg font-semibold">{leader.name} {leader.verified && "✓"}</h2>
        <p className="text-xs text-primary">{leader.role}</p>
        <p className="mx-auto mt-2 max-w-xs text-xs text-text-2">{leader.bio}</p>
        <div className="mt-3 flex justify-center"><ContactIcons contacts={leader.contacts} /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {devs.map((d) => (
          <div key={d.name} className="lg lg-regular rounded-glass p-5 text-center">
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full border border-border bg-surface-2 text-lg font-semibold">
              {d.name.charAt(0)}
            </div>
            <h3 className="text-sm font-semibold">{d.name} {d.verified && "✓"}</h3>
            <p className="mb-2 text-[11px] text-text-2">{d.role}</p>
            <div className="flex justify-center"><ContactIcons contacts={d.contacts} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
