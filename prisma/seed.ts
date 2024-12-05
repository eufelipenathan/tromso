import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create default lost reasons
  const lostReasons = [
    'Preço alto',
    'Escolheu concorrente',
    'Sem orçamento',
    'Timing inadequado',
    'Sem necessidade atual',
  ];

  for (const reason of lostReasons) {
    await prisma.lostReason.upsert({
      where: { name: reason },
      update: {},
      create: { name: reason },
    });
  }

  // Create default pipeline
  const pipeline = await prisma.pipeline.upsert({
    where: { name: 'Pipeline Padrão' },
    update: {},
    create: {
      name: 'Pipeline Padrão',
      order: 0,
      stages: {
        create: [
          { name: 'Prospecção', order: 0 },
          { name: 'Primeiro Contato', order: 1 },
          { name: 'Apresentação', order: 2 },
          { name: 'Proposta', order: 3 },
          { name: 'Negociação', order: 4 },
          { name: 'Fechamento', order: 5 },
        ],
      },
    },
  });

  // Create sample company
  const company = await prisma.company.upsert({
    where: { name: 'Empresa Exemplo' },
    update: {},
    create: {
      name: 'Empresa Exemplo',
      email: 'contato@exemplo.com',
      phone: '11999999999',
      website: 'https://exemplo.com',
      contacts: {
        create: [
          {
            name: 'João Silva',
            email: 'joao@exemplo.com',
            phone: '11999999999',
            position: 'Diretor Comercial',
          },
        ],
      },
    },
  });

  // Get first stage
  const firstStage = await prisma.stage.findFirst({
    where: { pipelineId: pipeline.id, order: 0 },
  });

  if (firstStage && company) {
    const contact = await prisma.contact.findFirst({
      where: { companyId: company.id },
    });

    if (contact) {
      // Create sample deal
      await prisma.deal.create({
        data: {
          title: 'Projeto Exemplo',
          value: 10000,
          companyId: company.id,
          contactId: contact.id,
          stageId: firstStage.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });