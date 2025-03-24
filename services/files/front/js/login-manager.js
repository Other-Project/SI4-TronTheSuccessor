import {changePage} from "../components/pages/pages.js";

export function getCookie(name) {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
}

export async function renewAccessToken() {
    const response = await fetch("/api/user/renew-access-token", {
        headers: {
            "Authorization": `Bearer ${getCookie("refreshToken")}`
        }
    });
    const data = await response.json();
    storeTokens(data);
}

export function disconnect() {
    document.cookie = "accessToken=; path=/; max-age=0;";
    document.cookie = "refreshToken=; path=/; max-age=0;";
    fakePageReload();
}

export function fakePageReload() {
    const path = location.pathname + location.search + location.hash;
    changePage("/reload", true);
    setTimeout(() => changePage(path, true), 10);
}

export function storeTokens(data) {
    if (data.refreshToken) document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
    if (data.accessToken) document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
}

/**
 * Get the access token (renewing it if necessary)
 * @return {Promise<string|null>} The access token or null if the user is not logged in
 */
export async function getAccessToken() {
    if (!getCookie("refreshToken")) return null;

    const accessToken = getCookie("accessToken");
    if (accessToken) return accessToken;
    await renewAccessToken();
    return getCookie("accessToken");
}

/**
 * Fetch API with Authorization header
 * @param url The URL to fetch
 * @param options The options to pass to fetch
 * @param retry Whether to retry the request if it fails due to an expired access token (internal)
 * @returns {Promise<Response>} The response
 */
export async function fetchApi(url, options = undefined, retry = true) {
    options ??= {};
    options.headers ??= {};
    options.headers["Authorization"] ??= `Bearer ${await getAccessToken()}`;
    const response = await fetch(url, options);
    if (retry && response.status === 401) {
        await renewAccessToken();
        return await fetchApi(url, options, false);
    }
    return response;
}

/**
 * Fetch API with POST method and with Authorization header
 * @param url The URL to fetch
 * @param body The body to send
 * @param options The options to pass to fetch
 * @returns {Promise<Response>} The response
 */
export async function fetchPostApi(url, body, options = undefined) {
    options ??= {};
    options.headers ??= {};
    options.method ??= "POST";
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
    return await fetchApi(url, options);
}

/**
 * Get the user info
 * @returns {{username: string}|null}
 */
export function getUserInfo() {
    const token = getCookie("refreshToken");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(window.atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(jsonPayload);
}
