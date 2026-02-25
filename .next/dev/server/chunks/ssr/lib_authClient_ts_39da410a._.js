module.exports = [
"[project]/lib/authClient.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/lib_authClient_ts_da484c50._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/authClient.ts [app-ssr] (ecmascript)");
    });
});
}),
];