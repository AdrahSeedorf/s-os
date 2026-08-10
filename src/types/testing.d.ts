/// <reference types="@testing-library/jest-dom/vitest" />

// Registers the jest-dom matchers (toBeInTheDocument, toHaveFocus, …) with
// Vitest's Assertion type. Without this the matchers work at runtime but the
// production typecheck fails on the test files.
export {};
