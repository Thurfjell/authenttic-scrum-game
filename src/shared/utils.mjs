function parseCookies(cookieHeader = '') {
    return Object.fromEntries(
        cookieHeader
            .split(';')
            .map(c => c.trim().split('='))
            .filter(([k, v]) => k && v)
            .map(([k, v]) => [k, decodeURIComponent(v)])
    );
}

export { parseCookies }