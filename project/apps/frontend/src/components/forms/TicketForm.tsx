'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  MultiSelect,
  Text,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Dropzone } from '@mantine/dropzone';
import {
  IconUpload,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAutoAssignSettings } from '../../hooks/useAutoAssignSettings';
import { useCategories } from '../../hooks/useCategories';
import { useCustomFields } from '../../hooks/useCustomFields';
import { Category, Subcategory } from '../../types/unified';

// Subcategory option interface for form display
interface SubcategoryOption {
  value: string;
  label: string;
}

// Ticket form data interface
export interface TicketFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: string;
  impact: string;
  urgency: string;
  slaLevel: string;
  relatedTickets: string[];
  customFields: Record<string, string | number | boolean | string[]>;
}

interface TicketFormProps {
  onSubmit: (data: TicketFormData & { files: File[] }) => void;
  onCancel: () => void;
  initialData?: Partial<TicketFormData>;
  isEditing?: boolean;
}

const categories = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'NETWORK', label: 'Network' },
  { value: 'ACCESS', label: 'Access' },
  { value: 'OTHER', label: 'Other' },
];

const subcategories = {
  HARDWARE: [
    { value: 'desktop', label: 'Desktop Computer' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'printer', label: 'Printer' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'keyboard', label: 'Keyboard/Mouse' },
    { value: 'other', label: 'Other Hardware' },
  ],
  SOFTWARE: [
    { value: 'operating_system', label: 'Operating System' },
    { value: 'email_client', label: 'Email Client' },
    { value: 'browser', label: 'Web Browser' },
    { value: 'office_suite', label: 'Office Suite' },
    { value: 'antivirus', label: 'Antivirus' },
    { value: 'other', label: 'Other Software' },
  ],
  NETWORK: [
    { value: 'internet', label: 'Internet Connection' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'vpn', label: 'VPN' },
    { value: 'email_server', label: 'Email Server' },
    { value: 'file_server', label: 'File Server' },
    { value: 'other', label: 'Other Network' },
  ],
  ACCESS: [
    { value: 'user_account', label: 'User Account' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'permissions', label: 'Permissions' },
    { value: 'application_access', label: 'Application Access' },
    { value: 'other', label: 'Other Access' },
  ],
  OTHER: [
    { value: 'general', label: 'General Inquiry' },
    { value: 'training', label: 'Training Request' },
    { value: 'other', label: 'Other' },
  ],
};

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const impacts = [
  { value: 'MINOR', label: 'Minor' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'CRITICAL', label: 'Critical' },
];

const urgencies = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'IMMEDIATE', label: 'Immediate' },
];

const slaLevels = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'CRITICAL_SUPPORT', label: 'Critical Support' },
];

export function TicketForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: TicketFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory] = useState<string>('');
  const [, setAvailableSubcategories] = useState<SubcategoryOption[]>([]);
  // const [availableCustomFields] = useState<CustomField[]>([]);

  const { getAutoAssignMessage, getAutoCloseMessage } = useAutoAssignSettings();
  const { data: categoriesData } = useCategories();
  const { data: customFieldsData } = useCustomFields();

  // Dynamic form behavior based on category selection
  useEffect(() => {
    if (selectedCategory && categoriesData) {
      const category = categoriesData.find(
        cat => cat.name === selectedCategory
      );
      if (category && 'subcategories' in category && category.subcategories) {
        setAvailableSubcategories(
          (
            category as Category & { subcategories: Subcategory[] }
          ).subcategories.map((sub: Subcategory) => ({
            value: sub.name,
            label: sub.description || sub.name,
          }))
        );
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categoriesData]);

  // Load custom fields based on category
  useEffect(() => {
    if (selectedCategory && customFieldsData) {
      // const categoryFields = customFieldsData.filter(
      //   (field: CustomField) =>
      //     (field as CustomField & { category?: string }).category === selectedCategory ||
      //     (field as CustomField & { category?: string }).category === 'ALL'
      // );
      // setAvailableCustomFields(categoryFields);
    } else {
      // setAvailableCustomFields(customFieldsData || []);
    }
  }, [selectedCategory, customFieldsData]);

  const form = useForm<TicketFormData>({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category:
        typeof initialData?.category === 'string'
          ? initialData.category
          : (initialData?.category as unknown as { name?: string })?.name || '',
      subcategory:
        typeof initialData?.subcategory === 'string'
          ? initialData.subcategory
          : (initialData?.subcategory as unknown as { name?: string })?.name ||
            '',
      priority: initialData?.priority || 'MEDIUM',
      impact: initialData?.impact || 'MODERATE',
      urgency: initialData?.urgency || 'NORMAL',
      slaLevel: initialData?.slaLevel || 'STANDARD',
      relatedTickets: initialData?.relatedTickets || [],
      customFields: initialData?.customFields || {},
    },
    validate: {
      title: value => (!value ? 'Title is required' : null),
      description: value => (!value ? 'Description is required' : null),
      category: value => (!value ? 'Category is required' : null),
      subcategory: value => (!value ? 'Subcategory is required' : null),
    },
  });

  const handleCategoryChange = (value: string) => {
    form.setFieldValue('category', value);
    form.setFieldValue('subcategory', '');
  };

  const handleFileDrop = (acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles];
    if (newFiles.length > 10) {
      notifications.show({
        title: 'Too many files',
        message: 'Maximum 10 files allowed',
        color: 'red',
      });
      return;
    }
    setFiles(newFiles);
  };

  const handleFileRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: TicketFormData) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...values,
        files,
      };
      await onSubmit(formData);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit ticket',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSubcategories = form.values.category
    ? subcategories[form.values.category as keyof typeof subcategories] || []
    : [];

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap='md'>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label='Title'
              placeholder='Brief description of the issue'
              required
              {...form.getInputProps('title')}
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label='Description'
          placeholder='Detailed description of the issue'
          required
          minRows={4}
          {...form.getInputProps('description')}
        />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label='Category'
              placeholder='Select category'
              required
              data={categories}
              {...form.getInputProps('category')}
              onChange={value => handleCategoryChange(value || '')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label='Subcategory'
              placeholder='Select subcategory'
              required
              data={currentSubcategories}
              disabled={!form.values.category}
              {...form.getInputProps('subcategory')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label='Priority'
              data={priorities}
              {...form.getInputProps('priority')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label='Impact'
              data={impacts}
              {...form.getInputProps('impact')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label='Urgency'
              data={urgencies}
              {...form.getInputProps('urgency')}
            />
          </Grid.Col>
        </Grid>

        <Select
          label='SLA Level'
          data={slaLevels}
          {...form.getInputProps('slaLevel')}
        />

        {/* Auto-assign Information */}
        <Alert icon={<IconInfoCircle size={16} />} color='blue' variant='light'>
          <Text size='sm' fw={500} mb='xs'>
            System Settings
          </Text>
          <Text size='sm' mb='xs'>
            {getAutoAssignMessage()}
          </Text>
          <Text size='sm'>{getAutoCloseMessage()}</Text>
        </Alert>

        <MultiSelect
          label='Related Tickets'
          placeholder='Select related tickets'
          data={[]} // This would be populated from API
          {...form.getInputProps('relatedTickets')}
        />

        <div>
          <Text size='sm' fw={500} mb='xs'>
            Attachments
          </Text>
          <Dropzone
            onDrop={handleFileDrop}
            maxSize={10 * 1024 * 1024} // 10MB
            accept={[
              'image/*',
              'application/pdf',
              'text/*',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]}
            multiple
          >
            <Group
              justify='center'
              gap='xl'
              style={{ minHeight: 120, pointerEvents: 'none' }}
            >
              <Dropzone.Accept>
                <IconUpload size={50} stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconUpload size={50} stroke={1.5} />
              </Dropzone.Idle>
              <div>
                <Text size='xl' inline>
                  Drag files here or click to select files
                </Text>
                <Text size='sm' color='dimmed' inline mt={7}>
                  Attach up to 10 files, each file should not exceed 10MB
                </Text>
              </div>
            </Group>
          </Dropzone>

          {files.length > 0 && (
            <Stack gap='xs' mt='md'>
              {files.map((file, index) => (
                <Group key={file.name} justify='space-between'>
                  <Text size='sm'>{file.name}</Text>
                  <Button
                    size='xs'
                    color='red'
                    variant='subtle'
                    onClick={() => handleFileRemove(index)}
                  >
                    Remove
                  </Button>
                </Group>
              ))}
            </Stack>
          )}
        </div>

        {form.values.priority === 'CRITICAL' && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title='Critical Priority'
            color='red'
          >
            This ticket has been marked as critical priority. It will be
            escalated to senior support staff immediately.
          </Alert>
        )}

        <Group justify='flex-end' mt='xl'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' loading={isSubmitting}>
            {isEditing ? 'Update Ticket' : 'Create Ticket'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
