export const convertUnixTimestamp = (timestamp) => {
    var date = new Date(timestamp);
    var formattedTime = date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/New_York',
    });
    return formattedTime;
};

export const convertUnixTimestampWithDay = (timestamp) => {
    var date = new Date(timestamp);
    var formattedTime = date.toLocaleString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });
    return formattedTime;
};

export const convertNumberToDollar = (number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return formatter.format(number);
};

export const roundToTwoDecimals = (number) => {
    return Math.round((number + Number.EPSILON) * 100) / 100;
};

export const generateOptionsSentiment = (optionsFlow) => {
    let callSentiment = 0;
    let callVolume = 0;
    let callValue = 0;
    let putSentiment = 0;
    let putVolume = 0;
    let putValue = 0;
    for (const flow of optionsFlow) {
        if (typeof flow.contractPrice !== 'undefined') {
            if (flow.contractType === 'CALL' && flow.contractPrice) {
                callSentiment += Number(flow.contractPrice.substring(1)) * Number(flow.tradeSize);
                callVolume += Number(flow.tradeSize);
                callValue += Number(flow.rawTotalTradeValue);
            } else if (flow.contractType === 'PUT' && flow.contractPrice) {
                putSentiment += Number(flow.contractPrice.substring(1)) * Number(flow.tradeSize);
                putVolume += Number(flow.tradeSize);
                putValue += Number(flow.rawTotalTradeValue);
            }
        }
    }
    const combinedSentiment = callSentiment + putSentiment;

    return {
        calls:
            combinedSentiment === 0
                ? 0
                : roundToTwoDecimals((callSentiment / combinedSentiment).toFixed(2) * 100),
        puts:
            combinedSentiment === 0
                ? 0
                : roundToTwoDecimals((putSentiment / combinedSentiment).toFixed(2) * 100),
        callVolume: callVolume,
        putVolume: putVolume,
        callPrice: callValue,
        putPrice: putValue,
    };
};

export const numberComparator = (a, b) => {
    let aNum = typeof a === 'number' ? a : Number(a.replace(/[^0-9.-]+/g, ''));
    let bNum = typeof b === 'number' ? b : Number(b.replace(/[^0-9.-]+/g, ''));
    return aNum - bNum;
};
