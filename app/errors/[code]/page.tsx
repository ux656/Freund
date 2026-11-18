import { notFound } from "next/navigation";
import ErrorPage, { type ErrorCode } from "@/components/ui/ErrorPage";

const AVAILABLE_CODES: ErrorCode[] = ["404", "500", "429", "408"];

export default function StatusErrorPage({ params }: { params: { code: string } }) {
  if (!AVAILABLE_CODES.includes(params.code as ErrorCode)) notFound();
  return <ErrorPage code={params.code as ErrorCode} />;
}
