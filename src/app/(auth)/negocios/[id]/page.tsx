import { DealDetails } from "@/components/deals/deal-details";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface DealPageProps {
  params: {
    id: string;
  };
}

export default async function DealPage({ params }: DealPageProps) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      contact: true,
      stage: {
        include: {
          pipeline: true,
        },
      },
      lostReason: true,
    },
  });

  if (!deal) {
    notFound();
  }

  return <DealDetails deal={deal} />;
}