import ErrorPage from "@/components/ui/ErrorPage";

export default function TooManyRequestsPage() {
  return <ErrorPage code="429" />;
}
