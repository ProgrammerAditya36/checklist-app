import { ChecklistPage } from "@/components/checklist/ChecklistPage";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ChecklistSharePage({ params }: PageProps) {
  return <ChecklistPage checklistId={params.id} />;
}
