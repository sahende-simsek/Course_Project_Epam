(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/welcome-admin/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WelcomeAdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function WelcomeAdminPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [displayName, setDisplayName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [accessToken, setAccessToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ideas, setIdeas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [allIdeas, setAllIdeas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingIdeas, setLoadingIdeas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [evaluationComment, setEvaluationComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [evaluationDecision, setEvaluationDecision] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [evaluatingId, setEvaluatingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savingDraftId, setSavingDraftId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reviewDrafts, setReviewDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingDrafts, setLoadingDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WelcomeAdminPage.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const token = window.localStorage.getItem("accessToken");
            if (!token) {
                router.replace("/login");
                return;
            }
            // Role guard: evaluator-only dashboard
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
                    if (payload?.role !== "EVALUATOR") {
                        router.replace("/welcome");
                        return;
                    }
                }
            } catch  {
                router.replace("/login");
                return;
            }
            // Derive admin/evaluator display name from current token (username or email)
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
                    const payloadUsername = payload?.username;
                    const payloadEmail = payload?.email;
                    const nameToUse = payloadUsername || payloadEmail || null;
                    setDisplayName(nameToUse);
                    if ("TURBOPACK compile-time truthy", 1) {
                        try {
                            if (payloadEmail) {
                                window.localStorage.setItem("userEmail", payloadEmail);
                            }
                            if (payloadUsername) {
                                window.localStorage.setItem("userName", payloadUsername);
                            } else {
                                window.localStorage.removeItem("userName");
                            }
                        } catch  {
                        // ignore storage errors
                        }
                    }
                }
            } catch  {
            // ignore decode errors
            }
            setAccessToken(token);
            void ({
                "WelcomeAdminPage.useEffect": async ()=>{
                    const [fetchedIdeas, fetchedDrafts] = await Promise.all([
                        fetchIdeas(token),
                        fetchReviewDrafts(token)
                    ]);
                    applyLists(fetchedIdeas, fetchedDrafts);
                }
            })["WelcomeAdminPage.useEffect"]();
        }
    }["WelcomeAdminPage.useEffect"], [
        router
    ]);
    // Fetch helpers that return data without setting state
    const fetchIdeas = async (token)=>{
        setLoadingIdeas(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3000/api/ideas", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                setError(`Failed to load ideas (${res.status}). Please try again later.`);
                return [];
            }
            return await res.json() || [];
        } catch (err) {
            setError(err?.message ?? "Failed to load ideas");
            return [];
        } finally{
            setLoadingIdeas(false);
        }
    };
    const fetchReviewDrafts = async (token)=>{
        setLoadingDrafts(true);
        try {
            const res = await fetch("http://localhost:3000/api/drafts", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return (data || []).filter((d)=>d.category === "review-draft");
        } catch  {
            return [];
        } finally{
            setLoadingDrafts(false);
        }
    };
    // Apply both lists together: enrich drafts with idea data, filter queue
    const applyLists = (fetchedIdeas, fetchedDrafts)=>{
        setAllIdeas(fetchedIdeas);
        const draftedIdeaIds = new Set(fetchedDrafts.map((d)=>d.dynamicFieldValues?.ideaId).filter(Boolean));
        setIdeas(fetchedIdeas.filter((i)=>!draftedIdeaIds.has(i.id)));
        const enriched = fetchedDrafts.map((d)=>({
                ...d,
                _idea: fetchedIdeas.find((i)=>i.id === d.dynamicFieldValues?.ideaId)
            }));
        setReviewDrafts(enriched);
    };
    const reloadAll = async ()=>{
        if (!accessToken) return;
        const [fetchedIdeas, fetchedDrafts] = await Promise.all([
            fetchIdeas(accessToken),
            fetchReviewDrafts(accessToken)
        ]);
        applyLists(fetchedIdeas, fetchedDrafts);
    };
    const handleEvaluate = async (ideaId)=>{
        if (!accessToken) {
            router.replace("/login");
            return;
        }
        const comment = evaluationComment[ideaId]?.trim();
        const decision = evaluationDecision[ideaId];
        if (!comment) {
            setError("Please enter a comment before submitting a decision.");
            return;
        }
        if (!decision) {
            setError("Please select Accept or Reject before submitting.");
            return;
        }
        setError(null);
        setSuccess(null);
        setEvaluatingId(ideaId);
        try {
            const res = await fetch("http://localhost:3000/api/evaluations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    ideaId,
                    decision,
                    comments: comment
                })
            });
            if (!res.ok) {
                const body = await res.json().catch(()=>null);
                throw new Error(body?.error?.message || `Failed to submit evaluation (${res.status})`);
            }
            const result = await res.json().catch(()=>null);
            setIdeas((prev)=>prev.map((idea)=>{
                    if (idea.id !== ideaId) return idea;
                    const existingEvaluations = idea.evaluations ?? [];
                    const nextEvaluations = result && result.evaluation ? [
                        ...existingEvaluations,
                        result.evaluation
                    ] : existingEvaluations;
                    return {
                        ...idea,
                        status: decision,
                        evaluations: nextEvaluations
                    };
                }));
            setEvaluationComment((prev)=>({
                    ...prev,
                    [ideaId]: ""
                }));
            setEvaluationDecision((prev)=>{
                const next = {
                    ...prev
                };
                delete next[ideaId];
                return next;
            });
            setSuccess(`Decision saved as ${decision.toLowerCase()}.`);
        } catch (err) {
            setError(err?.message ?? "Failed to submit evaluation");
        } finally{
            setEvaluatingId(null);
        }
    };
    const handleSaveReviewDraft = async (ideaId)=>{
        if (!accessToken) {
            router.replace("/login");
            return;
        }
        const comment = evaluationComment[ideaId]?.trim();
        const decision = evaluationDecision[ideaId];
        if (!comment) {
            setError("Please enter a comment before saving a draft.");
            return;
        }
        setError(null);
        setSuccess(null);
        setSavingDraftId(ideaId);
        try {
            // Check if a review draft for this idea already exists
            const existing = reviewDrafts.find((d)=>d.dynamicFieldValues?.ideaId === ideaId);
            const idea = ideas.find((i)=>i.id === ideaId);
            if (existing) {
                // Update the existing draft
                const res = await fetch(`http://localhost:3000/api/drafts/${encodeURIComponent(existing.id)}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        title: existing.title,
                        description: comment,
                        category: "review-draft",
                        dynamicFieldValues: {
                            ideaId,
                            decision: decision ?? existing.dynamicFieldValues?.decision ?? "",
                            ideaTitle: idea?.title ?? ""
                        }
                    })
                });
                if (!res.ok) {
                    const body = await res.json().catch(()=>null);
                    throw new Error(body?.error?.message || `Failed to update review draft (${res.status})`);
                }
            } else {
                // Create a new draft
                const res = await fetch("http://localhost:3000/api/drafts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        title: `review-draft:${ideaId}`,
                        description: comment,
                        category: "review-draft",
                        dynamicFieldValues: {
                            ideaId,
                            decision: decision ?? "",
                            ideaTitle: idea?.title ?? ""
                        }
                    })
                });
                if (!res.ok) {
                    const body = await res.json().catch(()=>null);
                    throw new Error(body?.error?.message || `Failed to save review draft (${res.status})`);
                }
            }
            // Reload everything — idea disappears from queue, appears in drafts
            await reloadAll();
            setSuccess("Review draft saved.");
        } catch (err) {
            setError(err?.message ?? "Failed to save review draft");
        } finally{
            setSavingDraftId(null);
        }
    };
    const renderStatus = (status)=>{
        switch(status){
            case "ACCEPTED":
                return "Accepted";
            case "REJECTED":
                return "Rejected";
            case "UNDER_REVIEW":
                return "Under review";
            case "SUBMITTED":
            default:
                return "Submitted";
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "welcome-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "welcome-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: [
                            "Admin / Evaluator Dashboard",
                            displayName ? `, ${displayName}` : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 308,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "You are signed in with evaluator privileges and can review ideas."
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 309,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/welcome-admin/page.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card",
                "aria-labelledby": "idea-review-heading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: "idea-review-heading",
                        children: "Idea review queue"
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "alert",
                        style: {
                            color: "red",
                            marginBottom: "0.5rem"
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 315,
                        columnNumber: 11
                    }, this),
                    success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "status",
                        style: {
                            color: "green",
                            marginBottom: "0.5rem"
                        },
                        children: success
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 320,
                        columnNumber: 11
                    }, this),
                    loadingIdeas ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading ideas..."
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 325,
                        columnNumber: 11
                    }, this) : ideas.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "There are no ideas to review yet."
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 327,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "idea-table",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "idea-table-header idea-table-header--admin",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Title & description"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 331,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 332,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 333,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Attachments"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 334,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Review & comment"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 335,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/welcome-admin/page.tsx",
                                lineNumber: 330,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "idea-list",
                                children: ideas.map((idea)=>{
                                    const latestComment = idea.evaluations && idea.evaluations.length > 0 ? idea.evaluations[idea.evaluations.length - 1].comments : null;
                                    const isFinal = idea.status === "ACCEPTED" || idea.status === "REJECTED";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "idea-item idea-item--admin",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        children: idea.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: idea.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 350,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 348,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: idea.category
                                                }, void 0, false, {
                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                    lineNumber: 353,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 352,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: renderStatus(idea.status)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                    lineNumber: 356,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 355,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: idea.attachments && idea.attachments.length > 0 ? idea.attachments.map((att)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: att.url,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            children: att.filename
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 362,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, att.id, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 361,
                                                        columnNumber: 27
                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                    lineNumber: 368,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 358,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: isFinal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                margin: 0
                                                            },
                                                            children: "Decision recorded."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 27
                                                        }, this),
                                                        latestComment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                margin: "0.25rem 0 0 0",
                                                                fontSize: "0.85rem",
                                                                color: "#6b7280"
                                                            },
                                                            children: [
                                                                "Admin comment: ",
                                                                latestComment
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "idea-form-field",
                                                            style: {
                                                                marginTop: "0.15rem"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: `comment-${idea.id}`,
                                                                    children: "Evaluation comment"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                                    lineNumber: 390,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                    id: `comment-${idea.id}`,
                                                                    value: evaluationComment[idea.id] ?? "",
                                                                    onChange: (e)=>setEvaluationComment((prev)=>({
                                                                                ...prev,
                                                                                [idea.id]: e.target.value
                                                                            })),
                                                                    rows: 3
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                                    lineNumber: 391,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 389,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                gap: "1rem",
                                                                marginTop: "0.4rem"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    style: {
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "0.3rem",
                                                                        cursor: "pointer"
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "radio",
                                                                            name: `decision-${idea.id}`,
                                                                            value: "ACCEPTED",
                                                                            checked: evaluationDecision[idea.id] === "ACCEPTED",
                                                                            onChange: ()=>setEvaluationDecision((prev)=>({
                                                                                        ...prev,
                                                                                        [idea.id]: "ACCEPTED"
                                                                                    }))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                                            lineNumber: 405,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        "Accept"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                                    lineNumber: 404,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    style: {
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "0.3rem",
                                                                        cursor: "pointer"
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "radio",
                                                                            name: `decision-${idea.id}`,
                                                                            value: "REJECTED",
                                                                            checked: evaluationDecision[idea.id] === "REJECTED",
                                                                            onChange: ()=>setEvaluationDecision((prev)=>({
                                                                                        ...prev,
                                                                                        [idea.id]: "REJECTED"
                                                                                    }))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                                            lineNumber: 417,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        "Reject"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                                    lineNumber: 416,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 403,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "idea-form-actions",
                                                            style: {
                                                                marginTop: "0.4rem"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "btn secondary",
                                                                    disabled: savingDraftId === idea.id,
                                                                    onClick: ()=>void handleSaveReviewDraft(idea.id),
                                                                    children: savingDraftId === idea.id ? "Saving draft..." : "Save as draft"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                                    lineNumber: 430,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "btn",
                                                                    disabled: evaluatingId === idea.id,
                                                                    onClick: ()=>void handleEvaluate(idea.id),
                                                                    children: evaluatingId === idea.id ? "Saving..." : "Submit"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                                    lineNumber: 438,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 429,
                                                            columnNumber: 27
                                                        }, this),
                                                        latestComment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                margin: "0.35rem 0 0 0",
                                                                fontSize: "0.85rem",
                                                                color: "#6b7280"
                                                            },
                                                            children: [
                                                                "Admin comment: ",
                                                                latestComment
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 448,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 371,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, idea.id, true, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 347,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/welcome-admin/page.tsx",
                                lineNumber: 337,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 329,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/welcome-admin/page.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "card",
                "aria-labelledby": "review-drafts-heading",
                style: {
                    marginTop: "1.5rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: "review-drafts-heading",
                        children: "My review drafts"
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 470,
                        columnNumber: 9
                    }, this),
                    loadingDrafts ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading review drafts…"
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 472,
                        columnNumber: 11
                    }, this) : reviewDrafts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "No saved review drafts."
                    }, void 0, false, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 474,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "idea-table",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "idea-table-header idea-table-header--admin",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Title & description"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 478,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 479,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 480,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Attachments"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 481,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Draft comment & decision"
                                    }, void 0, false, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 482,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/welcome-admin/page.tsx",
                                lineNumber: 477,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "idea-list",
                                children: reviewDrafts.map((rd)=>{
                                    const idea = rd._idea;
                                    const decisionLabel = rd.dynamicFieldValues?.decision === "ACCEPTED" ? "Accept" : rd.dynamicFieldValues?.decision === "REJECTED" ? "Reject" : "No decision yet";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "idea-item idea-item--admin",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        children: idea?.title ?? rd.dynamicFieldValues?.ideaTitle ?? "Unknown idea"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 496,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: idea?.description ?? "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 497,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 495,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: idea?.category ?? "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                    lineNumber: 500,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 499,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: renderStatus(idea?.status)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                    lineNumber: 503,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 502,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: idea?.attachments && idea.attachments.length > 0 ? idea.attachments.map((att)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: att.url,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            children: att.filename
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 509,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, att.id, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 508,
                                                        columnNumber: 27
                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/welcome-admin/page.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 505,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: "0.85rem",
                                                            color: "#374151"
                                                        },
                                                        children: [
                                                            rd.description?.slice(0, 150),
                                                            rd.description && rd.description.length > 150 ? "…" : ""
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 519,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                        style: {
                                                            color: "#6b7280"
                                                        },
                                                        children: [
                                                            "Decision: ",
                                                            decisionLabel
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 522,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: "0.5rem"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "btn secondary",
                                                            onClick: ()=>router.push(`/welcome-admin/draft/${encodeURIComponent(rd.id)}`),
                                                            children: "Edit draft"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/welcome-admin/page.tsx",
                                                            lineNumber: 524,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                                        lineNumber: 523,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/welcome-admin/page.tsx",
                                                lineNumber: 518,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, rd.id, true, {
                                        fileName: "[project]/app/welcome-admin/page.tsx",
                                        lineNumber: 494,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/welcome-admin/page.tsx",
                                lineNumber: 484,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/welcome-admin/page.tsx",
                        lineNumber: 476,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/welcome-admin/page.tsx",
                lineNumber: 469,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/welcome-admin/page.tsx",
        lineNumber: 306,
        columnNumber: 5
    }, this);
}
_s(WelcomeAdminPage, "uGz7RXc6VL9+E1zldp7mA5kIHBQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = WelcomeAdminPage;
var _c;
__turbopack_context__.k.register(_c, "WelcomeAdminPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_welcome-admin_page_tsx_bd215267._.js.map