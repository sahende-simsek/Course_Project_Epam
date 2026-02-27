module.exports = [
"[project]/src/frontend/app/ideas/drafts/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DraftsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function DraftsPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [accessToken, setAccessToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [drafts, setDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const token = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
        if ("TURBOPACK compile-time truthy", 1) {
            router.replace("/login");
            return;
        }
        //TURBOPACK unreachable
        ;
    }, [
        router
    ]);
    const loadDrafts = async (token)=>{
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3000/api/drafts", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                setError(`Failed to load drafts (${res.status})`);
                return;
            }
            const data = await res.json();
            setDrafts(data || []);
        } catch (err) {
            setError(err?.message ?? "Failed to load drafts");
        } finally{
            setLoading(false);
        }
    };
    const handleDelete = async (id)=>{
        if (!accessToken) return;
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(id)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (!res.ok && res.status !== 204) {
                const body = await res.json().catch(()=>null);
                const msg = body?.error || body?.error?.message || `Failed to delete draft (${res.status})`;
                throw new Error(msg);
            }
            setDrafts((prev)=>prev.filter((d)=>d.id !== id));
        } catch (err) {
            setError(err?.message ?? "Failed to delete draft");
        }
    };
    const handleSubmit = async (id)=>{
        if (!accessToken) return;
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(id)}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({})
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>null);
                const msg = body?.error || body?.error?.message || `Failed to submit draft (${res.status})`;
                throw new Error(msg);
            }
            // After submit, refresh list and redirect to welcome for simplicity
            await loadDrafts(accessToken);
            router.push("/welcome");
        } catch (err) {
            setError(err?.message ?? "Failed to submit draft");
        }
    };
    const handleRemoveAttachment = async (attachmentId)=>{
        if (!accessToken) return;
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/api/drafts/attachments/${encodeURIComponent(attachmentId)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (!res.ok && res.status !== 204) {
                const body = await res.json().catch(()=>null);
                const msg = body?.error || body?.error?.message || `Failed to delete attachment (${res.status})`;
                throw new Error(msg);
            }
            setDrafts((prev)=>prev.map((d)=>!d.attachments ? d : {
                        ...d,
                        attachments: d.attachments.filter((a)=>a.id !== attachmentId)
                    }));
        } catch (err) {
            setError(err?.message ?? "Failed to delete attachment");
        }
    };
    const handleAddAttachment = async (draftId, files)=>{
        if (!accessToken) return;
        setError(null);
        try {
            const newAttachments = [];
            for (const file of files){
                const contents = await new Promise((resolve, reject)=>{
                    const reader = new FileReader();
                    reader.onload = ()=>{
                        const result = reader.result;
                        if (typeof result === "string") {
                            const base64 = result.includes(",") ? result.split(",")[1] : result;
                            resolve(base64);
                        } else {
                            reject(new Error("Failed to read file"));
                        }
                    };
                    reader.onerror = ()=>reject(reader.error || new Error("Failed to read file"));
                    reader.readAsDataURL(file);
                });
                const res = await fetch("http://localhost:3000/api/drafts/attach", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        draftId,
                        filename: file.name,
                        mimetype: file.type || "application/octet-stream",
                        size: file.size,
                        contentBase64: contents
                    })
                });
                if (!res.ok) {
                    const body = await res.json().catch(()=>null);
                    const msg = body?.error || body?.error?.message || `Failed to add attachment (${res.status})`;
                    throw new Error(msg);
                }
                const newAttachment = await res.json();
                newAttachments.push(newAttachment);
            }
            setDrafts((prev)=>prev.map((d)=>d.id === draftId ? {
                        ...d,
                        attachments: [
                            ...d.attachments || [],
                            ...newAttachments
                        ]
                    } : d));
        } catch (err) {
            setError(err?.message ?? "Failed to add attachment");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "welcome-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "card",
            "aria-labelledby": "drafts-heading",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: "0.75rem"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn secondary",
                        onClick: ()=>router.push("/welcome"),
                        children: "Back to home"
                    }, void 0, false, {
                        fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                    lineNumber: 190,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    id: "drafts-heading",
                    children: "My Drafts"
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this),
                loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "Loading drafts…"
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                    lineNumber: 200,
                    columnNumber: 21
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    role: "alert",
                    style: {
                        color: "red",
                        marginTop: "0.5rem"
                    },
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                    lineNumber: 202,
                    columnNumber: 11
                }, this),
                !loading && drafts.length === 0 && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "You have no drafts yet."
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                    lineNumber: 206,
                    columnNumber: 55
                }, this),
                !loading && drafts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "idea-list",
                    children: drafts.map((draft)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "idea-item",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            children: draft.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                            lineNumber: 212,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: draft.description
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                            lineNumber: 213,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                            children: draft.category
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                            lineNumber: 214,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: "0.5rem"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Attachments:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 21
                                                }, this),
                                                draft.attachments && draft.attachments.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    children: draft.attachments.map((att)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: att.url,
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    children: att.filename
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                                    lineNumber: 221,
                                                                    columnNumber: 29
                                                                }, this),
                                                                " ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "btn secondary",
                                                                    style: {
                                                                        marginLeft: "0.5rem"
                                                                    },
                                                                    onClick: ()=>void handleRemoveAttachment(att.id),
                                                                    children: "Remove"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                                    lineNumber: 224,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, att.id, true, {
                                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                            lineNumber: 220,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        marginTop: "0.25rem"
                                                    },
                                                    children: "No attachments."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginTop: "0.5rem"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "file",
                                                        multiple: true,
                                                        onChange: (e)=>{
                                                            const files = e.target.files ? Array.from(e.target.files) : [];
                                                            if (files.length > 0) {
                                                                void handleAddAttachment(draft.id, files);
                                                                e.target.value = "";
                                                            }
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                                    lineNumber: 238,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                            lineNumber: 215,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                    lineNumber: 211,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: "0.5rem"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn",
                                            onClick: ()=>handleSubmit(draft.id),
                                            children: "Submit"
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                            lineNumber: 254,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn secondary",
                                            onClick: ()=>handleDelete(draft.id),
                                            children: "Delete"
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                            lineNumber: 257,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                                    lineNumber: 253,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, draft.id, true, {
                            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                            lineNumber: 210,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
                    lineNumber: 208,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
            lineNumber: 189,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/frontend/app/ideas/drafts/page.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_frontend_app_ideas_drafts_page_tsx_aa9d13a6._.js.map