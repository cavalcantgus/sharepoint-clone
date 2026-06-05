
export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID, // Replace with your Azure AD app's Client ID
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`, // Replace with your Tenant ID
        redirectUri: import.meta.env.VITE_REDIRECT_URI, // Replace with your app's redirect URI
    },
    cache: {
        cacheLocation: "localStorage", // Can also be 'localStorage'
        storeAuthStateInCookie: true, // Recommended for IE/Edge
    },

};

export const loginRequest = {
    scopes: ["User.Read"], // Define the permissions your app requires
};
