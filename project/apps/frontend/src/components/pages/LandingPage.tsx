'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  List,
  Center,
} from '@mantine/core';
import {
  IconTicket,
  IconUsers,
  IconChartBar,
  IconShield,
  IconClock,
  IconCheck,
  IconArrowRight,
} from '@tabler/icons-react';
import Link from 'next/link';

export function LandingPage() {
  const features = [
    {
      icon: IconTicket,
      title: 'Ticket Management',
      description: 'Create, track, and manage support tickets with ease',
    },
    {
      icon: IconUsers,
      title: 'Team Collaboration',
      description: 'Work together with your team to resolve issues quickly',
    },
    {
      icon: IconChartBar,
      title: 'Analytics & Reports',
      description: 'Get insights into your support performance and trends',
    },
    {
      icon: IconShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control',
    },
    {
      icon: IconClock,
      title: 'SLA Management',
      description: 'Automated SLA tracking and escalation notifications',
    },
    {
      icon: IconCheck,
      title: 'Quality Assurance',
      description:
        'Ensure consistent service quality and customer satisfaction',
    },
  ];

  return (
    <Container size='xl' py='xl'>
      <Stack gap='xl'>
        {/* Hero Section */}
        <Center py='xl'>
          <Stack align='center' gap='md'>
            <Title order={1} size='3rem' ta='center'>
              NTG Ticket System
            </Title>
            <Text size='xl' c='dimmed' ta='center' maw={600}>
              Streamline your IT support operations with our comprehensive
              ticket management platform
            </Text>
            <Group mt='xl'>
              <Button
                component={Link}
                href='/auth/signin'
                size='lg'
                rightSection={<IconArrowRight size={16} />}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href='/auth/signup'
                variant='outline'
                size='lg'
              >
                Get Started
              </Button>
            </Group>
          </Stack>
        </Center>

        {/* Features Section */}
        <div>
          <Title order={2} ta='center' mb='xl'>
            Why Choose NTG Ticket System?
          </Title>
          <Grid>
            {features.map(feature => (
              <Grid.Col key={feature.title} span={{ base: 12, md: 6, lg: 4 }}>
                <Card withBorder p='md' h='100%'>
                  <Stack align='center' gap='md'>
                    <ThemeIcon size='xl' variant='light' color='blue'>
                      <feature.icon size={32} />
                    </ThemeIcon>
                    <Title order={3} size='h4' ta='center'>
                      {feature.title}
                    </Title>
                    <Text c='dimmed' ta='center'>
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>

        {/* Benefits Section */}
        <Card withBorder p='xl' mt='xl'>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap='md'>
                <Title order={3}>Key Benefits</Title>
                <List spacing='sm'>
                  <List.Item icon={<IconCheck size={16} />}>
                    Reduce response times by up to 50%
                  </List.Item>
                  <List.Item icon={<IconCheck size={16} />}>
                    Improve customer satisfaction scores
                  </List.Item>
                  <List.Item icon={<IconCheck size={16} />}>
                    Streamline workflow processes
                  </List.Item>
                  <List.Item icon={<IconCheck size={16} />}>
                    Real-time collaboration tools
                  </List.Item>
                  <List.Item icon={<IconCheck size={16} />}>
                    Comprehensive reporting and analytics
                  </List.Item>
                  <List.Item icon={<IconCheck size={16} />}>
                    Mobile-responsive design
                  </List.Item>
                </List>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap='md'>
                <Title order={3}>Perfect For</Title>
                <List spacing='sm'>
                  <List.Item icon={<IconUsers size={16} />}>
                    IT Support Teams
                  </List.Item>
                  <List.Item icon={<IconUsers size={16} />}>
                    Help Desk Operations
                  </List.Item>
                  <List.Item icon={<IconUsers size={16} />}>
                    Customer Service Teams
                  </List.Item>
                  <List.Item icon={<IconUsers size={16} />}>
                    Enterprise Organizations
                  </List.Item>
                  <List.Item icon={<IconUsers size={16} />}>
                    Small to Medium Businesses
                  </List.Item>
                </List>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* CTA Section */}
        <Center py='xl'>
          <Stack align='center' gap='md'>
            <Title order={2} ta='center'>
              Ready to Get Started?
            </Title>
            <Text c='dimmed' ta='center' maw={500}>
              Join thousands of teams already using NTG Ticket System to improve
              their support operations
            </Text>
            <Group mt='md'>
              <Button
                component={Link}
                href='/auth/signup'
                size='lg'
                rightSection={<IconArrowRight size={16} />}
              >
                Create Account
              </Button>
              <Button
                component={Link}
                href='/auth/signin'
                variant='outline'
                size='lg'
              >
                Sign In
              </Button>
            </Group>
          </Stack>
        </Center>
      </Stack>
    </Container>
  );
}
