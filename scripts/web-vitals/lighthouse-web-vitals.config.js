module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/settings",
        "http://localhost:3000/collections",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "first-contentful-paint": [
          "warn",
          {
            maxNumericValue: 1800,
          },
        ],
        "largest-contentful-paint": [
          "warn",
          {
            maxNumericValue: 2500,
          },
        ],
        "first-input-delay": [
          "warn",
          {
            maxNumericValue: 100,
          },
        ],
        "cumulative-layout-shift": [
          "warn",
          {
            maxNumericValue: 0.1,
          },
        ],
        "total-blocking-time": [
          "warn",
          {
            maxNumericValue: 200,
          },
        ],
        "speed-index": [
          "warn",
          {
            maxNumericValue: 3400,
          },
        ],
        "categories:performance": [
          "warn",
          {
            minScore: 0.8,
          },
        ],
        "categories:accessibility": [
          "error",
          {
            minScore: 0.9,
          },
        ],
        "categories:best-practices": [
          "warn",
          {
            minScore: 0.8,
          },
        ],
        "categories:seo": [
          "warn",
          {
            minScore: 0.8,
          },
        ],
        "categories:pwa": [
          "warn",
          {
            minScore: 0.7,
          },
        ],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
