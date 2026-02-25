(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/authClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const AuthClient = {
    async login (email, password) {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                password
            })
        });
        if (!res.ok) {
            let body;
            try {
                body = await res.json();
            } catch  {
                body = await res.text();
            }
            const msg = body && (body.error || body.message) ? body.error || body.message : JSON.stringify(body);
            throw new Error(msg || `Login failed (${res.status})`);
        }
        return res.json();
    },
    async register (email, password) {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        if (!res.ok) {
            let body;
            try {
                body = await res.json();
            } catch  {
                body = await res.text();
            }
            const msg = body && (body.error || body.message) ? body.error || body.message : JSON.stringify(body);
            throw new Error(msg || `Register failed (${res.status})`);
        }
        return res.json();
    },
    async logout () {
        try {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const token = window.localStorage.getItem('accessToken');
            if (!token) return;
            // decode JWT to get sub (userId)
            let userId = null;
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    userId = payload?.sub ?? null;
                }
            } catch  {
                userId = null;
            }
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId
                })
            });
            // clear client-side session
            window.localStorage.removeItem('accessToken');
            window.localStorage.removeItem('userEmail');
        } catch  {
            // ignore errors; ensure session cleared
            if ("TURBOPACK compile-time truthy", 1) {
                window.localStorage.removeItem('accessToken');
                window.localStorage.removeItem('userEmail');
            }
        }
    }
};
const __TURBOPACK__default__export__ = AuthClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_authClient_ts_f0d4fd76._.js.map