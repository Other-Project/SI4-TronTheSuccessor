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
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refreshToken: getCookie("refreshToken")}),
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            alert(response.error);
            location.reload();
        } else {
            throw new Error(response.error);
        }
    }).then(data => {
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
    });
}