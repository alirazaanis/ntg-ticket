'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  MultiSelect,
  Button,
  Group,
  Title,
  Text,
  Badge,
} from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
interface SimpleFiltersModalProps {
  opened: boolean;
  onClose: () => void;
  onApply: (filters: {
    status?: string[];
    priority?: string[];
    category?: string[];
  }) => void;
  initialFilters?: {
    status?: string[];
    priority?: string[];
    category?: string[];
  };
}

const statusOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const categoryOptions = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'NETWORK', label: 'Network' },
  { value: 'ACCESS', label: 'Access' },
  { value: 'OTHER', label: 'Other' },
];

export function SimpleFiltersModal({
  opened,
  onClose,
  onApply,
  initialFilters,
}: SimpleFiltersModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  // Update state when initialFilters change
  useEffect(() => {
    setSelectedStatus(initialFilters?.status || []);
    setSelectedPriority(initialFilters?.priority || []);
    setSelectedCategory(initialFilters?.category || []);
  }, [initialFilters]);

  const handleApply = () => {
    onApply({
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      priority: selectedPriority.length > 0 ? selectedPriority : undefined,
      category: selectedCategory.length > 0 ? selectedCategory : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedCategory([]);
  };

  const hasActiveFilters =
    selectedStatus.length > 0 ||
    selectedPriority.length > 0 ||
    selectedCategory.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconFilter size={20} />
          <Title order={3}>Quick Filters</Title>
        </Group>
      }
      size='md'
    >
      <Stack gap='md'>
        <Text size='sm' c='dimmed'>
          Apply basic filters to quickly narrow down your tickets
        </Text>

        <MultiSelect
          label='Status'
          placeholder='Select status'
          data={statusOptions}
          value={selectedStatus}
          onChange={value => setSelectedStatus(value)}
          clearable
        />

        <MultiSelect
          label='Priority'
          placeholder='Select priority'
          data={priorityOptions}
          value={selectedPriority}
          onChange={value => setSelectedPriority(value)}
          clearable
        />

        <MultiSelect
          label='Category'
          placeholder='Select category'
          data={categoryOptions}
          value={selectedCategory}
          onChange={value => setSelectedCategory(value)}
          clearable
        />

        {hasActiveFilters && (
          <Group gap='xs' wrap='wrap'>
            <Text size='sm' fw={500}>
              Active filters:
            </Text>
            {selectedStatus.map(status => (
              <Badge key={status} size='sm' variant='light'>
                {statusOptions.find(opt => opt.value === status)?.label}
              </Badge>
            ))}
            {selectedPriority.map(priority => (
              <Badge key={priority} size='sm' variant='light' color='orange'>
                {priorityOptions.find(opt => opt.value === priority)?.label}
              </Badge>
            ))}
            {selectedCategory.map(category => (
              <Badge key={category} size='sm' variant='light' color='blue'>
                {categoryOptions.find(opt => opt.value === category)?.label}
              </Badge>
            ))}
          </Group>
        )}

        <Group justify='space-between' mt='md'>
          <Button
            variant='subtle'
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            Clear All
          </Button>
          <Group>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
