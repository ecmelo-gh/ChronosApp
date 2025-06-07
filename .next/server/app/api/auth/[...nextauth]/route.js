"use strict";
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
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist\\client\\components\\action-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist\\client\\components\\request-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!*********************************************************************************************!*\
  !*** external "next/dist\\client\\components\\static-generation-async-storage.external.js" ***!
  \*********************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\static-generation-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CProjects%5Cwindsurf%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CProjects%5Cwindsurf&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CProjects%5Cwindsurf%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CProjects%5Cwindsurf&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Projects_windsurf_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Projects\\\\windsurf\\\\src\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Projects_windsurf_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDUHJvamVjdHMlNUN3aW5kc3VyZiU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1Byb2plY3RzJTVDd2luZHN1cmYmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9c3RhbmRhbG9uZSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ29CO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsdUdBQXVHO0FBQy9HO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDNko7O0FBRTdKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJvamVjdC8/OTI0ZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxQcm9qZWN0c1xcXFx3aW5kc3VyZlxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXFsuLi5uZXh0YXV0aF1cXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwic3RhbmRhbG9uZVwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFByb2plY3RzXFxcXHdpbmRzdXJmXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcWy4uLm5leHRhdXRoXVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CProjects%5Cwindsurf%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CProjects%5Cwindsurf&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBZ0M7QUFDUTtBQUV4QyxNQUFNRSxVQUFVRixnREFBUUEsQ0FBQ0Msa0RBQVdBO0FBRU0iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcm9qZWN0Ly4vc3JjL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzPzAwOTgiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoIGZyb20gJ25leHQtYXV0aCdcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJ1xyXG5cclxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKVxyXG5cclxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9Il0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _auth_2fa__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth/2fa */ \"(rsc)/./src/lib/auth/2fa.ts\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! crypto */ \"crypto\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_prisma__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                },\n                code: {\n                    label: \"2FA Code\",\n                    type: \"text\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                const user = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.users.findUnique({\n                    where: {\n                        email: credentials.email\n                    },\n                    include: {\n                        user_2fa: true\n                    }\n                });\n                if (!user || !user.password) {\n                    return null;\n                }\n                const isValidPassword = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_3__.compare)(credentials.password, user.password);\n                if (!isValidPassword) {\n                    await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.audit_logs.create({\n                        data: {\n                            id: crypto__WEBPACK_IMPORTED_MODULE_6___default().randomUUID(),\n                            userId: user.id,\n                            eventType: _prisma_client__WEBPACK_IMPORTED_MODULE_4__.AuthEventType.AUTH_LOGIN_FAILURE,\n                            metadata: {\n                                type: _prisma_client__WEBPACK_IMPORTED_MODULE_4__.AuthEventType.AUTH_LOGIN_FAILURE,\n                                attempts: 1,\n                                threshold: 5\n                            },\n                            action: _prisma_client__WEBPACK_IMPORTED_MODULE_4__.AuthEventType.AUTH_LOGIN_FAILURE,\n                            resourceId: user.id\n                        }\n                    });\n                    return null;\n                }\n                if (user.user_2fa?.enabled && !user.user_2fa?.verified) {\n                    if (!credentials.code) {\n                        return null;\n                    }\n                    const isValidToken = _auth_2fa__WEBPACK_IMPORTED_MODULE_5__.TwoFactorAuth.verifyToken(user.user_2fa.secret, credentials.code);\n                    if (!isValidToken) {\n                        await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.audit_logs.create({\n                            data: {\n                                id: crypto__WEBPACK_IMPORTED_MODULE_6___default().randomUUID(),\n                                userId: user.id,\n                                eventType: _prisma_client__WEBPACK_IMPORTED_MODULE_4__.AuthEventType.AUTH_2FA_FAILURE,\n                                action: _prisma_client__WEBPACK_IMPORTED_MODULE_4__.AuthEventType.AUTH_2FA_FAILURE,\n                                resourceId: user.id,\n                                metadata: {\n                                    type: _prisma_client__WEBPACK_IMPORTED_MODULE_4__.AuthEventType.AUTH_2FA_FAILURE,\n                                    attempts: 1,\n                                    threshold: 5\n                                }\n                            }\n                        });\n                        return null;\n                    }\n                }\n                const userToReturn = {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email,\n                    emailVerified: user.emailVerified,\n                    image: user.image,\n                    password: user.password,\n                    user_2fa: user.user_2fa || null,\n                    encrypted_password: user.encrypted_password,\n                    raw_user_meta_data: user.raw_user_meta_data,\n                    requiresVerification: user.requiresVerification\n                };\n                return userToReturn;\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user && \"id\" in user) {\n                const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.users.findUnique({\n                    where: {\n                        id: user.id\n                    },\n                    include: {\n                        user_2fa: true\n                    }\n                });\n                if (dbUser) {\n                    token.id = dbUser.id;\n                    token.has2fa = !!dbUser.user_2fa?.enabled;\n                    token.is2faVerified = !!dbUser.user_2fa?.verified;\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (!session?.user) return session;\n            const dbUser = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.users.findUnique({\n                where: {\n                    id: token.id\n                },\n                include: {\n                    user_2fa: true\n                }\n            });\n            if (!dbUser) return session;\n            session.user = {\n                id: dbUser.id,\n                name: dbUser.name,\n                email: dbUser.email,\n                image: dbUser.image,\n                has2fa: !!dbUser.user_2fa?.enabled,\n                is2faVerified: !!dbUser.user_2fa?.verified\n            };\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/auth/login\",\n        error: \"/auth/error\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q2JsQixNQUFNMkMsT0FBTzNDLElBQUk7Z0JBQ2pCRSxPQUFPeUMsT0FBT3pDLEtBQUs7Z0JBQ25Ca0MsT0FBT08sT0FBT1AsS0FBSztnQkFDbkJRLFFBQVEsQ0FBQyxDQUFDRCxPQUFPOUIsUUFBUSxFQUFFZTtnQkFDM0JpQixlQUFlLENBQUMsQ0FBQ0YsT0FBTzlCLFFBQVEsRUFBRWdCO1lBQ3BDO1lBRUEsT0FBT2pDO1FBQ1Q7SUFDRjtJQUNBa0QsT0FBTztRQUNMQyxRQUFRO1FBQ1JDLE9BQU87SUFDVDtBQUNGLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcm9qZWN0Ly4vc3JjL2xpYi9hdXRoLnRzPzY2OTIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQWRhcHRlciB9IGZyb20gXCJAbmV4dC1hdXRoL3ByaXNtYS1hZGFwdGVyXCJcbmltcG9ydCB7IE5leHRBdXRoT3B0aW9ucywgU2Vzc2lvbiwgVXNlciB9IGZyb20gXCJuZXh0LWF1dGhcIlxuaW1wb3J0IHsgSldUIH0gZnJvbSBcIm5leHQtYXV0aC9qd3RcIlxuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIlxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIi4vcHJpc21hXCJcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tIFwiYmNyeXB0anNcIlxuaW1wb3J0IHsgQXV0aEV2ZW50VHlwZSwgUHJpc21hLCB1c2VycyB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiXG5pbXBvcnQgeyBUd29GYWN0b3JBdXRoIGFzIFR3b0ZhY3RvckF1dGhVdGlsIH0gZnJvbSBcIi4vYXV0aC8yZmFcIlxuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvXCJcblxuZXhwb3J0IHR5cGUgVXNlcldpdGhUd29GYWN0b3IgPSB1c2VycyAmIHtcbiAgdXNlcl8yZmE/OiB7XG4gICAgaWQ6IHN0cmluZ1xuICAgIHVzZXJJZDogc3RyaW5nXG4gICAgc2VjcmV0OiBzdHJpbmdcbiAgICBiYWNrdXBDb2Rlczogc3RyaW5nW11cbiAgICBlbmFibGVkOiBib29sZWFuXG4gICAgdmVyaWZpZWQ6IGJvb2xlYW5cbiAgICByZWNvdmVyeUVtYWlsOiBzdHJpbmcgfCBudWxsXG4gICAgbGFzdFVzZWQ6IERhdGUgfCBudWxsXG4gICAgY3JlYXRlZF9hdDogRGF0ZVxuICAgIHVwZGF0ZWRfYXQ6IERhdGVcbiAgfSB8IG51bGxcbn1cblxuZGVjbGFyZSBtb2R1bGUgJ25leHQtYXV0aCcge1xuICBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgdXNlcjoge1xuICAgICAgaWQ6IHN0cmluZ1xuICAgICAgbmFtZT86IHN0cmluZyB8IG51bGxcbiAgICAgIGVtYWlsPzogc3RyaW5nIHwgbnVsbFxuICAgICAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsXG4gICAgICBoYXMyZmE/OiBib29sZWFuXG4gICAgICBpczJmYVZlcmlmaWVkPzogYm9vbGVhblxuICAgIH1cbiAgfVxuXG4gIGludGVyZmFjZSBVc2VyIHtcbiAgICBpZDogc3RyaW5nXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbFxuICAgIGVtYWlsOiBzdHJpbmcgfCBudWxsXG4gICAgZW1haWxWZXJpZmllZDogRGF0ZSB8IG51bGxcbiAgICBpbWFnZTogc3RyaW5nIHwgbnVsbFxuICAgIHBhc3N3b3JkOiBzdHJpbmdcbiAgICB1c2VyXzJmYToge1xuICAgICAgaWQ6IHN0cmluZ1xuICAgICAgdXNlcklkOiBzdHJpbmdcbiAgICAgIHNlY3JldDogc3RyaW5nXG4gICAgICBiYWNrdXBDb2Rlczogc3RyaW5nW11cbiAgICAgIGVuYWJsZWQ6IGJvb2xlYW5cbiAgICAgIHZlcmlmaWVkOiBib29sZWFuXG4gICAgICByZWNvdmVyeUVtYWlsOiBzdHJpbmcgfCBudWxsXG4gICAgICBsYXN0VXNlZDogRGF0ZSB8IG51bGxcbiAgICAgIGNyZWF0ZWRfYXQ6IERhdGVcbiAgICAgIHVwZGF0ZWRfYXQ6IERhdGVcbiAgICB9IHwgbnVsbFxuICAgIGVuY3J5cHRlZF9wYXNzd29yZDogc3RyaW5nXG4gICAgcmF3X3VzZXJfbWV0YV9kYXRhOiBQcmlzbWEuSnNvblZhbHVlXG4gICAgcmVxdWlyZXNWZXJpZmljYXRpb246IGJvb2xlYW5cbiAgfVxuXG4gIGludGVyZmFjZSBKV1Qge1xuICAgIGlkOiBzdHJpbmdcbiAgICBoYXMyZmE/OiBib29sZWFuXG4gICAgaXMyZmFWZXJpZmllZD86IGJvb2xlYW5cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgYWRhcHRlcjogUHJpc21hQWRhcHRlcihwcmlzbWEpLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6ICdqd3QnLFxuICAgIG1heEFnZTogMzAgKiAyNCAqIDYwICogNjAsIC8vIDMwIGRheXNcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiAnY3JlZGVudGlhbHMnLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6ICdFbWFpbCcsIHR5cGU6ICdlbWFpbCcgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6ICdQYXNzd29yZCcsIHR5cGU6ICdwYXNzd29yZCcgfSxcbiAgICAgICAgY29kZTogeyBsYWJlbDogJzJGQSBDb2RlJywgdHlwZTogJ3RleHQnIH1cbiAgICAgIH0sXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHM6IFJlY29yZDwnZW1haWwnIHwgJ3Bhc3N3b3JkJyB8ICdjb2RlJywgc3RyaW5nPiB8IHVuZGVmaW5lZCk6IFByb21pc2U8VXNlciB8IG51bGw+IHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXJzLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9LFxuICAgICAgICAgIGluY2x1ZGU6IHsgdXNlcl8yZmE6IHRydWUgfVxuICAgICAgICB9KSBhcyBVc2VyV2l0aFR3b0ZhY3RvciB8IG51bGxcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNWYWxpZFBhc3N3b3JkID0gYXdhaXQgY29tcGFyZShjcmVkZW50aWFscy5wYXNzd29yZCwgdXNlci5wYXNzd29yZClcblxuICAgICAgICBpZiAoIWlzVmFsaWRQYXNzd29yZCkge1xuICAgICAgICAgIGF3YWl0IHByaXNtYS5hdWRpdF9sb2dzLmNyZWF0ZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICB1c2VySWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICAgIGV2ZW50VHlwZTogQXV0aEV2ZW50VHlwZS5BVVRIX0xPR0lOX0ZBSUxVUkUsXG4gICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogQXV0aEV2ZW50VHlwZS5BVVRIX0xPR0lOX0ZBSUxVUkUsXG4gICAgICAgICAgICAgICAgYXR0ZW1wdHM6IDEsXG4gICAgICAgICAgICAgICAgdGhyZXNob2xkOiA1XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGFjdGlvbjogQXV0aEV2ZW50VHlwZS5BVVRIX0xPR0lOX0ZBSUxVUkUsXG4gICAgICAgICAgICAgIHJlc291cmNlSWQ6IHVzZXIuaWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXNlci51c2VyXzJmYT8uZW5hYmxlZCAmJiAhdXNlci51c2VyXzJmYT8udmVyaWZpZWQpIHtcbiAgICAgICAgICBpZiAoIWNyZWRlbnRpYWxzLmNvZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaXNWYWxpZFRva2VuID0gVHdvRmFjdG9yQXV0aFV0aWwudmVyaWZ5VG9rZW4odXNlci51c2VyXzJmYS5zZWNyZXQsIGNyZWRlbnRpYWxzLmNvZGUpXG5cbiAgICAgICAgICBpZiAoIWlzVmFsaWRUb2tlbikge1xuICAgICAgICAgICAgYXdhaXQgcHJpc21hLmF1ZGl0X2xvZ3MuY3JlYXRlKHtcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6IEF1dGhFdmVudFR5cGUuQVVUSF8yRkFfRkFJTFVSRSxcbiAgICAgICAgICAgICAgICBhY3Rpb246IEF1dGhFdmVudFR5cGUuQVVUSF8yRkFfRkFJTFVSRSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZUlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICB0eXBlOiBBdXRoRXZlbnRUeXBlLkFVVEhfMkZBX0ZBSUxVUkUsXG4gICAgICAgICAgICAgICAgICBhdHRlbXB0czogMSxcbiAgICAgICAgICAgICAgICAgIHRocmVzaG9sZDogNVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlclRvUmV0dXJuOiBVc2VyID0ge1xuICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBlbWFpbFZlcmlmaWVkOiB1c2VyLmVtYWlsVmVyaWZpZWQsXG4gICAgICAgICAgaW1hZ2U6IHVzZXIuaW1hZ2UsXG4gICAgICAgICAgcGFzc3dvcmQ6IHVzZXIucGFzc3dvcmQsXG4gICAgICAgICAgdXNlcl8yZmE6IHVzZXIudXNlcl8yZmEgfHwgbnVsbCxcbiAgICAgICAgICBlbmNyeXB0ZWRfcGFzc3dvcmQ6IHVzZXIuZW5jcnlwdGVkX3Bhc3N3b3JkLFxuICAgICAgICAgIHJhd191c2VyX21ldGFfZGF0YTogdXNlci5yYXdfdXNlcl9tZXRhX2RhdGEsXG4gICAgICAgICAgcmVxdWlyZXNWZXJpZmljYXRpb246IHVzZXIucmVxdWlyZXNWZXJpZmljYXRpb25cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXNlclRvUmV0dXJuXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgY2FsbGJhY2tzOiB7XG4gICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIgfSkge1xuICAgICAgaWYgKHVzZXIgJiYgJ2lkJyBpbiB1c2VyKSB7XG4gICAgICAgIGNvbnN0IGRiVXNlciA9IGF3YWl0IHByaXNtYS51c2Vycy5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogdXNlci5pZCB9LFxuICAgICAgICAgIGluY2x1ZGU6IHsgdXNlcl8yZmE6IHRydWUgfVxuICAgICAgICB9KSBhcyBVc2VyV2l0aFR3b0ZhY3RvciB8IG51bGxcblxuICAgICAgICBpZiAoZGJVc2VyKSB7XG4gICAgICAgICAgdG9rZW4uaWQgPSBkYlVzZXIuaWRcbiAgICAgICAgICB0b2tlbi5oYXMyZmEgPSAhIWRiVXNlci51c2VyXzJmYT8uZW5hYmxlZFxuICAgICAgICAgIHRva2VuLmlzMmZhVmVyaWZpZWQgPSAhIWRiVXNlci51c2VyXzJmYT8udmVyaWZpZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKCFzZXNzaW9uPy51c2VyKSByZXR1cm4gc2Vzc2lvblxuXG4gICAgICBjb25zdCBkYlVzZXIgPSBhd2FpdCBwcmlzbWEudXNlcnMuZmluZFVuaXF1ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiB0b2tlbi5pZCBhcyBzdHJpbmcgfSxcbiAgICAgICAgaW5jbHVkZTogeyB1c2VyXzJmYTogdHJ1ZSB9XG4gICAgICB9KVxuXG4gICAgICBpZiAoIWRiVXNlcikgcmV0dXJuIHNlc3Npb25cblxuICAgICAgc2Vzc2lvbi51c2VyID0ge1xuICAgICAgICBpZDogZGJVc2VyLmlkLFxuICAgICAgICBuYW1lOiBkYlVzZXIubmFtZSxcbiAgICAgICAgZW1haWw6IGRiVXNlci5lbWFpbCxcbiAgICAgICAgaW1hZ2U6IGRiVXNlci5pbWFnZSxcbiAgICAgICAgaGFzMmZhOiAhIWRiVXNlci51c2VyXzJmYT8uZW5hYmxlZCxcbiAgICAgICAgaXMyZmFWZXJpZmllZDogISFkYlVzZXIudXNlcl8yZmE/LnZlcmlmaWVkXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXNzaW9uXG4gICAgfVxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9hdXRoL2xvZ2luJyxcbiAgICBlcnJvcjogJy9hdXRoL2Vycm9yJ1xuICB9XG59XG4iXSwibmFtZXMiOlsiUHJpc21hQWRhcHRlciIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJwcmlzbWEiLCJjb21wYXJlIiwiQXV0aEV2ZW50VHlwZSIsIlR3b0ZhY3RvckF1dGgiLCJUd29GYWN0b3JBdXRoVXRpbCIsImNyeXB0byIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInNlc3Npb24iLCJzdHJhdGVneSIsIm1heEFnZSIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJjb2RlIiwiYXV0aG9yaXplIiwidXNlciIsInVzZXJzIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaW5jbHVkZSIsInVzZXJfMmZhIiwiaXNWYWxpZFBhc3N3b3JkIiwiYXVkaXRfbG9ncyIsImNyZWF0ZSIsImRhdGEiLCJpZCIsInJhbmRvbVVVSUQiLCJ1c2VySWQiLCJldmVudFR5cGUiLCJBVVRIX0xPR0lOX0ZBSUxVUkUiLCJtZXRhZGF0YSIsImF0dGVtcHRzIiwidGhyZXNob2xkIiwiYWN0aW9uIiwicmVzb3VyY2VJZCIsImVuYWJsZWQiLCJ2ZXJpZmllZCIsImlzVmFsaWRUb2tlbiIsInZlcmlmeVRva2VuIiwic2VjcmV0IiwiQVVUSF8yRkFfRkFJTFVSRSIsInVzZXJUb1JldHVybiIsImVtYWlsVmVyaWZpZWQiLCJpbWFnZSIsImVuY3J5cHRlZF9wYXNzd29yZCIsInJhd191c2VyX21ldGFfZGF0YSIsInJlcXVpcmVzVmVyaWZpY2F0aW9uIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJkYlVzZXIiLCJoYXMyZmEiLCJpczJmYVZlcmlmaWVkIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth/2fa.ts":
/*!*****************************!*\
  !*** ./src/lib/auth/2fa.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   TwoFactorAuth: () => (/* binding */ TwoFactorAuth)\n/* harmony export */ });\n/* harmony import */ var otplib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! otplib */ \"(rsc)/./node_modules/otplib/index.js\");\n/* harmony import */ var otplib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(otplib__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var qrcode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! qrcode */ \"(rsc)/./node_modules/qrcode/lib/index.js\");\n/* harmony import */ var _crypto__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../crypto */ \"(rsc)/./src/lib/crypto.ts\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! crypto */ \"crypto\");\n/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\n\nclass TwoFactorAuth {\n    // Gerar secret TOTP\n    static async generateSecret(userId) {\n        const secret = otplib__WEBPACK_IMPORTED_MODULE_0__.authenticator.generateSecret();\n        return (0,_crypto__WEBPACK_IMPORTED_MODULE_2__.encrypt)(secret) // Encriptar antes de salvar\n        ;\n    }\n    // Gerar backup codes\n    static generateBackupCodes() {\n        return Array.from({\n            length: 6\n        }, ()=>crypto__WEBPACK_IMPORTED_MODULE_3___default().randomBytes(4).toString(\"hex\"));\n    }\n    // Gerar QR code\n    static async generateQRCode(email, secret) {\n        const otpauth = otplib__WEBPACK_IMPORTED_MODULE_0__.authenticator.keyuri(email, \"Windsurf App\", (0,_crypto__WEBPACK_IMPORTED_MODULE_2__.decrypt)(secret));\n        return qrcode__WEBPACK_IMPORTED_MODULE_1__.toDataURL(otpauth);\n    }\n    // Verificar código TOTP\n    static verifyToken(token, secret) {\n        return otplib__WEBPACK_IMPORTED_MODULE_0__.authenticator.verify({\n            token,\n            secret: (0,_crypto__WEBPACK_IMPORTED_MODULE_2__.decrypt)(secret)\n        });\n    }\n    static hashCode(code) {\n        return (0,crypto__WEBPACK_IMPORTED_MODULE_3__.createHash)(\"sha256\").update(code).digest(\"hex\");\n    }\n    // Verificar backup code\n    static async verifyBackupCode(code, hashedCodes) {\n        const hashedInput = TwoFactorAuth.hashCode(code);\n        return hashedCodes.includes(hashedInput);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgvMmZhLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBc0M7QUFDWDtBQUMyQjtBQUMzQjtBQUVRO0FBRTVCLE1BQU1NO0lBQ1gsb0JBQW9CO0lBQ3BCLGFBQWFDLGVBQWVDLE1BQWMsRUFBbUI7UUFDM0QsTUFBTUMsU0FBU1QsaURBQWFBLENBQUNPLGNBQWM7UUFDM0MsT0FBT0wsZ0RBQU9BLENBQUNPLFFBQVEsNEJBQTRCOztJQUNyRDtJQUVBLHFCQUFxQjtJQUNyQixPQUFPQyxzQkFBZ0M7UUFDckMsT0FBT0MsTUFBTUMsSUFBSSxDQUFDO1lBQUVDLFFBQVE7UUFBRSxHQUFHLElBQy9CVCx5REFBa0IsQ0FBQyxHQUFHVyxRQUFRLENBQUM7SUFDbkM7SUFFQSxnQkFBZ0I7SUFDaEIsYUFBYUMsZUFBZUMsS0FBYSxFQUFFUixNQUFjLEVBQW1CO1FBQzFFLE1BQU1TLFVBQVVsQixpREFBYUEsQ0FBQ21CLE1BQU0sQ0FDbENGLE9BQ0EsZ0JBQ0FkLGdEQUFPQSxDQUFDTTtRQUVWLE9BQU9SLDZDQUFnQixDQUFDaUI7SUFDMUI7SUFFQSx3QkFBd0I7SUFDeEIsT0FBT0csWUFBWUMsS0FBYSxFQUFFYixNQUFjLEVBQVc7UUFDekQsT0FBT1QsaURBQWFBLENBQUN1QixNQUFNLENBQUM7WUFDMUJEO1lBQ0FiLFFBQVFOLGdEQUFPQSxDQUFDTTtRQUNsQjtJQUNGO0lBRUEsT0FBT2UsU0FBU0MsSUFBWSxFQUFVO1FBQ3BDLE9BQU9wQixrREFBVUEsQ0FBQyxVQUFVcUIsTUFBTSxDQUFDRCxNQUFNRSxNQUFNLENBQUM7SUFDbEQ7SUFFQSx3QkFBd0I7SUFDeEIsYUFBYUMsaUJBQWlCSCxJQUFZLEVBQUVJLFdBQXFCLEVBQW9CO1FBQ25GLE1BQU1DLGNBQWN4QixjQUFja0IsUUFBUSxDQUFDQztRQUMzQyxPQUFPSSxZQUFZRSxRQUFRLENBQUNEO0lBQzlCO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcm9qZWN0Ly4vc3JjL2xpYi9hdXRoLzJmYS50cz80YzcyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1dGhlbnRpY2F0b3IgfSBmcm9tICdvdHBsaWInXG5pbXBvcnQgUVJDb2RlIGZyb20gJ3FyY29kZSdcbmltcG9ydCB7IGVuY3J5cHQsIGRlY3J5cHQsIGhhc2hDb2RlIH0gZnJvbSAnLi4vY3J5cHRvJ1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nXG5cbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tICdjcnlwdG8nXG5cbmV4cG9ydCBjbGFzcyBUd29GYWN0b3JBdXRoIHtcbiAgLy8gR2VyYXIgc2VjcmV0IFRPVFBcbiAgc3RhdGljIGFzeW5jIGdlbmVyYXRlU2VjcmV0KHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzZWNyZXQgPSBhdXRoZW50aWNhdG9yLmdlbmVyYXRlU2VjcmV0KClcbiAgICByZXR1cm4gZW5jcnlwdChzZWNyZXQpIC8vIEVuY3JpcHRhciBhbnRlcyBkZSBzYWx2YXJcbiAgfVxuXG4gIC8vIEdlcmFyIGJhY2t1cCBjb2Rlc1xuICBzdGF0aWMgZ2VuZXJhdGVCYWNrdXBDb2RlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oeyBsZW5ndGg6IDYgfSwgKCkgPT4gXG4gICAgICBjcnlwdG8ucmFuZG9tQnl0ZXMoNCkudG9TdHJpbmcoJ2hleCcpKVxuICB9XG5cbiAgLy8gR2VyYXIgUVIgY29kZVxuICBzdGF0aWMgYXN5bmMgZ2VuZXJhdGVRUkNvZGUoZW1haWw6IHN0cmluZywgc2VjcmV0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IG90cGF1dGggPSBhdXRoZW50aWNhdG9yLmtleXVyaShcbiAgICAgIGVtYWlsLFxuICAgICAgJ1dpbmRzdXJmIEFwcCcsXG4gICAgICBkZWNyeXB0KHNlY3JldClcbiAgICApXG4gICAgcmV0dXJuIFFSQ29kZS50b0RhdGFVUkwob3RwYXV0aClcbiAgfVxuXG4gIC8vIFZlcmlmaWNhciBjw7NkaWdvIFRPVFBcbiAgc3RhdGljIHZlcmlmeVRva2VuKHRva2VuOiBzdHJpbmcsIHNlY3JldDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGF1dGhlbnRpY2F0b3IudmVyaWZ5KHtcbiAgICAgIHRva2VuLFxuICAgICAgc2VjcmV0OiBkZWNyeXB0KHNlY3JldClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGhhc2hDb2RlKGNvZGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShjb2RlKS5kaWdlc3QoJ2hleCcpXG4gIH1cblxuICAvLyBWZXJpZmljYXIgYmFja3VwIGNvZGVcbiAgc3RhdGljIGFzeW5jIHZlcmlmeUJhY2t1cENvZGUoY29kZTogc3RyaW5nLCBoYXNoZWRDb2Rlczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoYXNoZWRJbnB1dCA9IFR3b0ZhY3RvckF1dGguaGFzaENvZGUoY29kZSlcbiAgICByZXR1cm4gaGFzaGVkQ29kZXMuaW5jbHVkZXMoaGFzaGVkSW5wdXQpXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJhdXRoZW50aWNhdG9yIiwiUVJDb2RlIiwiZW5jcnlwdCIsImRlY3J5cHQiLCJjcnlwdG8iLCJjcmVhdGVIYXNoIiwiVHdvRmFjdG9yQXV0aCIsImdlbmVyYXRlU2VjcmV0IiwidXNlcklkIiwic2VjcmV0IiwiZ2VuZXJhdGVCYWNrdXBDb2RlcyIsIkFycmF5IiwiZnJvbSIsImxlbmd0aCIsInJhbmRvbUJ5dGVzIiwidG9TdHJpbmciLCJnZW5lcmF0ZVFSQ29kZSIsImVtYWlsIiwib3RwYXV0aCIsImtleXVyaSIsInRvRGF0YVVSTCIsInZlcmlmeVRva2VuIiwidG9rZW4iLCJ2ZXJpZnkiLCJoYXNoQ29kZSIsImNvZGUiLCJ1cGRhdGUiLCJkaWdlc3QiLCJ2ZXJpZnlCYWNrdXBDb2RlIiwiaGFzaGVkQ29kZXMiLCJoYXNoZWRJbnB1dCIsImluY2x1ZGVzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth/2fa.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/crypto.ts":
/*!***************************!*\
  !*** ./src/lib/crypto.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   decrypt: () => (/* binding */ decrypt),\n/* harmony export */   encrypt: () => (/* binding */ encrypt),\n/* harmony export */   hashCode: () => (/* binding */ hashCode)\n/* harmony export */ });\n/* harmony import */ var crypto_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto-js */ \"(rsc)/./node_modules/crypto-js/index.js\");\n/* harmony import */ var crypto_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto_js__WEBPACK_IMPORTED_MODULE_0__);\n\nconst SECRET_KEY = process.env.ENCRYPTION_KEY || \"your-secret-key-here\";\nfunction encrypt(text) {\n    return crypto_js__WEBPACK_IMPORTED_MODULE_0___default().AES.encrypt(text, SECRET_KEY).toString();\n}\nfunction decrypt(ciphertext) {\n    const bytes = crypto_js__WEBPACK_IMPORTED_MODULE_0___default().AES.decrypt(ciphertext, SECRET_KEY);\n    return bytes.toString((crypto_js__WEBPACK_IMPORTED_MODULE_0___default().enc).Utf8);\n}\nfunction hashCode(code) {\n    return crypto_js__WEBPACK_IMPORTED_MODULE_0___default().SHA256(code).toString();\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2NyeXB0by50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFnQztBQUVoQyxNQUFNQyxhQUFhQyxRQUFRQyxHQUFHLENBQUNDLGNBQWMsSUFBSTtBQUUxQyxTQUFTQyxRQUFRQyxJQUFZO0lBQ2xDLE9BQU9OLG9EQUFZLENBQUNLLE9BQU8sQ0FBQ0MsTUFBTUwsWUFBWU8sUUFBUTtBQUN4RDtBQUVPLFNBQVNDLFFBQVFDLFVBQWtCO0lBQ3hDLE1BQU1DLFFBQVFYLG9EQUFZLENBQUNTLE9BQU8sQ0FBQ0MsWUFBWVQ7SUFDL0MsT0FBT1UsTUFBTUgsUUFBUSxDQUFDUixzREFBWSxDQUFDYSxJQUFJO0FBQ3pDO0FBRU8sU0FBU0MsU0FBU0MsSUFBWTtJQUNuQyxPQUFPZix1REFBZSxDQUFDZSxNQUFNUCxRQUFRO0FBQ3ZDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJvamVjdC8uL3NyYy9saWIvY3J5cHRvLnRzPzUwYmYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENyeXB0b0pTIGZyb20gJ2NyeXB0by1qcydcblxuY29uc3QgU0VDUkVUX0tFWSA9IHByb2Nlc3MuZW52LkVOQ1JZUFRJT05fS0VZIHx8ICd5b3VyLXNlY3JldC1rZXktaGVyZSdcblxuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHQodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIENyeXB0b0pTLkFFUy5lbmNyeXB0KHRleHQsIFNFQ1JFVF9LRVkpLnRvU3RyaW5nKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY3J5cHQoY2lwaGVydGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZXMgPSBDcnlwdG9KUy5BRVMuZGVjcnlwdChjaXBoZXJ0ZXh0LCBTRUNSRVRfS0VZKVxuICByZXR1cm4gYnl0ZXMudG9TdHJpbmcoQ3J5cHRvSlMuZW5jLlV0ZjgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNoQ29kZShjb2RlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gQ3J5cHRvSlMuU0hBMjU2KGNvZGUpLnRvU3RyaW5nKClcbn1cbiJdLCJuYW1lcyI6WyJDcnlwdG9KUyIsIlNFQ1JFVF9LRVkiLCJwcm9jZXNzIiwiZW52IiwiRU5DUllQVElPTl9LRVkiLCJlbmNyeXB0IiwidGV4dCIsIkFFUyIsInRvU3RyaW5nIiwiZGVjcnlwdCIsImNpcGhlcnRleHQiLCJieXRlcyIsImVuYyIsIlV0ZjgiLCJoYXNoQ29kZSIsImNvZGUiLCJTSEEyNTYiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/crypto.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"query\"\n    ]\n});\nif (true) global.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFRdEMsTUFBTUMsU0FDWEMsT0FBT0QsTUFBTSxJQUNiLElBQUlELHdEQUFZQSxDQUFDO0lBQ2ZHLEtBQUs7UUFBQztLQUFRO0FBQ2hCLEdBQUU7QUFFSixJQUFJQyxJQUF5QixFQUFjRixPQUFPRCxNQUFNLEdBQUdBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJvamVjdC8uL3NyYy9saWIvcHJpc21hLnRzPzAxZDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgLy8gYWxsb3cgZ2xvYmFsIGB2YXJgIGRlY2xhcmF0aW9uc1xyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12YXJcclxuICB2YXIgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHByaXNtYSA9XHJcbiAgZ2xvYmFsLnByaXNtYSB8fFxyXG4gIG5ldyBQcmlzbWFDbGllbnQoe1xyXG4gICAgbG9nOiBbJ3F1ZXJ5J10sXHJcbiAgfSlcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWwucHJpc21hID0gcHJpc21hXHJcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJsb2ciLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/crypto-js","vendor-chunks/qrcode","vendor-chunks/openid-client","vendor-chunks/pngjs","vendor-chunks/oauth","vendor-chunks/@otplib","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/thirty-two","vendor-chunks/preact-render-to-string","vendor-chunks/oidc-token-hash","vendor-chunks/bcryptjs","vendor-chunks/preact","vendor-chunks/otplib","vendor-chunks/object-hash","vendor-chunks/lru-cache","vendor-chunks/dijkstrajs","vendor-chunks/cookie","vendor-chunks/@next-auth"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CProjects%5Cwindsurf%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CProjects%5Cwindsurf&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();