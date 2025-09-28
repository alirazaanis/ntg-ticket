'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Text,
  Button,
  Group,
  Badge,
  Divider,
  ScrollArea,
  Loader,
} from '@mantine/core';
import { IconSearch, IconTag, IconUser, IconTicket } from '@tabler/icons-react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggestion' | 'category' | 'user' | 'status';
  count?: number;
}

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  recentSearches: string[];
  maxItems?: number;
}

export function SearchSuggestions({
  query,
  onSuggestionClick,
  recentSearches,
  maxItems = 8,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      const generatedSuggestions: SearchSuggestion[] = [];

      // Add recent searches that match
      recentSearches
        .filter(
          search =>
            search.toLowerCase().includes(query.toLowerCase()) &&
            search !== query
        )
        .slice(0, 3)
        .forEach(search => {
          generatedSuggestions.push({
            id: `recent-${search}`,
            text: search,
            type: 'recent',
          });
        });

      // Add common suggestions based on query
      const commonSuggestions = [
        { text: 'High Priority', type: 'suggestion' as const },
        { text: 'Open Status', type: 'suggestion' as const },
        { text: 'This Week', type: 'suggestion' as const },
        { text: 'Bug Report', type: 'suggestion' as const },
        { text: 'Feature Request', type: 'suggestion' as const },
      ];

      // Filter suggestions that match the query
      commonSuggestions
        .filter(suggestion =>
          suggestion.text.toLowerCase().includes(query.toLowerCase())
        )
        .forEach((suggestion, index) => {
          generatedSuggestions.push({
            id: `suggestion-${index}`,
            text: suggestion.text,
            type: suggestion.type,
          });
        });

      // Add category suggestions
      const categories = [
        'Bug Report',
        'Feature Request',
        'Support',
        'Technical Issue',
      ];
      categories
        .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .forEach(category => {
          generatedSuggestions.push({
            id: `category-${category}`,
            text: category,
            type: 'category',
          });
        });

      setSuggestions(generatedSuggestions.slice(0, maxItems));
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, recentSearches, maxItems]);

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <IconSearch size={14} />;
      case 'category':
        return <IconTag size={14} />;
      case 'user':
        return <IconUser size={14} />;
      case 'status':
        return <IconTicket size={14} />;
      default:
        return <IconSearch size={14} />;
    }
  };

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'blue';
      case 'category':
        return 'green';
      case 'user':
        return 'purple';
      case 'status':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (!query.trim()) {
    return null;
  }

  return (
    <Paper withBorder shadow='md' p='sm' radius='md'>
      <Stack gap='xs'>
        <Group justify='space-between' mb='xs'>
          <Text size='sm' fw={500} c='dimmed'>
            Search Suggestions
          </Text>
          {isLoading && <Loader size='xs' />}
        </Group>

        <Divider />

        <div style={{ maxHeight: 200 }}>
          <ScrollArea.Autosize>
            <Stack gap='xs'>
              {suggestions.map(suggestion => (
                <Button
                  key={suggestion.id}
                  variant='subtle'
                  size='sm'
                  justify='flex-start'
                  leftSection={getSuggestionIcon(suggestion.type)}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  fullWidth
                  data-suggestion
                  style={{
                    height: 'auto',
                    padding: '8px 12px',
                  }}
                >
                  <Group justify='space-between' style={{ width: '100%' }}>
                    <Text size='sm' style={{ flex: 1 }}>
                      {suggestion.text}
                    </Text>
                    <Badge
                      size='xs'
                      variant='light'
                      color={getSuggestionColor(suggestion.type)}
                    >
                      {suggestion.type}
                    </Badge>
                  </Group>
                </Button>
              ))}

              {suggestions.length === 0 && !isLoading && (
                <Text size='sm' c='dimmed' ta='center' py='md'>
                  No suggestions found
                </Text>
              )}
            </Stack>
          </ScrollArea.Autosize>
        </div>
      </Stack>
    </Paper>
  );
}
