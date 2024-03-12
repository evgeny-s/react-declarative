import * as React from 'react';
import { useState, useEffect } from 'react';

interface IPingViewProps<P extends any = object> {
    children?: React.ReactNode;
    Offline?: React.ComponentType<any>;
    ping: (payload?: P) => (boolean | Promise<boolean>);
    fallback?: (e: Error) => void;
    throwError?: boolean;
    delay?: 5_000;
    payload?: P;
    onOnline?: () => void;
    onOffline?: () => void;
}

interface IState {
    isOnline: boolean;
    initComplete: boolean;
}

const Fragment = () => <></>;

/**
 * PingView component for checking online status using a ping function.
 * Renders children when online, displays offline component when offline.
 *
 * @template P - Type parameter for the payload object passed to the ping function
 *
 * @param props - The component props
 * @param props.ping - The ping function to check online status
 * @param props.children - The child components to render when online
 * @param [props.onOnline=() => null] - Callback function to be called when online
 * @param [props.onOffline=() => null] - Callback function to be called when offline
 * @param [props.Offline=Fragment] - The component to render when offline
 * @param [props.fallback] - The fallback component to render when an error occurs
 * @param [props.throwError] - Indicates if an error should be thrown when an error occurs during ping
 * @param [props.delay=5000] - The delay between consecutive pings (in milliseconds)
 * @param [props.payload] - The payload object to be passed to the ping function
 *
 * @returns - The rendered component or null if initialization is in progress
 */
export const PingView = <P extends any = object>({
    ping,
    children,
    onOnline = () => null,
    onOffline = () => null,
    Offline = Fragment,
    fallback,
    throwError,
    delay = 5_000,
    payload,
}: IPingViewProps<P>) => {

    const [state, setState] = useState<IState>({
        isOnline: false,
        initComplete: false,
    });

    const setIsOnline = (isOnline: boolean) => {
        setState({ initComplete: true, isOnline });
        isOnline ? onOnline() : onOffline();
    };

    useEffect(() => {
        let timeout: any = null;
        let isDisposed = false;
        const process = async () => {
            try {
                const isOnline = await ping(payload);
                if (isDisposed) {
                    return;
                }
                setIsOnline(!!isOnline);
            } catch (e) {
                !isDisposed && setIsOnline(false);
                if (throwError) {
                    throw e;
                } else {
                    fallback && fallback(e as Error);
                }
            } finally {
                timeout = setTimeout(process, delay);
            }
        };
        process();
        return () => {
            isDisposed = true;
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        };
    }, [payload]);

    if (state.initComplete) {
        if (state.isOnline) {
            return (
                <>
                    {children}
                </>
            );
        } else {
            return (
                <Offline />
            );
        }
    } else {
        return null;
    }
};

export default PingView;
