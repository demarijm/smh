import { IconButton, List, ListItem, ListItemText, MenuItem, MenuList, Slide } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { getAllItems, getItemGroups } from '../dashboardItems';
import Grid2 from '@mui/material/Unstable_Grid2';
import { TransitionGroup } from 'react-transition-group';
import { MAX_ITEMS, OPEN_STATE, removeItemOnce } from './dashboardEditorUtils';

export const ComponentEditor = ({ itemsChoice, setItemsChoice, addItem, open }) => {
    const renderListItems = () => {
        return itemsChoice.map((item, index) => (
            <Slide key={item.id} direction={'left'} appear={OPEN_STATE.OPEN === open}>
                <ListItem
                    secondaryAction={
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() =>
                                setItemsChoice((oldItems) => [...removeItemOnce(oldItems, index)])
                            }
                        >
                            <DeleteIcon />
                        </IconButton>
                    }
                >
                    <ListItemText
                        sx={{
                            '& .MuiTypography-root': { fontWeight: '600' },
                        }}
                    >
                        {item.title}
                    </ListItemText>
                </ListItem>
            </Slide>
        ));
    };

    const renderComponentGroup = (components) => {
        const group = components[0].group;

        return [
            <Typography
                key={`title-${group.id}`}
                sx={{ marginTop: '5px', fontWeight: '600', fontSize: '18px' }}
            >
                {group.title}
            </Typography>,
            ...components.map((item) => (
                <MenuItem
                    key={item.id}
                    value={item.id}
                    onClick={(event) => addItem(event.target.getAttribute('value'))}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#56EEF4',
                            color: '#000',
                        },
                    }}
                >
                    {item.title}
                </MenuItem>
            )),
        ];
    };

    const renderEditorGrid = () => {
        const componentsByGroup = getAllItems().reduce((acc, cur) => {
            return { ...acc, [cur.group.id]: [...(acc[cur.group.id] || []), cur] };
        }, {});
        const groupsMeta = getItemGroups();
        const componentKeys = Object.keys(componentsByGroup);
        componentKeys.sort((a, b) => groupsMeta[a].order - groupsMeta[b].order);

        return (
            <Grid2 container sx={{width: '100%', height: '100%'}}>
                <Grid2
                    key={'options'}
                    sx={{  width: '60%', height: '95%'}}
                >
                    <MenuList>
                        {componentKeys.map((group) =>
                            renderComponentGroup(componentsByGroup[group]),
                        )}
                    </MenuList>
                </Grid2>
                <Grid2
                    key={'current-values'}
                    sx={{
                        background: 'rgba(255,255,255, 0.1)',
                        width: '40%',
                    }}
                >
                    <div
                        style={{
                            height: '95%',
                            // background: 'red',
                        }}
                    >
                        <List>
                            <TransitionGroup>{renderListItems()}</TransitionGroup>
                        </List>
                    </div>
                    <Typography sx={{ alignItems: 'flex-end', paddingRight: '5px', textAlign:'right' }}>
                        {itemsChoice?.length || 0} / {MAX_ITEMS}
                    </Typography>
                </Grid2>
            </Grid2>
        );
    };

    return renderEditorGrid();
};
