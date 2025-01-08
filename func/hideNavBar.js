import * as NavigationBar from 'expo-navigation-bar';
import React, { useRef, useEffect } from 'react';

const hideNavBar = () => {
    const timeoutRef = useRef(null);

    const hideNavigationBar = async () => {
        await NavigationBar.setVisibilityAsync('hidden');
    };

    const checkVisibility = async () => {
        const isVisible = await NavigationBar.getVisibilityAsync();
        if (isVisible === 'visible') {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            timeoutRef = setTimeout(() => {
                hideNavigationBar();
                timeoutRef.current = null;
            }, 2000);
        }
    };

    const lastClear = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }
    const recheck = async () => {
        await checkVisibility();
    }

    return { recheck, lastClear };
}

export default hideNavBar;