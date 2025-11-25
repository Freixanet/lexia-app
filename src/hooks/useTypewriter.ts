import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string, baseSpeed: number = 30, isEnabled: boolean = true) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // Refs to keep track of current state inside the interval without triggering re-renders
    const targetTextRef = useRef(text);
    const currentLengthRef = useRef(0);
    const isEnabledRef = useRef(isEnabled);

    // Debug mount/unmount
    useEffect(() => {
        console.log(`[Typewriter] Mount. Text len: ${text.length}`);
        return () => console.log(`[Typewriter] Unmount. Final len: ${currentLengthRef.current}`);
    }, []);

    // Update refs and handle immediate show when props change
    useEffect(() => {
        targetTextRef.current = text;
        isEnabledRef.current = isEnabled;

        // If disabled (e.g. history or stream finished), show immediately
        // But ONLY if we haven't started typing yet!
        // This allows history to load instantly, but prevents cutting off an active animation.
        if (!isEnabled && currentLengthRef.current === 0) {
            setDisplayedText(text);
            currentLengthRef.current = text.length;
            setIsComplete(true);
        }
    }, [text, isEnabled]);

    useEffect(() => {
        // Case 3: Typing animation
        // We ALWAYS run the timer to completion if we have started typing.
        const timer = setInterval(() => {
            // If disabled AND we haven't started typing, do nothing (handled by effect above)
            if (!isEnabledRef.current && currentLengthRef.current === 0) return;

            const target = targetTextRef.current;
            const current = currentLengthRef.current;

            if (current < target.length) {
                // STRICT MODE: Always add exactly 1 character per tick
                const nextChar = target.charAt(current);

                setDisplayedText(prev => prev + nextChar);
                currentLengthRef.current += 1;
                setIsComplete(false);

                // Log every 10 chars to avoid spam
                if (currentLengthRef.current % 10 === 0) {
                    console.log(`[Typewriter] Tick. Len: ${currentLengthRef.current}/${target.length}`);
                }
            } else {
                // We are done
                if (!isComplete && current > 0) {
                    setIsComplete(true);
                    console.log('[Typewriter] Complete');
                }
            }
        }, baseSpeed);

        return () => clearInterval(timer);
    }, [baseSpeed]); // Re-create timer only if speed changes

    return { displayedText, isComplete };
}
