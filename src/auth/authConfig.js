
export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID, // Replace with your Azure AD app's Client ID
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`, // Replace with your Tenant ID
        redirectUri: "http://localhost:5173", // Replace with your app's redirect URI
    },
    cache: {
        cacheLocation: "sessionStorage", // Can also be 'localStorage'
        storeAuthStateInCookie: true, // Recommended for IE/Edge
    },
};

export const loginRequest = {
    scopes: ["User.Read"], // Define the permissions your app requires
};
  