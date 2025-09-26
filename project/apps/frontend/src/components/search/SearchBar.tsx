'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  ActionIcon,
  Group,
  Button,
  Text,
  Stack,
  Paper,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconHistory,
} from '@tabler/icons-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onAdvancedSearch: () => void;
  onSimpleFilters?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  recentSearches?: string[];
  onRecentSearchClick?: (search: string) => void;
}

export function SearchBar({
  value,
  onChange,
  onAdvancedSearch,
  onSimpleFilters,
  placeholder = 'Search tickets...',
  showFilters = true,
  recentSearches = [],
  onRecentSearchClick,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  const handleRecentSearch = (search: string) => {
    onChange(search);
    onRecentSearchClick?.(search);
    setShowRecent(false);
  };

  useEffect(() => {
    if (isFocused && recentSearches.length > 0) {
      setShowRecent(true);
    } else {
      setShowRecent(false);
    }
  }, [isFocused, recentSearches.length]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Group>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            value ? (
              <ActionIcon variant='subtle' size='sm' onClick={handleClear}>
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          style={{ flex: 1 }}
        />
        {showFilters && (
          <Button
            variant='light'
            leftSection={<IconFilter size={16} />}
            onClick={onSimpleFilters || onAdvancedSearch}
          >
            Filters
          </Button>
        )}
      </Group>

      {showRecent && recentSearches.length > 0 && (
        <Paper
          withBorder
          shadow='md'
          p='sm'
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
          }}
        >
          <Stack gap='xs'>
            <Text size='sm' fw={500} c='dimmed'>
              Recent Searches
            </Text>
            {recentSearches.slice(0, 5).map(search => (
              <Button
                key={search}
                variant='subtle'
                size='sm'
                justify='flex-start'
                leftSection={<IconHistory size={14} />}
                onClick={() => handleRecentSearch(search)}
                fullWidth
              >
                {search}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}
    </div>
  );
}
