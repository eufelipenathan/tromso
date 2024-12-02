import { PipelineDetails } from "@/components/pipelines/pipeline-details";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PipelinePageProps {
  params: {
    id: string;
  };
}

export default async function PipelinePage({ params }: PipelinePageProps) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          deals: {
            where: { deletedAt: null },
            include: {
              company: true,
              contact: true,
            },
          },
        },
      },
    },
  });

  if (!pipeline) {
    notFound();
  }

  return <PipelineDetails pipeline={pipeline} />;
}