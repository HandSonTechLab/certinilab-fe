/**
 * Single toggle for the Reports feature: true serves local mock data,
 * false calls the real backend (`POST /api/v1/report`). Flip back to true
 * for local development/testing without a running backend.
 */
export const USE_MOCK_REPORT_DATA = false;
