import React from 'react';
import { logToServer } from '../api/apexApi';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error(error, info);
        const serverError = {
            error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            info: JSON.stringify(info),
            userAgent: window.navigator.userAgent,
        };

        logToServer('error', {message: 'error boundary trigger', info: serverError});
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}
