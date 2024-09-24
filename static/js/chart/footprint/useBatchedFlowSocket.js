import { useCallback, useEffect, useRef, useState } from 'react';
import { flowSocketService, SOCKET_TYPE } from '../../infrastructure/SocketService';

const REFRESH_INTERVAL_MS = 400;

export const useBatchedFlowSocket = ({ ticker, timeframe, handleMessages }) => {
    const [socketKey, setSocketKey] = useState(undefined);
    const [messageBuffer, setMessageBuffer] = useState([]);
    const [socketLoading, setSocketLoading] = useState(true);
    const [socketError, setSocketError] = useState(undefined);

    // Used so processMessageBatch can access the current state from a stale closure
    const stateRef = useRef({});
    stateRef.current = { messageBuffer, timeframe };

    const processMessageBatch = () => {
        const { messageBuffer, timeframe } = stateRef.current;
        if (messageBuffer.length > 0) {
            handleMessages(messageBuffer, timeframe);
            setMessageBuffer([]);
        }
    };

    const updateBuffer = useCallback((msg, type) => {
        setMessageBuffer((buf) => [...buf, { msg, type }]);
    }, []);

    const unsubscribe = useCallback(() => {
        setMessageBuffer([]);
        flowSocketService.unsubscribe(SOCKET_TYPE.FOOTPRINT, ticker, socketKey, { timeframe });
    }, [socketKey, ticker, timeframe]);

    useEffect(() => {
        const interval = setInterval(processMessageBatch, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setMessageBuffer([]);
        const socket = flowSocketService.subscribe(
            SOCKET_TYPE.FOOTPRINT,
            ticker,
            { current: updateBuffer },
            setSocketLoading,
            setSocketError,
            { timeframe },
        );
        setSocketKey(socket);

        return () => {
            setMessageBuffer([]);
            flowSocketService.unsubscribe(SOCKET_TYPE.FOOTPRINT, ticker, socket, { timeframe });
        };
    }, [ticker, updateBuffer, timeframe]);

    return { unsubscribe, socketLoading, socketError };
};
