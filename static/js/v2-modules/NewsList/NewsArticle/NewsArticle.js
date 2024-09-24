import React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function NewsArticle(props) {
    return (
        <Grid2 position={'relative'} sx={{ maxHeight: '100%' }}>
            <a
                href={props.link}
                rel="noreferrer"
                target="_blank"
                style={{ textDecoration: 'none' }}
            >
                <Card
                    sx={{
                        maxHeight: '100px',
                        marginBottom: '5px',
                        backgroundColor: '#000',
                        transition: '0.5s all',
                        '&:hover': { opacity: 0.8 },
                    }}
                >
                    <CardContent sx={{ padding: '8px 16px 8px 16px !important' }}>
                        <Typography
                            sx={{
                                fontSize: { sm: 14, xs: 12 },
                                fontWeight: 'bold',
                                marginBottom: '0px',
                                paddingBottom: '0px',
                                fontFamily: 'Arial, Helvetica, sans-serif',
                            }}
                            color="white"
                            gutterBottom
                        >
                            {props.title}
                        </Typography>
                    </CardContent>
                </Card>
            </a>
        </Grid2>
    );
}
