import { beforeEach, describe, expect, it, vi } from "vitest";
import * as p from "@clack/prompts";
import { authConfigSchema } from "../config/schema.js";
import { promptServer } from "../prompts/server.js";

vi.mock("@clack/prompts", () => ({
  select: vi.fn(),
  text: vi.fn(),
  isCancel: () => false,
}));

beforeEach(() => vi.resetAllMocks());

describe("server prompt signup configuration", () => {
  it("keeps signup enabled for legacy auth configuration", () => {
    expect(authConfigSchema.parse({ baseUrlMode: "auto" }).disableSignUp).toBe(false);
  });

  for (const mode of ["local_trusted", "private", "public", "existing-explicit"] as const) {
    it.each([undefined, false, true])(`preserves disableSignUp=%s in ${mode}`, async (disableSignUp) => {
      const authenticated = mode === "private" || mode === "public";
      vi.mocked(p.select).mockResolvedValueOnce(authenticated ? "authenticated" : "local_trusted");
      if (authenticated) vi.mocked(p.select).mockResolvedValueOnce(mode);
      vi.mocked(p.text).mockResolvedValueOnce("127.0.0.1").mockResolvedValueOnce("3100");
      if (mode === "private") vi.mocked(p.text).mockResolvedValueOnce("");
      if (mode === "public") vi.mocked(p.text).mockResolvedValueOnce("https://paperclip.example.com/");

      const { auth } = await promptServer({
        currentAuth: {
          ...(mode === "existing-explicit"
            ? { baseUrlMode: "explicit" as const, publicBaseUrl: "https://paperclip.example.com" }
            : {}),
          ...(disableSignUp === undefined ? {} : { disableSignUp }),
        },
      });

      expect(auth.disableSignUp).toBe(disableSignUp ?? false);
      expect(authConfigSchema.parse(auth)).toEqual(auth);
      expect(auth.baseUrlMode).toBe(mode === "public" || mode === "existing-explicit" ? "explicit" : "auto");
      if (auth.baseUrlMode === "explicit") expect(auth.publicBaseUrl).toBe("https://paperclip.example.com");
    });
  }
});
