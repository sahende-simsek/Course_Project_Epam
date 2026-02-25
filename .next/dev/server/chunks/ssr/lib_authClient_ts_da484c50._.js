module.exports = [
"[project]/lib/authClient.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
            if ("TURBOPACK compile-time truthy", 1) return;
            //TURBOPACK unreachable
            ;
            const token = undefined;
            // decode JWT to get sub (userId)
            let userId;
        } catch  {
            // ignore errors; ensure session cleared
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
    }
};
const __TURBOPACK__default__export__ = AuthClient;
}),
];

//# sourceMappingURL=lib_authClient_ts_da484c50._.js.map