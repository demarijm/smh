import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyledItem } from './Styled';

export const CarouselItem = ({
    animation,
    next,
    prev,
    swipe,
    state,
    index,
    maxIndex,
    duration,
    child,
    height,
    setHeight,
}) => {
    const slide = animation === 'slide';
    const fade = animation === 'fade';

    const dragProps = {
        drag: 'x',
        layout: true,
        onDragEnd: (event, info) => {
            if (!swipe) return;

            if (info.offset.x > 0) prev && prev();
            else if (info.offset.x < 0) next && next();

            event.stopPropagation();
        },
        dragElastic: 0,
        dragConstraints: { left: 0, right: 0 },
    };

    const divRef = useRef(null);

    const checkAndSetHeight = useCallback(() => {
        if (index !== state.active) return;
        if (!divRef.current) return;

        if (divRef.current.offsetHeight === 0) {
            setTimeout(() => checkAndSetHeight(), 100);
        } else {
            setHeight(divRef.current.offsetHeight);
        }
    }, [setHeight, state.active, index, divRef]);

    // Set height on every child change
    useEffect(() => {
        checkAndSetHeight();
    }, [checkAndSetHeight]);

    const variants = {
        leftwardExit: {
            x: slide ? '-100%' : undefined,
            opacity: fade ? 0 : undefined,
            zIndex: 0,
            // position: 'relative'
        },
        leftOut: {
            x: slide ? '-100%' : undefined,
            opacity: fade ? 0 : undefined,
            display: 'none',
            zIndex: 0,
            // position: 'relative'
        },
        rightwardExit: {
            x: slide ? '100%' : undefined,
            opacity: fade ? 0 : undefined,
            zIndex: 0,
            // position: 'relative'
        },
        rightOut: {
            x: slide ? '100%' : undefined,
            opacity: fade ? 0 : undefined,
            display: 'none',
            zIndex: 0,
            // position: 'relative'
        },
        center: {
            x: 0,
            opacity: 1,
            zIndex: 1,
            // position: 'relative'
        },
    };

    // Handle animation directions and opacity given based on active, prevActive and this item's index
    const { active, next: isNext } = state;
    let animate = 'center';
    if (index === active) {
        animate = 'center';
    } else {
        animate = index < active ? 'leftOut' : 'rightOut';
        if (active === maxIndex && index === 0) animate = 'rightOut';
        if (active === 0 && index === maxIndex) animate = 'leftOut';
    }

    duration = duration / 1000;

    return (
        <StyledItem>
            <AnimatePresence custom={isNext}>
                <motion.div {...(swipe && dragProps)} style={{ height: '100%' }}>
                    <motion.div
                        custom={isNext}
                        variants={variants}
                        animate={animate}
                        transition={{
                            x: { type: 'tween', duration: duration, delay: 0 },
                            opacity: { duration: duration },
                        }}
                        style={{ position: 'relative', height: '100%' }}
                    >
                        <div ref={divRef} style={{ height: height }}>
                            {child}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </StyledItem>
    );
};
