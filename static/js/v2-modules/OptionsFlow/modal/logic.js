export function getContractData(contractData) {
    if (contractData === 'undefined' || contractData === null || contractData === undefined) {
        return [];
    }
    const ask = [],
        bid = [],
        averagePrice = [],
        label = [],
        mark = [];

    const { dailyContractData, contract, multileg, historicalValues } = contractData;

    Object.keys(historicalValues).forEach((key, index) => {
        if (historicalValues[key] !== null) {
            label.unshift(key);
            bid.unshift(historicalValues[key].aggregateData.bid);
            ask.unshift(historicalValues[key].aggregateData.ask);
            mark.unshift(
                historicalValues[key].volume -
                    (historicalValues[key].aggregateData.ask +
                        historicalValues[key].aggregateData.bid),
            );
            averagePrice.unshift(historicalValues[key].averagePrice);
        }
    });

    return {
        dailyContractData: dailyContractData,
        contractData: contract,
        multilegData: multileg,
        historicalData: {
            label: label,
            bid: bid,
            ask: ask,
            mark: mark,
            averagePrice: averagePrice,
        },
    };
}
