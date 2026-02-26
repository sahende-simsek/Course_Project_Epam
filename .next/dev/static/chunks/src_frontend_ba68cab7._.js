(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/frontend/lib/ideaFormConfig.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getIdeaFormConfig",
    ()=>getIdeaFormConfig
]);
const BASE_FIELDS = [
    {
        name: 'title',
        label: 'Idea title',
        type: 'text',
        required: true
    },
    {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true
    }
];
const CATEGORY_FIELDS = {
    'process-improvement': [
        {
            name: 'currentOwner',
            label: 'Current process owner',
            type: 'text',
            required: true
        },
        {
            name: 'expectedSavings',
            label: 'Expected cost savings',
            type: 'number',
            required: false
        }
    ],
    'new-product': [
        {
            name: 'targetCustomer',
            label: 'Target customer segment',
            type: 'text',
            required: true
        },
        {
            name: 'estimatedRevenue',
            label: 'Estimated annual revenue',
            type: 'number',
            required: false
        }
    ],
    other: []
};
function getIdeaFormConfig(category) {
    const normalized = (category ?? 'other').toLowerCase();
    const extra = CATEGORY_FIELDS[normalized] ?? CATEGORY_FIELDS.other;
    return [
        ...BASE_FIELDS,
        ...extra
    ];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/frontend/app/ideas/new/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewIdeaPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$lib$2f$ideaFormConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/frontend/lib/ideaFormConfig.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function NewIdeaPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [accessToken, setAccessToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("other");
    const [dynamicValues, setDynamicValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [draftId, setDraftId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingDraft, setLoadingDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewIdeaPage.useEffect": ()=>{
            const token = ("TURBOPACK compile-time truthy", 1) ? window.localStorage.getItem("accessToken") : "TURBOPACK unreachable";
            if (!token) {
                router.replace("/login");
                return;
            }
            setAccessToken(token);
            const qpDraftId = searchParams.get("draftId");
            if (qpDraftId) {
                setDraftId(qpDraftId);
                void loadDraft(token, qpDraftId);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["NewIdeaPage.useEffect"], [
        router,
        searchParams
    ]);
    const loadDraft = async (token, id)=>{
        setLoadingDraft(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/api/drafts?id=${encodeURIComponent(id)}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                setError(`Failed to load draft (${res.status})`);
                return;
            }
            const draft = await res.json();
            setTitle(draft.title || "");
            setDescription(draft.description || "");
            setCategory(draft.category || "other");
            setDynamicValues(draft.dynamicFieldValues || {});
        } catch (err) {
            setError(err?.message ?? "Failed to load draft");
        } finally{
            setLoadingDraft(false);
        }
    };
    const fields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$frontend$2f$lib$2f$ideaFormConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getIdeaFormConfig"])(category);
    const handleDynamicChange = (field, value)=>{
        setDynamicValues((prev)=>({
                ...prev,
                [field.name]: field.type === "number" ? Number(value) : value
            }));
    };
    const handleSaveDraft = async ()=>{
        if (!accessToken) {
            router.replace("/login");
            return;
        }
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = {
                title,
                description,
                category,
                dynamicFieldValues: dynamicValues
            };
            const url = draftId ? `http://localhost:3000/api/drafts/${encodeURIComponent(draftId)}` : "http://localhost:3000/api/drafts";
            const method = draftId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>null);
                const msg = body?.error?.message || `Failed to save draft (${res.status})`;
                throw new Error(msg);
            }
            const saved = await res.json();
            setDraftId(saved.id);
            setSuccess("Draft saved.");
        } catch (err) {
            setError(err?.message ?? "Failed to save draft");
        } finally{
            setSaving(false);
        }
    };
    const handleSubmitNow = async ()=>{
        if (!accessToken) {
            router.replace("/login");
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            // If we have a draft, submit it; otherwise submit directly as idea.
            if (draftId) {
                const res = await fetch("http://localhost:3000/api/drafts/" + encodeURIComponent(draftId) + "/submit", {
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
            } else {
                const res = await fetch("http://localhost:3000/api/ideas", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        category
                    })
                });
                if (!res.ok) {
                    const body = await res.json().catch(()=>null);
                    const msg = body?.error || body?.error?.message || `Failed to submit idea (${res.status})`;
                    throw new Error(msg);
                }
            }
            setSuccess("Idea submitted successfully.");
            router.push("/welcome");
        } catch (err) {
            setError(err?.message ?? "Failed to submit idea");
        } finally{
            setSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "welcome-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "card",
            "aria-labelledby": "new-idea-heading",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: "0.75rem"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn secondary",
                        onClick: ()=>router.push("/welcome"),
                        children: "Back to home"
                    }, void 0, false, {
                        fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    id: "new-idea-heading",
                    children: "New Idea"
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                    lineNumber: 173,
                    columnNumber: 9
                }, this),
                loadingDraft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "Loading draft…"
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                    lineNumber: 174,
                    columnNumber: 26
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: (e)=>{
                        e.preventDefault();
                        void handleSubmitNow();
                    },
                    className: "idea-form",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "idea-form-field",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "title",
                                    children: "Title"
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: "title",
                                    name: "title",
                                    type: "text",
                                    value: title,
                                    onChange: (e)=>setTitle(e.target.value),
                                    required: true
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                            lineNumber: 182,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "idea-form-field",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "description",
                                    children: "Description"
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 195,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    id: "description",
                                    name: "description",
                                    value: description,
                                    onChange: (e)=>setDescription(e.target.value),
                                    required: true,
                                    rows: 4
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 196,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "idea-form-field",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "category",
                                    children: "Category"
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 207,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    id: "category",
                                    name: "category",
                                    value: category,
                                    onChange: (e)=>setCategory(e.target.value),
                                    required: true,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "process-improvement",
                                            children: "Process improvement"
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                            lineNumber: 215,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "new-product",
                                            children: "New product"
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                            lineNumber: 216,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "other",
                                            children: "Other"
                                        }, void 0, false, {
                                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                            lineNumber: 217,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 208,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                            lineNumber: 206,
                            columnNumber: 11
                        }, this),
                        fields.filter((f)=>f.name !== "title" && f.name !== "description").map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "idea-form-field",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: field.name,
                                        children: field.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                        lineNumber: 225,
                                        columnNumber: 17
                                    }, this),
                                    field.type === "textarea" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        id: field.name,
                                        name: field.name,
                                        required: field.required,
                                        value: String(dynamicValues[field.name] ?? ""),
                                        onChange: (e)=>handleDynamicChange(field, e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                        lineNumber: 227,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: field.name,
                                        name: field.name,
                                        type: field.type === "number" ? "number" : "text",
                                        required: field.required,
                                        value: String(dynamicValues[field.name] ?? ""),
                                        onChange: (e)=>handleDynamicChange(field, e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                        lineNumber: 235,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, field.name, true, {
                                fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                lineNumber: 224,
                                columnNumber: 15
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "idea-form-actions",
                            style: {
                                gap: "0.5rem",
                                display: "flex"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn secondary",
                                    disabled: saving,
                                    onClick: ()=>void handleSaveDraft(),
                                    children: saving ? "Saving draft…" : "Save draft"
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 248,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "btn",
                                    disabled: submitting,
                                    children: submitting ? "Submitting…" : "Submit now"
                                }, void 0, false, {
                                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                    lineNumber: 175,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    role: "alert",
                    style: {
                        color: "red",
                        marginTop: "0.5rem"
                    },
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                    lineNumber: 262,
                    columnNumber: 11
                }, this),
                success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    role: "status",
                    style: {
                        color: "green",
                        marginTop: "0.5rem"
                    },
                    children: success
                }, void 0, false, {
                    fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
                    lineNumber: 267,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
            lineNumber: 163,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/frontend/app/ideas/new/page.tsx",
        lineNumber: 162,
        columnNumber: 5
    }, this);
}
_s(NewIdeaPage, "8HYhL/KyKWtvWWSKbNzybbCO78Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = NewIdeaPage;
var _c;
__turbopack_context__.k.register(_c, "NewIdeaPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_frontend_ba68cab7._.js.map