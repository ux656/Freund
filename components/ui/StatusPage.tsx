import Image from "next/image";
import Link from "next/link";

type StatusPageProps = {
  code: 404 | 408 | 429 | 500;
  title: string;
  description: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function StatusPage({
  code,
  title,
  description,
  detail,
  actionLabel = "العودة للرئيسية",
  actionHref = "/",
}: StatusPageProps) {
  return (
    <div className="project-hold-screen" role="main">
      <main className="project-hold-content">
        <div className="project-hold-brand">
          <span className="project-hold-brand-mark">B</span>
          <span>BMG BOT</span>
        </div>
        <div className="project-hold-error" aria-label={`Error ${code}`}>{code}</div>
        <div className="project-hold-robot">
          <Image src="/reboot.png" alt="BMG Bot" width={172} height={172} priority />
        </div>
        <h1>{title}</h1>
        <p className="project-hold-lead">{description}</p>
        <p className="project-hold-copy">{detail}</p>
        <Link href={actionHref} className="project-hold-status">
          <span>{actionLabel}</span>
        </Link>
      </main>
    </div>
  );
}
