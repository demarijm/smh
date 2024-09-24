import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';

const DEFAULT_VALUE = '_raw_';

export const VariantSelector = ({
    selectedVariant,
    setSelectedVariant,
    variantOptions,
    includeNullValue = true,
}) => {
    return (
        <ToggleButtonGroup
            exclusive={true}
            fullWidth
            size={'small'}
            value={selectedVariant}
            onChange={(_, value) => setSelectedVariant(value === DEFAULT_VALUE ? undefined : value)}
            sx={{
                maxHeight: '31px',
                alignSelf: 'center',
            }}
        >
            {includeNullValue && (
                <ToggleButton
                    key={'raw'}
                    value={DEFAULT_VALUE}
                    selected={!selectedVariant || DEFAULT_VALUE === selectedVariant}
                >
                    Raw
                </ToggleButton>
            )}
            {variantOptions.map((variant) => (
                <ToggleButton key={variant.id} value={variant.id}>
                    {variant.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};
