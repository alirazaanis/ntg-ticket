import {
  PrismaClient,
  UserRole,
  TicketPriority,
  TicketStatus,
  TicketImpact,
  TicketUrgency,
  SLALevel,
  TicketCategory,
  CustomFieldType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ntg-ticket.com' },
    update: {},
    create: {
      email: 'admin@ntg-ticket.com',
      name: 'System Administrator',
      password: await bcrypt.hash('admin123', 12),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@ntg-ticket.com' },
    update: {},
    create: {
      email: 'manager@ntg-ticket.com',
      name: 'Support Manager',
      password: await bcrypt.hash('manager123', 12),
      role: UserRole.SUPPORT_MANAGER,
      isActive: true,
    },
  });

  const supportStaff1 = await prisma.user.upsert({
    where: { email: 'support1@ntg-ticket.com' },
    update: {},
    create: {
      email: 'support1@ntg-ticket.com',
      name: 'John Smith',
      password: await bcrypt.hash('support123', 12),
      role: UserRole.SUPPORT_STAFF,
      isActive: true,
    },
  });

  const supportStaff2 = await prisma.user.upsert({
    where: { email: 'support2@ntg-ticket.com' },
    update: {},
    create: {
      email: 'support2@ntg-ticket.com',
      name: 'Jane Doe',
      password: await bcrypt.hash('support123', 12),
      role: UserRole.SUPPORT_STAFF,
      isActive: true,
    },
  });

  const endUser1 = await prisma.user.upsert({
    where: { email: 'user1@company.com' },
    update: {},
    create: {
      email: 'user1@company.com',
      name: 'Alice Johnson',
      password: await bcrypt.hash('user123', 12),
      role: UserRole.END_USER,
      isActive: true,
    },
  });

  const endUser2 = await prisma.user.upsert({
    where: { email: 'user2@company.com' },
    update: {},
    create: {
      email: 'user2@company.com',
      name: 'Bob Wilson',
      password: await bcrypt.hash('user123', 12),
      role: UserRole.END_USER,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // Create categories
  const hardwareCategory = await prisma.category.upsert({
    where: { name: 'HARDWARE' },
    update: {},
    create: {
      name: 'HARDWARE',
      description: 'Hardware-related issues',
      isActive: true,
      creator: {
        connect: { id: admin.id },
      },
    },
  });

  const softwareCategory = await prisma.category.upsert({
    where: { name: 'SOFTWARE' },
    update: {},
    create: {
      name: 'SOFTWARE',
      description: 'Software-related issues',
      isActive: true,
      creator: {
        connect: { id: admin.id },
      },
    },
  });

  const networkCategory = await prisma.category.upsert({
    where: { name: 'NETWORK' },
    update: {},
    create: {
      name: 'NETWORK',
      description: 'Network-related issues',
      isActive: true,
      creator: {
        connect: { id: admin.id },
      },
    },
  });

  const accessCategory = await prisma.category.upsert({
    where: { name: 'ACCESS' },
    update: {},
    create: {
      name: 'ACCESS',
      description: 'Access and permissions issues',
      isActive: true,
      creator: {
        connect: { id: admin.id },
      },
    },
  });

  const otherCategory = await prisma.category.upsert({
    where: { name: 'OTHER' },
    update: {},
    create: {
      name: 'OTHER',
      description: 'Other issues',
      isActive: true,
      creator: {
        connect: { id: admin.id },
      },
    },
  });

  console.log('✅ Categories created');

  // Create subcategories
  const hardwareSubcategories = [
    { name: 'desktop', description: 'Desktop Computer' },
    { name: 'laptop', description: 'Laptop Computer' },
    { name: 'printer', description: 'Printer' },
    { name: 'monitor', description: 'Monitor' },
    { name: 'keyboard', description: 'Keyboard/Mouse' },
    { name: 'other', description: 'Other Hardware' },
  ];

  for (const sub of hardwareSubcategories) {
    await prisma.subcategory.upsert({
      where: {
        name_categoryId: {
          name: sub.name,
          categoryId: hardwareCategory.id,
        },
      },
      update: {},
      create: {
        name: sub.name,
        description: sub.description,
        category: {
          connect: { id: hardwareCategory.id },
        },
        isActive: true,
        creator: {
          connect: { id: admin.id },
        },
      },
    });
  }

  const softwareSubcategories = [
    { name: 'operating_system', description: 'Operating System' },
    { name: 'email_client', description: 'Email Client' },
    { name: 'browser', description: 'Web Browser' },
    { name: 'office_suite', description: 'Office Suite' },
    { name: 'antivirus', description: 'Antivirus' },
    { name: 'other', description: 'Other Software' },
  ];

  for (const sub of softwareSubcategories) {
    await prisma.subcategory.upsert({
      where: {
        name_categoryId: {
          name: sub.name,
          categoryId: softwareCategory.id,
        },
      },
      update: {},
      create: {
        name: sub.name,
        description: sub.description,
        category: {
          connect: { id: softwareCategory.id },
        },
        isActive: true,
        creator: {
          connect: { id: admin.id },
        },
      },
    });
  }

  const networkSubcategories = [
    { name: 'internet', description: 'Internet Connection' },
    { name: 'wifi', description: 'WiFi' },
    { name: 'vpn', description: 'VPN' },
    { name: 'email_server', description: 'Email Server' },
    { name: 'file_server', description: 'File Server' },
    { name: 'other', description: 'Other Network' },
  ];

  for (const sub of networkSubcategories) {
    await prisma.subcategory.upsert({
      where: {
        name_categoryId: {
          name: sub.name,
          categoryId: networkCategory.id,
        },
      },
      update: {},
      create: {
        name: sub.name,
        description: sub.description,
        category: {
          connect: { id: networkCategory.id },
        },
        isActive: true,
        creator: {
          connect: { id: admin.id },
        },
      },
    });
  }

  const accessSubcategories = [
    { name: 'user_account', description: 'User Account' },
    { name: 'password_reset', description: 'Password Reset' },
    { name: 'permissions', description: 'Permissions' },
    { name: 'application_access', description: 'Application Access' },
    { name: 'other', description: 'Other Access' },
  ];

  for (const sub of accessSubcategories) {
    await prisma.subcategory.upsert({
      where: {
        name_categoryId: {
          name: sub.name,
          categoryId: accessCategory.id,
        },
      },
      update: {},
      create: {
        name: sub.name,
        description: sub.description,
        category: {
          connect: { id: accessCategory.id },
        },
        isActive: true,
        creator: {
          connect: { id: admin.id },
        },
      },
    });
  }

  console.log('✅ Subcategories created');

  // Create custom fields
  const customFields = [
    {
      name: 'Department',
      fieldType: CustomFieldType.SELECT,
      options: ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'],
      isRequired: false,
    },
    {
      name: 'Location',
      fieldType: CustomFieldType.TEXT,
      options: null,
      isRequired: false,
    },
    {
      name: 'Urgency Level',
      fieldType: CustomFieldType.SELECT,
      options: ['Low', 'Medium', 'High', 'Critical'],
      isRequired: false,
    },
    {
      name: 'Estimated Resolution Time',
      fieldType: CustomFieldType.NUMBER,
      options: null,
      isRequired: false,
    },
    {
      name: 'Customer Satisfaction',
      fieldType: CustomFieldType.SELECT,
      options: [
        '1 - Very Poor',
        '2 - Poor',
        '3 - Average',
        '4 - Good',
        '5 - Excellent',
      ],
      isRequired: false,
    },
  ];

  for (const field of customFields) {
    await prisma.customField.upsert({
      where: { name: field.name },
      update: {},
      create: {
        name: field.name,
        fieldType: field.fieldType,
        options: field.options,
        isRequired: field.isRequired,
        isActive: true,
      },
    });
  }

  console.log('✅ Custom fields created');

  // Create sample tickets
  const tickets = [
    {
      ticketNumber: 'TKT-2024-000001',
      title: 'Unable to access email server',
      description:
        'I am unable to access the email server since this morning. Getting connection timeout errors when trying to send emails.',
      category: TicketCategory.SOFTWARE,
      subcategory: 'email_client',
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      impact: TicketImpact.MAJOR,
      urgency: TicketUrgency.HIGH,
      slaLevel: SLALevel.PREMIUM,
      requesterId: endUser1.id,
      assignedToId: supportStaff1.id,
    },
    {
      ticketNumber: 'TKT-2024-000002',
      title: 'Printer not working',
      description:
        'The office printer is not responding. It shows an error message and cannot print any documents.',
      category: TicketCategory.HARDWARE,
      subcategory: 'printer',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      impact: TicketImpact.MODERATE,
      urgency: TicketUrgency.NORMAL,
      slaLevel: SLALevel.STANDARD,
      requesterId: endUser2.id,
      assignedToId: supportStaff2.id,
    },
    {
      ticketNumber: 'TKT-2024-000003',
      title: 'WiFi connection issues',
      description:
        'WiFi connection keeps dropping in the conference room. Very unstable connection.',
      category: TicketCategory.NETWORK,
      subcategory: 'wifi',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.NEW,
      impact: TicketImpact.MODERATE,
      urgency: TicketUrgency.NORMAL,
      slaLevel: SLALevel.STANDARD,
      requesterId: endUser1.id,
    },
    {
      ticketNumber: 'TKT-2024-000004',
      title: 'Password reset request',
      description:
        'I forgot my password and need to reset it to access my account.',
      category: TicketCategory.ACCESS,
      subcategory: 'password_reset',
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      impact: TicketImpact.MINOR,
      urgency: TicketUrgency.LOW,
      slaLevel: SLALevel.STANDARD,
      requesterId: endUser2.id,
      assignedToId: supportStaff1.id,
      resolution:
        'Password reset link sent to user email. User has successfully reset their password.',
    },
    {
      ticketNumber: 'TKT-2024-000005',
      title: 'Critical system outage',
      description:
        'The main database server is down and affecting all users. This is a critical issue that needs immediate attention.',
      category: TicketCategory.SOFTWARE,
      subcategory: 'other',
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.OPEN,
      impact: TicketImpact.CRITICAL,
      urgency: TicketUrgency.IMMEDIATE,
      slaLevel: SLALevel.CRITICAL_SUPPORT,
      requesterId: manager.id,
      assignedToId: supportStaff1.id,
    },
  ];

  for (const ticketData of tickets) {
    // Find the category and subcategory
    const category = await prisma.category.findFirst({
      where: { name: ticketData.category },
    });
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        name: ticketData.subcategory,
        categoryId: category?.id,
      },
    });

    await prisma.ticket.upsert({
      where: { ticketNumber: ticketData.ticketNumber },
      update: {},
      create: {
        ticketNumber: ticketData.ticketNumber,
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: ticketData.status,
        impact: ticketData.impact,
        urgency: ticketData.urgency,
        slaLevel: ticketData.slaLevel,
        requester: {
          connect: { id: ticketData.requesterId },
        },
        assignedTo: ticketData.assignedToId
          ? {
              connect: { id: ticketData.assignedToId },
            }
          : undefined,
        category: {
          connect: { id: category?.id },
        },
        subcategory: {
          connect: { id: subcategory?.id },
        },
        resolution: ticketData.resolution,
      },
    });
  }

  console.log('✅ Sample tickets created');

  // Create sample comments
  const ticket1 = await prisma.ticket.findUnique({
    where: { ticketNumber: 'TKT-2024-000001' },
  });
  const ticket2 = await prisma.ticket.findUnique({
    where: { ticketNumber: 'TKT-2024-000002' },
  });

  if (ticket1) {
    await prisma.comment.create({
      data: {
        ticketId: ticket1.id,
        userId: supportStaff1.id,
        content:
          'I have restarted the email service. Please try again and let me know if the issue persists.',
        isInternal: false,
      },
    });

    await prisma.comment.create({
      data: {
        ticketId: ticket1.id,
        userId: supportStaff1.id,
        content: 'Checking server logs for any error messages.',
        isInternal: true,
      },
    });
  }

  if (ticket2) {
    await prisma.comment.create({
      data: {
        ticketId: ticket2.id,
        userId: supportStaff2.id,
        content:
          'I have checked the printer and found a paper jam. Clearing it now.',
        isInternal: false,
      },
    });
  }

  console.log('✅ Sample comments created');

  // Create sample notifications
  const notifications = [
    {
      userId: endUser1.id,
      ticketId: ticket1?.id,
      type: 'TICKET_CREATED',
      title: 'Ticket Created',
      message: 'Your ticket TKT-2024-000001 has been created successfully.',
    },
    {
      userId: supportStaff1.id,
      ticketId: ticket1?.id,
      type: 'TICKET_ASSIGNED',
      title: 'Ticket Assigned',
      message: 'You have been assigned ticket TKT-2024-000001.',
    },
    {
      userId: endUser2.id,
      ticketId: ticket2?.id,
      type: 'TICKET_CREATED',
      title: 'Ticket Created',
      message: 'Your ticket TKT-2024-000002 has been created successfully.',
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        type: notification.type as any,
        title: notification.title,
        message: notification.message,
        user: {
          connect: { id: notification.userId },
        },
        ticket: notification.ticketId
          ? {
              connect: { id: notification.ticketId },
            }
          : undefined,
      },
    });
  }

  console.log('✅ Sample notifications created');

  // Create system settings
  const systemSettings = [
    { key: 'site_name', value: 'NTG Ticket' },
    { key: 'site_description', value: 'IT Support Ticket Management System' },
    { key: 'timezone', value: 'UTC' },
    { key: 'language', value: 'en' },
    { key: 'auto_assign_tickets', value: 'true' },
    { key: 'auto_close_resolved_tickets', value: 'true' },
    { key: 'auto_close_days', value: '5' },
    { key: 'max_file_size', value: '10485760' }, // 10MB
    { key: 'max_files_per_ticket', value: '10' },
    { key: 'standard_response_time', value: '8' },
    { key: 'standard_resolution_time', value: '40' },
    { key: 'premium_response_time', value: '4' },
    { key: 'premium_resolution_time', value: '16' },
    { key: 'critical_response_time', value: '0' },
    { key: 'critical_resolution_time', value: '4' },
    { key: 'sla_warning_threshold', value: '0.8' }, // 80% of SLA time
    { key: 'auto_escalation_enabled', value: 'true' },
    { key: 'escalation_interval_hours', value: '24' },
    { key: 'email_notifications_enabled', value: 'true' },
    { key: 'websocket_enabled', value: 'true' },
    { key: 'file_upload_enabled', value: 'true' },
    {
      key: 'allowed_file_types',
      value: 'jpg,jpeg,png,gif,pdf,doc,docx,txt,zip',
    },
    { key: 'max_comment_length', value: '5000' },
    { key: 'ticket_auto_close_days', value: '7' },
    { key: 'dashboard_refresh_interval', value: '30' }, // seconds
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ System settings created');

  // Create email templates
  const emailTemplates = [
    {
      name: 'Ticket Created',
      type: 'TICKET_CREATED',
      subject: 'New Ticket Created - {{ticketNumber}}',
      html: `
        <h2>New Ticket Created</h2>
        <p>Hello {{userName}},</p>
        <p>Your ticket has been created successfully.</p>
        <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
        <p><strong>Title:</strong> {{ticketTitle}}</p>
        <p><strong>Priority:</strong> {{ticketPriority}}</p>
        <p><strong>Status:</strong> {{ticketStatus}}</p>
        <p>You can view your ticket details by clicking <a href="{{ticketUrl}}">here</a>.</p>
        <p>Thank you for using our support system.</p>
      `,
    },
    {
      name: 'Ticket Assigned',
      type: 'TICKET_ASSIGNED',
      subject: 'Ticket Assigned - {{ticketNumber}}',
      html: `
        <h2>Ticket Assigned</h2>
        <p>Hello {{userName}},</p>
        <p>You have been assigned a new ticket.</p>
        <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
        <p><strong>Title:</strong> {{ticketTitle}}</p>
        <p><strong>Priority:</strong> {{ticketPriority}}</p>
        <p><strong>Requester:</strong> {{requesterName}}</p>
        <p>Please review and take action on this ticket by clicking <a href="{{ticketUrl}}">here</a>.</p>
      `,
    },
    {
      name: 'Ticket Status Changed',
      type: 'TICKET_STATUS_CHANGED',
      subject: 'Ticket Status Updated - {{ticketNumber}}',
      html: `
        <h2>Ticket Status Updated</h2>
        <p>Hello {{userName}},</p>
        <p>The status of your ticket has been updated.</p>
        <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
        <p><strong>Title:</strong> {{ticketTitle}}</p>
        <p><strong>New Status:</strong> {{newStatus}}</p>
        <p><strong>Previous Status:</strong> {{previousStatus}}</p>
        <p>You can view the updated ticket details by clicking <a href="{{ticketUrl}}">here</a>.</p>
      `,
    },
    {
      name: 'Comment Added',
      type: 'COMMENT_ADDED',
      subject: 'New Comment Added - {{ticketNumber}}',
      html: `
        <h2>New Comment Added</h2>
        <p>Hello {{userName}},</p>
        <p>A new comment has been added to your ticket.</p>
        <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
        <p><strong>Title:</strong> {{ticketTitle}}</p>
        <p><strong>Comment by:</strong> {{commenterName}}</p>
        <p><strong>Comment:</strong></p>
        <div style="background-color: #f5f5f5; padding: 10px; border-left: 3px solid #007bff;">
          {{commentContent}}
        </div>
        <p>You can view the full conversation by clicking <a href="{{ticketUrl}}">here</a>.</p>
      `,
    },
    {
      name: 'SLA Warning',
      type: 'SLA_WARNING',
      subject: 'SLA Warning - {{ticketNumber}}',
      html: `
        <h2>SLA Warning</h2>
        <p>Hello {{userName}},</p>
        <p>This is a warning that your ticket is approaching its SLA deadline.</p>
        <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
        <p><strong>Title:</strong> {{ticketTitle}}</p>
        <p><strong>Priority:</strong> {{ticketPriority}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Time Remaining:</strong> {{timeRemaining}}</p>
        <p>Please take immediate action to resolve this ticket. You can view the ticket details by clicking <a href="{{ticketUrl}}">here</a>.</p>
      `,
    },
    {
      name: 'SLA Breach',
      type: 'SLA_BREACH',
      subject: 'SLA Breach - {{ticketNumber}}',
      html: `
        <h2>SLA Breach Alert</h2>
        <p>Hello {{userName}},</p>
        <p><strong>URGENT:</strong> This ticket has breached its SLA deadline.</p>
        <p><strong>Ticket Number:</strong> {{ticketNumber}}</p>
        <p><strong>Title:</strong> {{ticketTitle}}</p>
        <p><strong>Priority:</strong> {{ticketPriority}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Time Overdue:</strong> {{timeOverdue}}</p>
        <p>This ticket requires immediate attention and escalation. Please take action now by clicking <a href="{{ticketUrl}}">here</a>.</p>
      `,
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { type: template.type },
      update: {},
      create: {
        name: template.name,
        type: template.type,
        subject: template.subject,
        html: template.html,
        isActive: true,
      },
    });
  }

  console.log('✅ Email templates created');

  // Create saved searches
  const savedSearches = [
    {
      name: 'My Open Tickets',
      description: 'All tickets assigned to me that are currently open',
      searchCriteria: JSON.stringify({
        assignedTo: 'me',
        status: ['NEW', 'OPEN', 'IN_PROGRESS'],
      }),
      userId: supportStaff1.id,
      isPublic: false,
    },
    {
      name: 'High Priority Tickets',
      description: 'All high and critical priority tickets',
      searchCriteria: JSON.stringify({
        priority: ['HIGH', 'CRITICAL'],
        status: ['NEW', 'OPEN', 'IN_PROGRESS'],
      }),
      userId: manager.id,
      isPublic: true,
    },
    {
      name: 'Overdue Tickets',
      description: 'Tickets that are past their due date',
      searchCriteria: JSON.stringify({
        status: ['NEW', 'OPEN', 'IN_PROGRESS'],
        dueDate: {
          operator: 'lt',
          value: new Date().toISOString(),
        },
      }),
      userId: manager.id,
      isPublic: true,
    },
    {
      name: 'Hardware Issues',
      description: 'All hardware-related tickets',
      searchCriteria: JSON.stringify({
        category: ['HARDWARE'],
        status: ['NEW', 'OPEN', 'IN_PROGRESS'],
      }),
      userId: supportStaff2.id,
      isPublic: false,
    },
    {
      name: 'My Submitted Tickets',
      description: 'All tickets I have submitted',
      searchCriteria: JSON.stringify({
        requester: 'me',
      }),
      userId: endUser1.id,
      isPublic: false,
    },
    {
      name: 'Resolved This Week',
      description: 'Tickets resolved in the last 7 days',
      searchCriteria: JSON.stringify({
        status: ['RESOLVED', 'CLOSED'],
        resolvedAt: {
          operator: 'gte',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }),
      userId: supportStaff1.id,
      isPublic: false,
    },
  ];

  for (const search of savedSearches) {
    await prisma.savedSearch.create({
      data: {
        name: search.name,
        description: search.description,
        searchCriteria: search.searchCriteria,
        user: {
          connect: { id: search.userId },
        },
        isPublic: search.isPublic,
      },
    });
  }

  console.log('✅ Saved searches created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
