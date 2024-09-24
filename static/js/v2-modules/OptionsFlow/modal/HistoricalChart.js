import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function HistoricalChart({ historicalData }) {
    const data = {
        labels: historicalData.label,
        datasets: [
            {
                id: 'bid',
                label: 'Bid',
                data: historicalData.bid,
                backgroundColor: '#e63262',
                borderWidth: 1,
                order: 1,
            },
            {
                id: 'ask',
                label: 'Ask',
                data: historicalData.ask,
                backgroundColor: '#4acf81',
                borderWidth: 1,
                order: 1,
            },
            {
                id: 'mark',
                label: 'Mark',
                data: historicalData.mark,
                backgroundColor: '#56eef4',
                borderWidth: 1,
                order: 1,
            },

            {
                id: 'price',
                type: 'line',
                label: 'Average Price',
                data: historicalData.averagePrice,
                backgroundColor: '#ffc933',
                borderColor: '#ffc933',
                borderWidth: 1,
                yAxisID: 'averagePrice',
                order: 0,
            },
        ],
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px',
                width: '100%',
                boxSizing: 'border-box',

            }}
        >
            <Bar
                style={{ width: '100%', height: '600px' }}
                data={data}
                options={{
                    color: '#FFFFFF',
                    maintainAspectRatio: false,
                    title: {
                        display: false,
                    },
                    plugins: {
                        datalabels: {
                            display: false,
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                        },
                    },
                }}
            />
        </div>
    );
}
