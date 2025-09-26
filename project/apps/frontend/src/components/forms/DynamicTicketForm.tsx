'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Grid,
  NumberInput,
  Alert,
  Loader,
  Center,
  Divider,
} from '@mantine/core';
import { RichTextEditorComponent } from '../ui/RichTextEditor';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import {
  TicketCategory,
  TicketPriority,
  TicketImpact,
  TicketUrgency,
  SlaLevel,
  DynamicFieldType,
  DynamicField,
  DynamicTicketFormValues,
  DynamicValidationRules,
  Subcategory,
} from '../../types/unified';
import {
  useDynamicFields as useCategoryDynamicFields,
  useSubcategories as useCategorySubcategories,
} from '../../hooks/useCategories';
import { FileUpload } from './FileUpload';
import { FileWithPath } from '@mantine/dropzone';

interface DynamicTicketFormProps {
  onSubmit: (values: DynamicTicketFormValues) => void;
  loading?: boolean;
  initialValues?: Partial<DynamicTicketFormValues>;
}

export function DynamicTicketForm({
  onSubmit,
  loading = false,
  initialValues,
}: DynamicTicketFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [attachments, setAttachments] = useState<FileWithPath[]>([]);

  // Use hooks for API calls
  const {
    data: dynamicFields = [],
    isLoading: loadingFields,
    error: dynamicFieldsError,
  } = useCategoryDynamicFields(selectedCategory);

  const { data: subcategories = [], error: subcategoriesError } =
    useCategorySubcategories(selectedCategory);

  const error = dynamicFieldsError || subcategoriesError;

  const form = useForm<DynamicTicketFormValues>({
    initialValues: {
      title: '',
      description: '',
      category: TicketCategory.SOFTWARE,
      subcategory: '',
      priority: TicketPriority.MEDIUM,
      impact: TicketImpact.MODERATE,
      urgency: TicketUrgency.NORMAL,
      slaLevel: SlaLevel.STANDARD,
      attachments: [],
      ...initialValues,
    },
    validate: {
      title: value => (!value ? 'Title is required' : null),
      description: value => (!value ? 'Description is required' : null),
      category: value => (!value ? 'Category is required' : null),
      subcategory: value => (!value ? 'Subcategory is required' : null),
    },
  });

  // Update form validation when dynamic fields change
  useEffect(() => {
    if (dynamicFields.length > 0) {
      const dynamicValidation: DynamicValidationRules = {};
      dynamicFields.forEach((field: DynamicField) => {
        if (field.required) {
          dynamicValidation[field.name] = (value: unknown) =>
            !value ? `${field.name} is required` : null;
        }
      });
      // Note: Form validation would need to be updated here if needed
    }
  }, [dynamicFields]);

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      setSelectedCategory(value);
      form.setFieldValue('subcategory', ''); // Reset subcategory
    }
  };

  const handleSubmit = (values: DynamicTicketFormValues) => {
    // Filter out empty dynamic field values
    const filteredValues: DynamicTicketFormValues = { ...values };
    dynamicFields.forEach((field: DynamicField) => {
      if (!filteredValues[field.name]) {
        delete filteredValues[field.name];
      }
    });

    // Add attachments to the form data
    filteredValues.attachments = attachments;

    onSubmit(filteredValues);
  };

  const renderField = (field: DynamicField) => {
    const commonProps = {
      key: field.name,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      ...form.getInputProps(field.name),
    };

    switch (field.type) {
      case DynamicFieldType.TEXTAREA:
        return <Textarea {...commonProps} minRows={3} />;

      case DynamicFieldType.SELECT:
        return (
          <Select {...commonProps} data={field.options || []} searchable />
        );

      case DynamicFieldType.NUMBER:
        return <NumberInput {...commonProps} min={0} />;

      case DynamicFieldType.TEXT:
      default:
        return <TextInput {...commonProps} />;
    }
  };

  return (
    <Container size='md' py='md'>
      <Paper withBorder shadow='sm' p='xl' radius='md'>
        <Title order={2} mb='md'>
          Create New Ticket
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color='red' mb='md'>
            {error instanceof Error
              ? error.message
              : 'Failed to load form fields'}
          </Alert>
        )}

        <form
          onSubmit={form.onSubmit(
            handleSubmit as (values: DynamicTicketFormValues) => void
          )}
        >
          <Stack gap='md'>
            {/* Basic Fields */}
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label='Title'
                  placeholder='Brief description of the issue'
                  required
                  {...form.getInputProps('title')}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <RichTextEditorComponent
                  label='Description'
                  placeholder='Detailed description of the issue'
                  required
                  minHeight={200}
                  maxHeight={400}
                  value={form.values.description}
                  onChange={value => form.setFieldValue('description', value)}
                  error={form.errors.description}
                  allowImageUpload={true}
                  allowTableInsertion={true}
                  allowCodeBlocks={true}
                  allowHeadings={true}
                  allowLists={true}
                  allowTextFormatting={true}
                  allowTextAlignment={true}
                  allowTextColor={false}
                  allowHighlight={true}
                  allowLinks={true}
                  allowUndoRedo={true}
                  allowClearFormatting={true}
                  showToolbar={true}
                  toolbarPosition='top'
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label='Category'
                  placeholder='Select category'
                  required
                  data={Object.values(TicketCategory).map(cat => ({
                    value: cat,
                    label: cat.replace('_', ' '),
                  }))}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label='Subcategory'
                  placeholder='Select subcategory'
                  required
                  data={subcategories.map((sub: Subcategory) => ({
                    value: sub.id,
                    label: sub.name,
                  }))}
                  disabled={!selectedCategory || loadingFields}
                  {...form.getInputProps('subcategory')}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <Select
                  label='Priority'
                  placeholder='Select priority'
                  required
                  data={Object.values(TicketPriority).map(pri => ({
                    value: pri,
                    label: pri,
                  }))}
                  {...form.getInputProps('priority')}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <Select
                  label='Impact'
                  placeholder='Select impact'
                  required
                  data={Object.values(TicketImpact).map(imp => ({
                    value: imp,
                    label: imp,
                  }))}
                  {...form.getInputProps('impact')}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <Select
                  label='Urgency'
                  placeholder='Select urgency'
                  required
                  data={Object.values(TicketUrgency).map(urg => ({
                    value: urg,
                    label: urg,
                  }))}
                  {...form.getInputProps('urgency')}
                />
              </Grid.Col>
            </Grid>

            {/* Dynamic Fields */}
            {loadingFields && (
              <Center py='md'>
                <Loader size='sm' />
                <Text ml='sm' size='sm' c='dimmed'>
                  Loading category-specific fields...
                </Text>
              </Center>
            )}

            {dynamicFields.length > 0 && (
              <>
                <Divider my='md' />
                <Text size='lg' fw={500}>
                  Additional Information
                </Text>
                <Grid>
                  {dynamicFields.map((field: DynamicField) => (
                    <Grid.Col
                      span={field.type === DynamicFieldType.TEXTAREA ? 12 : 6}
                      key={field.name}
                    >
                      {renderField(field)}
                    </Grid.Col>
                  ))}
                </Grid>
              </>
            )}

            {/* File Attachments */}
            <Divider my='md' />
            <Text size='lg' fw={500}>
              Attachments
            </Text>
            <Text size='sm' c='dimmed' mb='md'>
              Upload screenshots, documents, or other files related to this
              ticket
            </Text>
            <FileUpload
              onFilesChange={setAttachments}
              maxFiles={5}
              maxSize={10}
              disabled={loading}
            />

            {/* Submit Button */}
            <Group justify='flex-end' mt='xl'>
              <Button
                type='submit'
                loading={loading}
                leftSection={<IconPlus size={16} />}
                size='md'
              >
                Create Ticket
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
