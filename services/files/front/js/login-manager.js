export function getCookie(name) {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
}

export async function renewAccessToken() {
    const body = JSON.stringify({refreshToken: getCookie("refreshToken")});
    const data = await loginFetch("renew-access-token", body);
    if (data)
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
}

export async function loginFetch(url, body, authorizationToken) {
    const response = await fetch("/api/user/" + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authorizationToken
        },
        body: body
    });
    const data = await response.json();
    if (!response.ok) {
        alert(data?.error ?? response.statusText);
        return;
    }
    return data;
}

export function disconnect() {
    document.cookie = "accessToken=; path=/; max-age=0;";
    document.cookie = "refreshToken=; path=/; max-age=0;";
    fakePageReload();
}

export function fakePageReload() {
    document.dispatchEvent(new CustomEvent("menu-selection", {detail: {name: ""}}));
    setTimeout(() => document.dispatchEvent(new CustomEvent("menu-selection", {detail: {name: "home"}})), 10);
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
    options.headers["Authorization"] = `Bearer ${await getAccessToken()}`;
    const response = await fetch(url, options);
    if (retry && response.status === 401) {
        await renewAccessToken();
        return await fetchApi(url, options, false);
    }
    return response;
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
