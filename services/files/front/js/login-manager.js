export function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=')
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
}

export async function renewAccessToken() {
    await fetch("/api/user/renew-access-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({refreshToken: getCookie("refreshToken")})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            alert(response.error);
            location.reload();
        } else throw new Error(response.error);
    }).then(data => {
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
    });
}

/**
 * Fetch API with Authorization header
 * @param url The URL to fetch
 * @param options The options to pass to fetch
 * @param retry Whether to retry the request if it fails due to an expired access token (internal)
 * @returns {Promise<Response>} The response
 */
export async function fetchApi(url, options = undefined, retry = true) {
    let accessToken = getCookie("accessToken");
    if (!accessToken) {
        await renewAccessToken();
        accessToken = getCookie("accessToken");
    }

    options ??= {};
    options.headers ??= {};
    options.headers["Authorization"] = `Bearer ${accessToken}`;
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
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
}
