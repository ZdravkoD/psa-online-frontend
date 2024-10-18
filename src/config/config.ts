interface Config {
    apiBaseUrl: string | undefined;
    pubsubUrl: string | undefined;
}

// Process all environment variables and provide type safety
const config: Config = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
    pubsubUrl: process.env.REACT_APP_PUBSUB_URL,
};

if (!config.apiBaseUrl) {
    throw new Error("REACT_APP_API_BASE_URL environment variable is not set");
}

export default config;
