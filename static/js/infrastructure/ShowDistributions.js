import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

export const ShowDistributions = ({ showDistributions, setShowDistributions }) => {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={showDistributions || false}
                        onChange={(ev, value) => setShowDistributions(value)}
                    />
                }
                label="Show Distributions"
            />
        </FormGroup>
    );
};
