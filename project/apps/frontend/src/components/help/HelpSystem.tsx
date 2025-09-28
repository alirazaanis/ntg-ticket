'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Card,
  List,
  ThemeIcon,
  Badge,
  Anchor,
  Divider,
  Grid,
  Alert,
} from '@mantine/core';
import {
  IconHelp,
  IconQuestionMark,
  IconBook,
  IconMail,
  IconPhone,
  IconChevronRight,
  IconInfoCircle,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from '@tabler/icons-react';

interface HelpSystemProps {
  opened: boolean;
  onClose: () => void;
}

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: IconBook,
    content: {
      overview:
        'Welcome to NTG Ticket System! This guide will help you get started with managing your support tickets.',
      steps: [
        'Create your first ticket by clicking "New Ticket"',
        'Fill in the required information (title, description, category)',
        'Set priority and impact level based on your needs',
        'Submit the ticket and wait for assignment',
        'Track progress through the ticket lifecycle',
      ],
      tips: [
        'Be specific in your ticket description',
        'Attach relevant files or screenshots',
        'Choose the correct category for faster resolution',
        'Set appropriate priority level',
      ],
    },
  },
  {
    id: 'ticket-lifecycle',
    title: 'Ticket Lifecycle',
    icon: IconQuestionMark,
    content: {
      overview:
        'Understanding how tickets move through different states helps you track progress effectively.',
      stages: [
        {
          status: 'NEW',
          description: 'Ticket has been created and is awaiting review',
          color: 'blue',
        },
        {
          status: 'OPEN',
          description: 'Ticket has been reviewed and is ready for assignment',
          color: 'cyan',
        },
        {
          status: 'IN_PROGRESS',
          description: 'Ticket is being actively worked on',
          color: 'orange',
        },
        {
          status: 'ON_HOLD',
          description:
            'Ticket is waiting for additional information or resources',
          color: 'yellow',
        },
        {
          status: 'RESOLVED',
          description:
            'Solution has been provided and is awaiting confirmation',
          color: 'green',
        },
        {
          status: 'CLOSED',
          description: 'Ticket has been completed and closed',
          color: 'gray',
        },
        {
          status: 'REOPENED',
          description: 'Ticket has been reopened due to ongoing issues',
          color: 'red',
        },
      ],
    },
  },
  {
    id: 'user-roles',
    title: 'User Roles & Permissions',
    icon: IconHelp,
    content: {
      overview:
        'Different user roles have different capabilities in the system.',
      roles: [
        {
          role: 'End User',
          description: 'Can create and manage own tickets',
          permissions: [
            'Create tickets',
            'View own tickets',
            'Add comments',
            'Update profile',
          ],
        },
        {
          role: 'Support Staff',
          description: 'Can manage assigned tickets',
          permissions: [
            'View all tickets',
            'Manage assigned tickets',
            'Add comments',
            'Update status',
          ],
        },
        {
          role: 'Support Manager',
          description: 'Can manage team and all tickets',
          permissions: [
            'Manage all tickets',
            'Assign tickets',
            'View reports',
            'Manage staff',
          ],
        },
        {
          role: 'Administrator',
          description: 'Full system access',
          permissions: [
            'All permissions',
            'System configuration',
            'User management',
            'Reports',
          ],
        },
      ],
    },
  },
  {
    id: 'sla-management',
    title: 'SLA & Response Times',
    icon: IconQuestionMark,
    content: {
      overview:
        'Service Level Agreements ensure timely response to your tickets.',
      slaLevels: [
        {
          level: 'Standard',
          responseTime: '8 business hours',
          resolutionTime: '5 business days',
          description: 'General inquiries and non-urgent issues',
        },
        {
          level: 'Premium',
          responseTime: '4 business hours',
          resolutionTime: '2 business days',
          description: 'Higher urgency and impact issues',
        },
        {
          level: 'Critical Support',
          responseTime: 'Immediate (24/7)',
          resolutionTime: '4 business hours',
          description: 'Critical system failures and emergencies',
        },
      ],
    },
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: IconBook,
    content: {
      overview: 'Follow these guidelines for effective ticket management.',
      practices: [
        {
          category: 'Ticket Creation',
          items: [
            'Use clear, descriptive titles',
            'Provide detailed problem description',
            'Include steps to reproduce the issue',
            'Attach relevant screenshots or files',
            'Set appropriate priority and impact',
          ],
        },
        {
          category: 'Communication',
          items: [
            'Respond promptly to requests for information',
            'Be specific about what you need',
            'Provide feedback on solutions',
            'Use professional and clear language',
          ],
        },
        {
          category: 'Follow-up',
          items: [
            'Check ticket status regularly',
            'Confirm when issues are resolved',
            'Provide feedback on support quality',
            'Close tickets when satisfied',
          ],
        },
      ],
    },
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: IconQuestionMark,
    content: {
      overview: 'Common issues and their solutions.',
      issues: [
        {
          problem: 'Cannot log in',
          solution:
            'Check your email and password. Use "Forgot Password" if needed.',
          severity: 'high',
        },
        {
          problem: 'Ticket not updating',
          solution: 'Refresh the page or clear browser cache.',
          severity: 'medium',
        },
        {
          problem: 'File upload fails',
          solution:
            'Check file size (max 10MB) and format. Try a different browser.',
          severity: 'medium',
        },
        {
          problem: 'Notifications not received',
          solution:
            'Check email settings and spam folder. Verify notification preferences.',
          severity: 'low',
        },
      ],
    },
  },
];

const quickActions = [
  {
    title: 'Create New Ticket',
    description: 'Submit a new support request',
    action: 'navigate',
    target: '/tickets/new',
  },
  {
    title: 'View My Tickets',
    description: 'Check status of your tickets',
    action: 'navigate',
    target: '/tickets',
  },
  {
    title: 'Contact Support',
    description: 'Get immediate help',
    action: 'contact',
    target: 'support@ntg-ticket.com',
  },
];

export function HelpSystem({ opened, onClose }: HelpSystemProps) {
  const [activeSection, setActiveSection] = useState<string | null>(
    'getting-started'
  );

  const handleQuickAction = (action: string, target: string) => {
    if (action === 'navigate') {
      window.location.href = target;
    } else if (action === 'contact') {
      window.location.href = `mailto:${target}`;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return IconX;
      case 'medium':
        return IconAlertTriangle;
      case 'low':
        return IconInfoCircle;
      default:
        return IconInfoCircle;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap='sm'>
          <ThemeIcon size='sm' variant='light' color='blue'>
            <IconHelp size={16} />
          </ThemeIcon>
          <Text size='lg' fw={600}>
            Help & Support Center
          </Text>
        </Group>
      }
      size='xl'
      centered
    >
      <Grid>
        {/* Navigation Sidebar */}
        <Grid.Col span={4}>
          <Stack gap='sm'>
            <Text size='sm' fw={500} c='dimmed' mb='xs'>
              Help Topics
            </Text>
            {helpSections.map(section => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'light' : 'subtle'}
                color={activeSection === section.id ? 'blue' : 'gray'}
                justify='flex-start'
                leftSection={<section.icon size={16} />}
                onClick={() => setActiveSection(section.id)}
                fullWidth
              >
                {section.title}
              </Button>
            ))}

            <Divider my='md' />

            <Text size='sm' fw={500} c='dimmed' mb='xs'>
              Quick Actions
            </Text>
            {quickActions.map(action => (
              <Card
                key={`quick-action-${action.action}`}
                withBorder
                p='sm'
                radius='md'
                style={{ cursor: 'pointer' }}
                onClick={() => handleQuickAction(action.action, action.target)}
              >
                <Group justify='space-between'>
                  <div>
                    <Text size='sm' fw={500}>
                      {action.title}
                    </Text>
                    <Text size='xs' c='dimmed'>
                      {action.description}
                    </Text>
                  </div>
                  <IconChevronRight size={16} />
                </Group>
              </Card>
            ))}

            <Divider my='md' />

            <Alert
              icon={<IconMail size={16} />}
              title='Need More Help?'
              color='blue'
              variant='light'
            >
              <Text size='xs' mb='sm'>
                Contact our support team for personalized assistance.
              </Text>
              <Group gap='xs'>
                <Anchor href='mailto:support@ntg-ticket.com' size='xs'>
                  <IconMail size={12} style={{ marginRight: 4 }} />
                  Email Support
                </Anchor>
                <Anchor href='tel:+1-555-0123' size='xs'>
                  <IconPhone size={12} style={{ marginRight: 4 }} />
                  Call Support
                </Anchor>
              </Group>
            </Alert>
          </Stack>
        </Grid.Col>

        {/* Content Area */}
        <Grid.Col span={8}>
          <Stack gap='md'>
            {helpSections.map(
              section =>
                activeSection === section.id && (
                  <div key={section.id}>
                    <Group mb='md'>
                      <ThemeIcon size='lg' variant='light' color='blue'>
                        <section.icon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size='xl' fw={600}>
                          {section.title}
                        </Text>
                        <Text size='sm' c='dimmed'>
                          {section.content.overview}
                        </Text>
                      </div>
                    </Group>

                    {/* Getting Started */}
                    {section.id === 'getting-started' && (
                      <Stack gap='md'>
                        <Card withBorder p='md' radius='md'>
                          <Text size='sm' fw={500} mb='sm'>
                            Step-by-Step Guide
                          </Text>
                          <List spacing='sm' size='sm'>
                            {section.content.steps?.map((step, index) => (
                              <List.Item
                                key={`step-${step}`}
                                icon={
                                  <ThemeIcon
                                    size='sm'
                                    variant='light'
                                    color='blue'
                                  >
                                    <Text size='xs' fw={600}>
                                      {index + 1}
                                    </Text>
                                  </ThemeIcon>
                                }
                              >
                                {step}
                              </List.Item>
                            ))}
                          </List>
                        </Card>

                        <Card withBorder p='md' radius='md' bg='green.0'>
                          <Text size='sm' fw={500} mb='sm' c='green.7'>
                            Pro Tips
                          </Text>
                          <List spacing='xs' size='sm'>
                            {section.content.tips?.map(tip => (
                              <List.Item
                                key={`tip-${tip}`}
                                icon={
                                  <ThemeIcon
                                    size='sm'
                                    variant='light'
                                    color='green'
                                  >
                                    <IconCheck size={12} />
                                  </ThemeIcon>
                                }
                              >
                                {tip}
                              </List.Item>
                            ))}
                          </List>
                        </Card>
                      </Stack>
                    )}

                    {/* Ticket Lifecycle */}
                    {section.id === 'ticket-lifecycle' && (
                      <Stack gap='sm'>
                        {section.content.stages?.map(stage => (
                          <Card
                            key={`stage-${stage}`}
                            withBorder
                            p='md'
                            radius='md'
                          >
                            <Group justify='space-between'>
                              <div>
                                <Badge
                                  color={stage.color}
                                  variant='light'
                                  mb='xs'
                                >
                                  {stage.status}
                                </Badge>
                                <Text size='sm'>{stage.description}</Text>
                              </div>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    )}

                    {/* User Roles */}
                    {section.id === 'user-roles' && (
                      <Stack gap='md'>
                        {section.content.roles?.map(role => (
                          <Card
                            key={`role-${role.role}`}
                            withBorder
                            p='md'
                            radius='md'
                          >
                            <Text size='sm' fw={500} mb='xs'>
                              {role.role}
                            </Text>
                            <Text size='sm' c='dimmed' mb='sm'>
                              {role.description}
                            </Text>
                            <Text size='xs' fw={500} mb='xs'>
                              Permissions:
                            </Text>
                            <Group gap='xs'>
                              {role.permissions?.map(permission => (
                                <Badge
                                  key={`permission-${permission}`}
                                  size='xs'
                                  variant='light'
                                  color='blue'
                                >
                                  {permission}
                                </Badge>
                              ))}
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    )}

                    {/* SLA Management */}
                    {section.id === 'sla-management' && (
                      <Stack gap='md'>
                        {section.content.slaLevels?.map(sla => (
                          <Card
                            key={`sla-${sla.level}`}
                            withBorder
                            p='md'
                            radius='md'
                          >
                            <Text size='sm' fw={500} mb='xs'>
                              {sla.level} Support
                            </Text>
                            <Text size='sm' c='dimmed' mb='sm'>
                              {sla.description}
                            </Text>
                            <Grid>
                              <Grid.Col span={6}>
                                <Text size='xs' fw={500}>
                                  Response Time:
                                </Text>
                                <Text size='sm'>{sla.responseTime}</Text>
                              </Grid.Col>
                              <Grid.Col span={6}>
                                <Text size='xs' fw={500}>
                                  Resolution Time:
                                </Text>
                                <Text size='sm'>{sla.resolutionTime}</Text>
                              </Grid.Col>
                            </Grid>
                          </Card>
                        ))}
                      </Stack>
                    )}

                    {/* Best Practices */}
                    {section.id === 'best-practices' && (
                      <Stack gap='md'>
                        {section.content.practices?.map(practice => (
                          <Card
                            key={`practice-${practice.category}`}
                            withBorder
                            p='md'
                            radius='md'
                          >
                            <Text size='sm' fw={500} mb='sm'>
                              {practice.category}
                            </Text>
                            <List spacing='xs' size='sm'>
                              {practice.items?.map(item => (
                                <List.Item
                                  key={`practice-item-${item}`}
                                  icon={
                                    <ThemeIcon
                                      size='sm'
                                      variant='light'
                                      color='green'
                                    >
                                      <IconCheck size={12} />
                                    </ThemeIcon>
                                  }
                                >
                                  {item}
                                </List.Item>
                              ))}
                            </List>
                          </Card>
                        ))}
                      </Stack>
                    )}

                    {/* Troubleshooting */}
                    {section.id === 'troubleshooting' && (
                      <Stack gap='md'>
                        {section.content.issues?.map(issue => {
                          const SeverityIcon = getSeverityIcon(issue.severity);
                          return (
                            <Card
                              key={`troubleshooting-${issue.problem}`}
                              withBorder
                              p='md'
                              radius='md'
                            >
                              <Group mb='sm'>
                                <ThemeIcon
                                  size='sm'
                                  variant='light'
                                  color={getSeverityColor(issue.severity)}
                                >
                                  <SeverityIcon size={14} />
                                </ThemeIcon>
                                <Text size='sm' fw={500}>
                                  {issue.problem}
                                </Text>
                                <Badge
                                  size='xs'
                                  color={getSeverityColor(issue.severity)}
                                  variant='light'
                                >
                                  {issue.severity}
                                </Badge>
                              </Group>
                              <Text size='sm' c='dimmed'>
                                <strong>Solution:</strong> {issue.solution}
                              </Text>
                            </Card>
                          );
                        })}
                      </Stack>
                    )}
                  </div>
                )
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
