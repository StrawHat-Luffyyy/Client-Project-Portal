import {
  PrismaClient,
  RequirementPriority,
  RequirementStatus,
  Role,
  TaskStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'DemoPass123!';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.$transaction(async (transaction) => {
    await transaction.organization.upsert({
      where: { id: 'demo-organization' },
      update: { name: 'Northstar Digital' },
      create: { id: 'demo-organization', name: 'Northstar Digital' },
    });

    const clients = [
      ['demo-client-acme', 'Acme Manufacturing', 'client@demo.local'],
      ['demo-client-globex', 'Globex Retail', 'operations@globex.demo'],
    ] as const;

    for (const [id, name, contactEmail] of clients) {
      await transaction.client.upsert({
        where: { id },
        update: { name, contactEmail },
        create: { id, organizationId: 'demo-organization', name, contactEmail },
      });
    }

    const users = [
      ['demo-admin', 'Avery Admin', 'admin@demo.local', Role.ADMIN, null],
      ['demo-pm', 'Priya Manager', 'pm@demo.local', Role.PM, null],
      [
        'demo-engineer',
        'Eli Engineer',
        'engineer@demo.local',
        Role.ENGINEER,
        null,
      ],
      [
        'demo-client-user',
        'Casey Client',
        'client@demo.local',
        Role.CLIENT,
        'demo-client-acme',
      ],
    ] as const;

    for (const [id, name, email, role, clientId] of users) {
      await transaction.user.upsert({
        where: { id },
        update: { name, email, role, clientId, passwordHash },
        create: {
          id,
          organizationId: 'demo-organization',
          name,
          email,
          role,
          clientId,
          passwordHash,
        },
      });
    }

    await transaction.project.upsert({
      where: { id: 'demo-project-portal' },
      update: {},
      create: {
        id: 'demo-project-portal',
        organizationId: 'demo-organization',
        clientId: 'demo-client-acme',
        name: 'Supplier Portal Refresh',
        description: 'Modernize the supplier collaboration experience.',
      },
    });

    await transaction.project.upsert({
      where: { id: 'demo-project-operations' },
      update: {},
      create: {
        id: 'demo-project-operations',
        organizationId: 'demo-organization',
        clientId: 'demo-client-globex',
        name: 'Store Operations Dashboard',
        description: 'Operational visibility for regional retail teams.',
      },
    });

    await transaction.requirement.upsert({
      where: { id: 'demo-requirement-approved' },
      update: {},
      create: {
        id: 'demo-requirement-approved',
        organizationId: 'demo-organization',
        projectId: 'demo-project-portal',
        createdById: 'demo-client-user',
        title: 'Purchase order status timeline',
        description: 'Show each purchase order milestone and its last update.',
        priority: RequirementPriority.HIGH,
        status: RequirementStatus.APPROVED,
      },
    });

    await transaction.requirement.upsert({
      where: { id: 'demo-requirement-submitted' },
      update: {},
      create: {
        id: 'demo-requirement-submitted',
        organizationId: 'demo-organization',
        projectId: 'demo-project-portal',
        createdById: 'demo-client-user',
        title: 'Export invoices',
        description: 'Allow finance users to download project invoices.',
        priority: RequirementPriority.MEDIUM,
        status: RequirementStatus.SUBMITTED,
      },
    });

    await transaction.task.upsert({
      where: { id: 'demo-task-timeline-api' },
      update: {},
      create: {
        id: 'demo-task-timeline-api',
        organizationId: 'demo-organization',
        requirementId: 'demo-requirement-approved',
        title: 'Build timeline API',
        description: 'Expose tenant-scoped milestone data.',
        status: TaskStatus.TODO,
        assigneeId: 'demo-engineer',
        estimateHours: 8,
        position: 0,
      },
    });
  });

  console.info(
    'Seeded demo organization. Password for all demo users:',
    DEMO_PASSWORD,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
