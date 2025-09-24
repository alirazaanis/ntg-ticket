'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { DynamicTicketForm } from '../../../components/forms/DynamicTicketForm';
import { DynamicTicketFormValues } from '../../../types/unified';
import { ticketApi, CreateTicketInput } from '../../../lib/apiClient';

export default function CreateTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: DynamicTicketFormValues) => {
    setLoading(true);

    try {
      // Convert DynamicTicketFormValues to CreateTicketInput
      const createTicketData: CreateTicketInput = {
        title: values.title,
        description: values.description,
        category: values.category as CreateTicketInput['category'],
        subcategory: values.subcategory,
        priority: values.priority as CreateTicketInput['priority'],
        impact: values.impact as CreateTicketInput['impact'],
        urgency: values.urgency as CreateTicketInput['urgency'],
        slaLevel: values.slaLevel as CreateTicketInput['slaLevel'],
        customFields: Object.keys(values)
          .filter(
            key =>
              ![
                'title',
                'description',
                'category',
                'subcategory',
                'priority',
                'impact',
                'urgency',
                'slaLevel',
                'attachments',
              ].includes(key)
          )
          .reduce(
            (acc, key) => {
              acc[key] = values[key] as string | number | boolean;
              return acc;
            },
            {} as Record<string, string | number | boolean>
          ),
      };

      const response = await ticketApi.createTicket(createTicketData);
      const result = response.data;

      notifications.show({
        title: 'Success',
        message: 'Ticket created successfully',
        color: 'green',
      });

      // Redirect to the created ticket
      router.push(`/tickets/${result.data.id}`);
    } catch (error) {
      // Handle ticket creation error
      notifications.show({
        title: 'Error',
        message:
          error instanceof Error ? error.message : 'Failed to create ticket',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return <DynamicTicketForm onSubmit={handleSubmit} loading={loading} />;
}
