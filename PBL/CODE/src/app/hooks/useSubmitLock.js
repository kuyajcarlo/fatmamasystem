import { useCallback, useRef, useState } from 'react';

/**
 * Makes an action strictly one-at-a-time.
 * While the action is running, further clicks/submits are ignored (the ref blocks
 * them instantly, before React even re-renders), and `pending` can be used to
 * disable the button / show "Please wait…".
 *
 *   const [handleSave, saving] = useSubmitLock(async () => { ... });
 *   <button onClick={handleSave} disabled={saving}>Save</button>
 */
export function useSubmitLock(action) {
    const locked = useRef(false);
    const latest = useRef(action);
    latest.current = action;
    const [pending, setPending] = useState(false);

    const run = useCallback(async (...args) => {
        // a repeated <form> submit must never fall through to a native page reload
        if (args[0] && args[0].type === 'submit') args[0].preventDefault();
        if (locked.current) return undefined;
        locked.current = true;
        setPending(true);
        try {
            return await latest.current(...args);
        } finally {
            locked.current = false;
            setPending(false);
        }
    }, []);

    return [run, pending];
}
