import { CompanyProfile } from "@/components/companies/company-profile";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface CompanyPageProps {
  params: {
    id: string;
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      contacts: true,
      deals: {
        include: {
          stage: {
            include: {
              pipeline: true,
            },
          },
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return <CompanyProfile company={company} />;
}