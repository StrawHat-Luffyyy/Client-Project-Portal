import { RequirementDetailClient } from './requirement-detail-client';

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequirementDetailClient requirementId={id} />;
}
