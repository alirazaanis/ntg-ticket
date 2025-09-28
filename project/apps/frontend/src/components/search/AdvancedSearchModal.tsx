'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Modal,
  Stack,
  TextInput,
  MultiSelect,
  Button,
  Group,
  Text,
  Card,
  Badge,
  ActionIcon,
  Grid,
  NumberInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconSearch,
  IconX,
  IconCalendar,
  IconUser,
  IconTag,
  IconClock,
} from '@tabler/icons-react';
import { useCategories } from '../../hooks/useCategories';
import { useUsers } from '../../hooks/useUsers';

export interface AdvancedSearchCriteria {
  // Basic search
  query?: string;

  // Ticket fields
  status?: string[];
  priority?: string[];
  category?: string[];
  subcategory?: string[];
  impact?: string[];
  urgency?: string[];
  slaLevel?: string[];

  // User fields
  requester?: string[];
  assignedTo?: string[];

  // Date fields
  createdFrom?: Date;
  createdTo?: Date;
  dueFrom?: Date;
  dueTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;

  // Numeric fields
  minResolutionTime?: number;
  maxResolutionTime?: number;

  // Custom fields
  customFields?: Record<string, unknown>;
}

interface AdvancedSearchModalProps {
  opened: boolean;
  onClose: () => void;
  onSearch: (criteria: AdvancedSearchCriteria) => void;
  initialCriteria?: AdvancedSearchCriteria;
}

export function AdvancedSearchModal({
  opened,
  onClose,
  onSearch,
  initialCriteria = {},
}: AdvancedSearchModalProps) {
  const t = useTranslations('common');
  const tTickets = useTranslations('tickets');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: categories } = useCategories();
  const { data: users } = useUsers();

  const form = useForm<AdvancedSearchCriteria>({
    initialValues: {
      query: initialCriteria.query || '',
      status: initialCriteria.status || [],
      priority: initialCriteria.priority || [],
      category: initialCriteria.category || [],
      subcategory: initialCriteria.subcategory || [],
      impact: initialCriteria.impact || [],
      urgency: initialCriteria.urgency || [],
      slaLevel: initialCriteria.slaLevel || [],
      requester: initialCriteria.requester || [],
      assignedTo: initialCriteria.assignedTo || [],
      createdFrom: initialCriteria.createdFrom,
      createdTo: initialCriteria.createdTo,
      dueFrom: initialCriteria.dueFrom,
      dueTo: initialCriteria.dueTo,
      updatedFrom: initialCriteria.updatedFrom,
      updatedTo: initialCriteria.updatedTo,
      minResolutionTime: initialCriteria.minResolutionTime,
      maxResolutionTime: initialCriteria.maxResolutionTime,
      customFields: initialCriteria.customFields || {},
    },
  });

  // Update active filters when form values change
  useEffect(() => {
    const filters: string[] = [];
    const values = form.values;

    if (values.query) filters.push('Search Query');
    if (values.status?.length) filters.push(`${values.status.length} Status`);
    if (values.priority?.length)
      filters.push(`${values.priority.length} Priority`);
    if (values.category?.length)
      filters.push(`${values.category.length} Category`);
    if (values.subcategory?.length)
      filters.push(`${values.subcategory.length} Subcategory`);
    if (values.impact?.length) filters.push(`${values.impact.length} Impact`);
    if (values.urgency?.length)
      filters.push(`${values.urgency.length} Urgency`);
    if (values.slaLevel?.length)
      filters.push(`${values.slaLevel.length} SLA Level`);
    if (values.requester?.length)
      filters.push(`${values.requester.length} Requester`);
    if (values.assignedTo?.length)
      filters.push(`${values.assignedTo.length} Assignee`);
    if (values.createdFrom || values.createdTo) filters.push('Created Date');
    if (values.dueFrom || values.dueTo) filters.push('Due Date');
    if (values.updatedFrom || values.updatedTo) filters.push('Updated Date');
    if (values.minResolutionTime || values.maxResolutionTime)
      filters.push('Resolution Time');

    setActiveFilters(filters);
  }, [form.values]);

  const handleSubmit = (values: AdvancedSearchCriteria) => {
    // Remove empty values
    const cleanValues = Object.fromEntries(
      Object.entries(values).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (value instanceof Date) return true;
        if (typeof value === 'number') return value > 0;
        return Boolean(value);
      })
    );

    onSearch(cleanValues as AdvancedSearchCriteria);
    onClose();
  };

  const handleClear = () => {
    form.reset();
    setActiveFilters([]);
  };

  const removeFilter = () => {
    // This is a simplified version - in a real implementation,
    // you'd need to map filter names back to form fields
    form.reset();
    setActiveFilters([]);
  };

  const statusOptions = [
    { value: 'NEW', label: t('new') },
    { value: 'OPEN', label: t('open') },
    { value: 'IN_PROGRESS', label: t('in_progress') },
    { value: 'ON_HOLD', label: t('on_hold') },
    { value: 'RESOLVED', label: t('resolved') },
    { value: 'CLOSED', label: t('closed') },
    { value: 'REOPENED', label: t('reopened') },
  ];

  const priorityOptions = [
    { value: 'LOW', label: t('low') },
    { value: 'MEDIUM', label: t('medium') },
    { value: 'HIGH', label: t('high') },
    { value: 'CRITICAL', label: t('critical') },
  ];

  const impactOptions = [
    { value: 'MINOR', label: t('minor') },
    { value: 'MODERATE', label: t('moderate') },
    { value: 'MAJOR', label: t('major') },
    { value: 'CRITICAL', label: t('critical') },
  ];

  const urgencyOptions = [
    { value: 'LOW', label: t('low') },
    { value: 'NORMAL', label: t('normal') },
    { value: 'HIGH', label: t('high') },
    { value: 'IMMEDIATE', label: t('immediate') },
  ];

  const slaLevelOptions = [
    { value: 'STANDARD', label: t('standard') },
    { value: 'PREMIUM', label: t('premium') },
    { value: 'CRITICAL_SUPPORT', label: t('critical_support') },
  ];

  const categoryOptions =
    categories?.map(cat => ({
      value: cat.name,
      label: cat.description || cat.name,
    })) || [];

  const subcategoryOptions =
    categories
      ?.filter(cat => form.values.category?.includes(cat.name))
      ?.flatMap(
        cat =>
          (
            cat as {
              subcategories?: Array<{ name: string; description?: string }>;
            }
          ).subcategories?.map(sub => ({
            value: sub.name,
            label: sub.description || sub.name,
          })) || []
      ) || [];

  const userOptions =
    users?.map(user => ({
      value: user.id,
      label: user.name,
    })) || [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={tTickets('advancedSearch')}
      size='lg'
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap='md'>
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <Card withBorder p='md' radius='md' bg='blue.0'>
              <Group justify='space-between' mb='sm'>
                <Text size='sm' fw={500} c='blue.7'>
                  {t('activeFilters')} ({activeFilters.length})
                </Text>
                <Button
                  variant='subtle'
                  size='xs'
                  color='blue'
                  onClick={handleClear}
                >
                  {t('clearAll')}
                </Button>
              </Group>
              <Group gap='xs'>
                {activeFilters.map(filter => (
                  <Badge
                    key={`filter-${filter}`}
                    variant='light'
                    color='blue'
                    rightSection={
                      <ActionIcon
                        size='xs'
                        color='blue'
                        variant='transparent'
                        onClick={removeFilter}
                      >
                        <IconX size={10} />
                      </ActionIcon>
                    }
                  >
                    {filter}
                  </Badge>
                ))}
              </Group>
            </Card>
          )}

          {/* Basic Search */}
          <Card withBorder p='md' radius='md'>
            <Group mb='sm'>
              <IconSearch size={16} />
              <Text size='sm' fw={500}>
                {t('basicSearch')}
              </Text>
            </Group>
            <TextInput
              label={t('searchQuery')}
              placeholder={tTickets('searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              {...form.getInputProps('query')}
            />
          </Card>

          {/* Ticket Properties */}
          <Card withBorder p='md' radius='md'>
            <Group mb='sm'>
              <IconTag size={16} />
              <Text size='sm' fw={500}>
                {tTickets('ticketProperties')}
              </Text>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('status')}
                  placeholder={t('selectStatus')}
                  data={statusOptions}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('priority')}
                  placeholder={t('selectPriority')}
                  data={priorityOptions}
                  {...form.getInputProps('priority')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('category')}
                  placeholder={t('selectCategory')}
                  data={categoryOptions}
                  {...form.getInputProps('category')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('subcategory')}
                  placeholder={t('selectSubcategory')}
                  data={subcategoryOptions}
                  {...form.getInputProps('subcategory')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('impact')}
                  placeholder={t('selectImpact')}
                  data={impactOptions}
                  {...form.getInputProps('impact')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('urgency')}
                  placeholder={t('selectUrgency')}
                  data={urgencyOptions}
                  {...form.getInputProps('urgency')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <MultiSelect
                  label={tTickets('slaLevel')}
                  placeholder={t('selectSlaLevel')}
                  data={slaLevelOptions}
                  {...form.getInputProps('slaLevel')}
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* User Assignment */}
          <Card withBorder p='md' radius='md'>
            <Group mb='sm'>
              <IconUser size={16} />
              <Text size='sm' fw={500}>
                {tTickets('userAssignment')}
              </Text>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('requester')}
                  placeholder={t('selectRequesters')}
                  data={userOptions}
                  searchable
                  {...form.getInputProps('requester')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label={tTickets('assignedTo')}
                  placeholder={t('selectAssignees')}
                  data={userOptions}
                  searchable
                  {...form.getInputProps('assignedTo')}
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* Date Ranges */}
          <Card withBorder p='md' radius='md'>
            <Group mb='sm'>
              <IconCalendar size={16} />
              <Text size='sm' fw={500}>
                {tTickets('dateRanges')}
              </Text>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <DateInput
                  label={tTickets('createdFrom')}
                  placeholder={t('selectStartDate')}
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('createdFrom')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={tTickets('createdTo')}
                  placeholder={t('selectEndDate')}
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('createdTo')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={tTickets('dueFrom')}
                  placeholder={t('selectStartDate')}
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('dueFrom')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={tTickets('dueTo')}
                  placeholder={t('selectEndDate')}
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('dueTo')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={tTickets('updatedFrom')}
                  placeholder={t('selectStartDate')}
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('updatedFrom')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={tTickets('updatedTo')}
                  placeholder={t('selectEndDate')}
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('updatedTo')}
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* Resolution Time */}
          <Card withBorder p='md' radius='md'>
            <Group mb='sm'>
              <IconClock size={16} />
              <Text size='sm' fw={500}>
                {tTickets('resolutionTime')} ({t('hours')})
              </Text>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label={t('minimum')}
                  placeholder={t('minHours')}
                  min={0}
                  {...form.getInputProps('minResolutionTime')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label={t('maximum')}
                  placeholder={t('maxHours')}
                  min={0}
                  {...form.getInputProps('maxResolutionTime')}
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* Actions */}
          <Group justify='flex-end' mt='md'>
            <Button variant='outline' onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button variant='outline' onClick={handleClear}>
              {t('clear')}
            </Button>
            <Button type='submit' leftSection={<IconSearch size={16} />}>
              {t('search')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
