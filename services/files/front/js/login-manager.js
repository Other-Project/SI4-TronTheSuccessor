import {changePage} from "../components/pages/pages.js";
import notificationService from "./notification.js";
import "/js/capacitor.min.js";

export function getCookie(name) {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
}

export async function renewAccessToken() {
    const response = await fetchApi("/api/user/renew-access-token", {
        headers: {
            "Authorization": `Bearer ${getCookie("refreshToken")}`
        }
    }, false);
    if (!response.ok) {
        document.dispatchEvent(new CustomEvent("show-notification", {
            detail: {
                message: "Failed to extend session",
                duration: 2000,
                background: "red",
                color: "white"
            }
        }));
        console.error("Failed to extend session", response.statusText);
        if (response.status === 401) disconnect(); // Logout if refresh token is invalid
        return;
    }
    const data = await response.json();
    storeTokens(data);
}

export function disconnect() {
    document.cookie = "accessToken=; path=/; max-age=0;";
    document.cookie = "refreshToken=; path=/; max-age=0;";
    document.cookie = "gameInvitationToken=; path=/; max-age=0;";
    notificationService.disconnect();
    fakePageReload();
}

export function fakePageReload() {
    changePage(location.pathname + location.search + location.hash, true, true);
}

export function storeTokens(data) {
    if (data.refreshToken) document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
    if (data.accessToken) document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
    if (data.gameInvitationToken) document.cookie = `gameInvitationToken=${data.gameInvitationToken}; path=/; max-age=${60 * 10};`;
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
    if (!options.headers["Authorization"]) {
        const accessToken = await getAccessToken();
        if (accessToken) options.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // noinspection JSUnresolvedReference
    const response = await fetch(Capacitor.isNativePlatform() ? new URL(url, "https://tronsuccessor.ps8.pns.academy").toString() : url, options);
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

/**
 * Update the status of a message of type "game-invitation" based on the game invitation token
 * @param status {"accepted"|"refused"}
 * @param gameInvitationToken The token of the game invitation
 * @returns {Promise<boolean>} True if the status was updated, false otherwise
 */
export async function tryUpdatingGameInvitationStatus(status, gameInvitationToken) {
    const response = await fetchPostApi("/api/chat/game-invitation", {gameInvitationToken, status}, {method: "PUT"});
    if (!response.ok) {
        document.dispatchEvent(new CustomEvent("hide-drawer"));
        document.dispatchEvent(new CustomEvent("show-notification", {
            detail: {
                message: "This game invitation has already expired",
                duration: 5000,
                background: "red",
                color: "white"
            }
        }));
    }
    return response.ok;
}
