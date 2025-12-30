/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/check-usage/route";
exports.ids = ["app/api/check-usage/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-usage%2Froute&page=%2Fapi%2Fcheck-usage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-usage%2Froute.ts&appDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-usage%2Froute&page=%2Fapi%2Fcheck-usage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-usage%2Froute.ts&appDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_raphaellassalle_Desktop_Studly_code_backup_app_api_check_usage_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/check-usage/route.ts */ \"(rsc)/./app/api/check-usage/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/check-usage/route\",\n        pathname: \"/api/check-usage\",\n        filename: \"route\",\n        bundlePath: \"app/api/check-usage/route\"\n    },\n    resolvedPagePath: \"/Users/raphaellassalle/Desktop/Studly code backup/app/api/check-usage/route.ts\",\n    nextConfigOutput,\n    userland: _Users_raphaellassalle_Desktop_Studly_code_backup_app_api_check_usage_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjaGVjay11c2FnZSUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY2hlY2stdXNhZ2UlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjaGVjay11c2FnZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnJhcGhhZWxsYXNzYWxsZSUyRkRlc2t0b3AlMkZTdHVkbHklMjBjb2RlJTIwYmFja3VwJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnJhcGhhZWxsYXNzYWxsZSUyRkRlc2t0b3AlMkZTdHVkbHklMjBjb2RlJTIwYmFja3VwJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUM4QjtBQUMzRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3JhcGhhZWxsYXNzYWxsZS9EZXNrdG9wL1N0dWRseSBjb2RlIGJhY2t1cC9hcHAvYXBpL2NoZWNrLXVzYWdlL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jaGVjay11c2FnZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NoZWNrLXVzYWdlXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jaGVjay11c2FnZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9yYXBoYWVsbGFzc2FsbGUvRGVza3RvcC9TdHVkbHkgY29kZSBiYWNrdXAvYXBwL2FwaS9jaGVjay11c2FnZS9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-usage%2Froute&page=%2Fapi%2Fcheck-usage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-usage%2Froute.ts&appDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/check-usage/route.ts":
/*!**************************************!*\
  !*** ./app/api/check-usage/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/ssr */ \"(rsc)/./node_modules/@supabase/ssr/dist/module/index.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\n\nconst PLAN_LIMITS = {\n    starter: 7,\n    pro: 18,\n    elite: 37,\n    basic: 7\n};\nasync function GET() {\n    try {\n        const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_2__.cookies)();\n        const supabase = (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_1__.createServerClient)(\"https://asangczipnnsctbpelhu.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYW5nY3ppcG5uc2N0YnBlbGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDk1NDMsImV4cCI6MjA4MDg4NTU0M30.u8NxdQeR9PdcZJoMRwu3JklhtDeE7jLM1ij2iPRaPNs\", {\n            cookies: {\n                get (name) {\n                    return cookieStore.get(name)?.value;\n                }\n            }\n        });\n        const { data: { session } } = await supabase.auth.getSession();\n        if (!session) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Unauthorized'\n            }, {\n                status: 401\n            });\n        }\n        // Get user's subscription plan\n        const { data: subscription } = await supabase.from('subscriptions').select('plan_name').eq('user_id', session.user.id).single();\n        const planName = subscription?.plan_name || 'starter';\n        const planLimit = PLAN_LIMITS[planName.toLowerCase()] || 7;\n        // Count recordings this month\n        const startOfMonth = new Date();\n        startOfMonth.setDate(1);\n        startOfMonth.setHours(0, 0, 0, 0);\n        const { count } = await supabase.from('recordings').select('*', {\n            count: 'exact',\n            head: true\n        }).eq('user_id', session.user.id).gte('created_at', startOfMonth.toISOString());\n        const used = count || 0;\n        const remaining = Math.max(0, planLimit - used);\n        const canRecord = used < planLimit;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            planName,\n            planLimit,\n            used,\n            remaining,\n            canRecord\n        });\n    } catch (error) {\n        console.error('Usage check error:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NoZWNrLXVzYWdlL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBMEM7QUFDUTtBQUNaO0FBRXRDLE1BQU1HLGNBQXNDO0lBQzFDQyxTQUFTO0lBQ1RDLEtBQUs7SUFDTEMsT0FBTztJQUNQQyxPQUFPO0FBQ1Q7QUFFTyxlQUFlQztJQUNwQixJQUFJO1FBQ0YsTUFBTUMsY0FBY1AscURBQU9BO1FBQzNCLE1BQU1RLFdBQVdULGlFQUFrQkEsQ0FDakNVLDBDQUFvQyxFQUNwQ0Esa05BQXlDLEVBQ3pDO1lBQ0VULFNBQVM7Z0JBQ1BhLEtBQUlDLElBQVk7b0JBQ2QsT0FBT1AsWUFBWU0sR0FBRyxDQUFDQyxPQUFPQztnQkFDaEM7WUFDRjtRQUNGO1FBR0YsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRSxFQUFFLEdBQUcsTUFBTVQsU0FBU1UsSUFBSSxDQUFDQyxVQUFVO1FBQzVELElBQUksQ0FBQ0YsU0FBUztZQUNaLE9BQU9uQixxREFBWUEsQ0FBQ3NCLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFlLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUNwRTtRQUVBLCtCQUErQjtRQUMvQixNQUFNLEVBQUVOLE1BQU1PLFlBQVksRUFBRSxHQUFHLE1BQU1mLFNBQ2xDZ0IsSUFBSSxDQUFDLGlCQUNMQyxNQUFNLENBQUMsYUFDUEMsRUFBRSxDQUFDLFdBQVdULFFBQVFVLElBQUksQ0FBQ0MsRUFBRSxFQUM3QkMsTUFBTTtRQUVULE1BQU1DLFdBQVdQLGNBQWNRLGFBQWE7UUFDNUMsTUFBTUMsWUFBWS9CLFdBQVcsQ0FBQzZCLFNBQVNHLFdBQVcsR0FBRyxJQUFJO1FBRXpELDhCQUE4QjtRQUM5QixNQUFNQyxlQUFlLElBQUlDO1FBQ3pCRCxhQUFhRSxPQUFPLENBQUM7UUFDckJGLGFBQWFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRztRQUUvQixNQUFNLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU05QixTQUNyQmdCLElBQUksQ0FBQyxjQUNMQyxNQUFNLENBQUMsS0FBSztZQUFFYSxPQUFPO1lBQVNDLE1BQU07UUFBSyxHQUN6Q2IsRUFBRSxDQUFDLFdBQVdULFFBQVFVLElBQUksQ0FBQ0MsRUFBRSxFQUM3QlksR0FBRyxDQUFDLGNBQWNOLGFBQWFPLFdBQVc7UUFFN0MsTUFBTUMsT0FBT0osU0FBUztRQUN0QixNQUFNSyxZQUFZQyxLQUFLQyxHQUFHLENBQUMsR0FBR2IsWUFBWVU7UUFDMUMsTUFBTUksWUFBWUosT0FBT1Y7UUFFekIsT0FBT2xDLHFEQUFZQSxDQUFDc0IsSUFBSSxDQUFDO1lBQ3ZCVTtZQUNBRTtZQUNBVTtZQUNBQztZQUNBRztRQUNGO0lBQ0YsRUFBRSxPQUFPekIsT0FBWTtRQUNuQjBCLFFBQVExQixLQUFLLENBQUMsc0JBQXNCQTtRQUNwQyxPQUFPdkIscURBQVlBLENBQUNzQixJQUFJLENBQUM7WUFBRUMsT0FBT0EsTUFBTTJCLE9BQU87UUFBQyxHQUFHO1lBQUUxQixRQUFRO1FBQUk7SUFDbkU7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3JhcGhhZWxsYXNzYWxsZS9EZXNrdG9wL1N0dWRseSBjb2RlIGJhY2t1cC9hcHAvYXBpL2NoZWNrLXVzYWdlL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0IHsgY3JlYXRlU2VydmVyQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3NzcidcbmltcG9ydCB7IGNvb2tpZXMgfSBmcm9tICduZXh0L2hlYWRlcnMnXG5cbmNvbnN0IFBMQU5fTElNSVRTOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge1xuICBzdGFydGVyOiA3LFxuICBwcm86IDE4LFxuICBlbGl0ZTogMzcsXG4gIGJhc2ljOiA3LFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnN0IGNvb2tpZVN0b3JlID0gY29va2llcygpXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVTZXJ2ZXJDbGllbnQoXG4gICAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwhLFxuICAgICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhLFxuICAgICAge1xuICAgICAgICBjb29raWVzOiB7XG4gICAgICAgICAgZ2V0KG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvb2tpZVN0b3JlLmdldChuYW1lKT8udmFsdWVcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIClcblxuICAgIGNvbnN0IHsgZGF0YTogeyBzZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpXG4gICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cblxuICAgIC8vIEdldCB1c2VyJ3Mgc3Vic2NyaXB0aW9uIHBsYW5cbiAgICBjb25zdCB7IGRhdGE6IHN1YnNjcmlwdGlvbiB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdzdWJzY3JpcHRpb25zJylcbiAgICAgIC5zZWxlY3QoJ3BsYW5fbmFtZScpXG4gICAgICAuZXEoJ3VzZXJfaWQnLCBzZXNzaW9uLnVzZXIuaWQpXG4gICAgICAuc2luZ2xlKClcblxuICAgIGNvbnN0IHBsYW5OYW1lID0gc3Vic2NyaXB0aW9uPy5wbGFuX25hbWUgfHwgJ3N0YXJ0ZXInXG4gICAgY29uc3QgcGxhbkxpbWl0ID0gUExBTl9MSU1JVFNbcGxhbk5hbWUudG9Mb3dlckNhc2UoKV0gfHwgN1xuXG4gICAgLy8gQ291bnQgcmVjb3JkaW5ncyB0aGlzIG1vbnRoXG4gICAgY29uc3Qgc3RhcnRPZk1vbnRoID0gbmV3IERhdGUoKVxuICAgIHN0YXJ0T2ZNb250aC5zZXREYXRlKDEpXG4gICAgc3RhcnRPZk1vbnRoLnNldEhvdXJzKDAsIDAsIDAsIDApXG5cbiAgICBjb25zdCB7IGNvdW50IH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ3JlY29yZGluZ3MnKVxuICAgICAgLnNlbGVjdCgnKicsIHsgY291bnQ6ICdleGFjdCcsIGhlYWQ6IHRydWUgfSlcbiAgICAgIC5lcSgndXNlcl9pZCcsIHNlc3Npb24udXNlci5pZClcbiAgICAgIC5ndGUoJ2NyZWF0ZWRfYXQnLCBzdGFydE9mTW9udGgudG9JU09TdHJpbmcoKSlcblxuICAgIGNvbnN0IHVzZWQgPSBjb3VudCB8fCAwXG4gICAgY29uc3QgcmVtYWluaW5nID0gTWF0aC5tYXgoMCwgcGxhbkxpbWl0IC0gdXNlZClcbiAgICBjb25zdCBjYW5SZWNvcmQgPSB1c2VkIDwgcGxhbkxpbWl0XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgcGxhbk5hbWUsXG4gICAgICBwbGFuTGltaXQsXG4gICAgICB1c2VkLFxuICAgICAgcmVtYWluaW5nLFxuICAgICAgY2FuUmVjb3JkLFxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVc2FnZSBjaGVjayBlcnJvcjonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9LCB7IHN0YXR1czogNTAwIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJjcmVhdGVTZXJ2ZXJDbGllbnQiLCJjb29raWVzIiwiUExBTl9MSU1JVFMiLCJzdGFydGVyIiwicHJvIiwiZWxpdGUiLCJiYXNpYyIsIkdFVCIsImNvb2tpZVN0b3JlIiwic3VwYWJhc2UiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJnZXQiLCJuYW1lIiwidmFsdWUiLCJkYXRhIiwic2Vzc2lvbiIsImF1dGgiLCJnZXRTZXNzaW9uIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwic3Vic2NyaXB0aW9uIiwiZnJvbSIsInNlbGVjdCIsImVxIiwidXNlciIsImlkIiwic2luZ2xlIiwicGxhbk5hbWUiLCJwbGFuX25hbWUiLCJwbGFuTGltaXQiLCJ0b0xvd2VyQ2FzZSIsInN0YXJ0T2ZNb250aCIsIkRhdGUiLCJzZXREYXRlIiwic2V0SG91cnMiLCJjb3VudCIsImhlYWQiLCJndGUiLCJ0b0lTT1N0cmluZyIsInVzZWQiLCJyZW1haW5pbmciLCJNYXRoIiwibWF4IiwiY2FuUmVjb3JkIiwiY29uc29sZSIsIm1lc3NhZ2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/check-usage/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tslib","vendor-chunks/iceberg-js","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheck-usage%2Froute&page=%2Fapi%2Fcheck-usage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheck-usage%2Froute.ts&appDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fraphaellassalle%2FDesktop%2FStudly%20code%20backup&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();