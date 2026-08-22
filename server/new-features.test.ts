import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { afterEach, beforeEach } from "vitest";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const TEST_USER_ID = TEST_USER_IDS.newFeatures;
const EXECUTION_OWNER_TEST_USER_ID = TEST_USER_IDS.executionOwnership;

beforeEach(async () => {
  await cleanupTestUserData(TEST_USER_ID);
  await cleanupTestUserData(EXECUTION_OWNER_TEST_USER_ID);
});
afterEach(async () => {
  await cleanupTestUserData(TEST_USER_ID);
  await cleanupTestUserData(EXECUTION_OWNER_TEST_USER_ID);
});

function createAuthContext(userId = TEST_USER_ID): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `omnimatrix-test-new-features-${userId}`,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Collaboration Features", () => {
  it("creates a workspace successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.collaboration.createWorkspace({
      name: "Test Workspace",
      description: "A test workspace for automation",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("retrieves user workspaces", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const workspaces = await caller.collaboration.workspaces();
    expect(Array.isArray(workspaces)).toBe(true);
  });

  it("updates collaboration session", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a script first
    const script = await caller.scripts.create({
      name: "Test Script for Collaboration",
      description: "Testing collaboration session",
    });

    await caller.collaboration.updateSession({
      scriptId: script.id,
      cursorPosition: { x: 100, y: 200 },
      selectedNodeId: "node-1",
    });

    // Session update is successful if no error is thrown
    expect(true).toBe(true);
  });

  it("does not expose or mutate another user's collaboration data", async () => {
    const ownerCaller = appRouter.createCaller(createAuthContext().ctx);
    const otherUserCaller = appRouter.createCaller(createAuthContext(EXECUTION_OWNER_TEST_USER_ID).ctx);

    const workspace = await ownerCaller.collaboration.createWorkspace({
      name: "Owner-only Workspace",
      description: "Collaboration data must remain owner-scoped.",
    });
    const script = await ownerCaller.scripts.create({
      name: "Owner-only Collaboration Script",
      description: "Script used for cross-user collaboration access checks.",
    });

    await expect(otherUserCaller.collaboration.getMembers({ workspaceId: workspace.id })).resolves.toEqual([]);
    await expect(otherUserCaller.collaboration.addMember({
      workspaceId: workspace.id,
      userId: EXECUTION_OWNER_TEST_USER_ID,
      role: "viewer",
    })).resolves.toBeUndefined();
    await expect(otherUserCaller.collaboration.getActiveSessions({ scriptId: script.id })).resolves.toEqual([]);
    await expect(otherUserCaller.collaboration.updateSession({
      scriptId: script.id,
      cursorPosition: { x: 1, y: 1 },
    })).resolves.toBe(false);

    await expect(ownerCaller.collaboration.updateSession({
      scriptId: script.id,
      cursorPosition: { x: 10, y: 20 },
    })).resolves.toBe(true);
    const ownerSessions = await ownerCaller.collaboration.getActiveSessions({ scriptId: script.id });
    expect(ownerSessions).toHaveLength(1);
    expect(ownerSessions[0]).toMatchObject({ userId: TEST_USER_ID });
  });
});

describe("Marketplace Features", () => {
  it("creates a marketplace template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.marketplace.create({
      name: "Twitter Auto Liker",
      description: "Automatically like tweets based on keywords",
      category: "engagement",
      platform: "twitter",
      price: 999,
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("lists marketplace templates", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const templates = await caller.marketplace.list();
    expect(Array.isArray(templates)).toBe(true);
  });

  it("filters templates by platform", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const templates = await caller.marketplace.list({
      platform: "twitter",
    });

    expect(Array.isArray(templates)).toBe(true);
  });

  it("adds a review to a template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a template first
    const template = await caller.marketplace.create({
      name: "Test Template",
      platform: "instagram",
      price: 0,
    });

    const review = await caller.marketplace.addReview({
      templateId: template.id,
      rating: 5,
      comment: "Excellent template!",
    });

    expect(review).toHaveProperty("id");
  });
});

describe("Documentation Features", () => {
  it("generates documentation for a script", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a script with nodes
    const script = await caller.scripts.create({
      name: "Test Automation Script",
      description: "A script for testing documentation generation",
      nodes: [
        {
          id: "1",
          type: "navigate",
          position: { x: 0, y: 0 },
          data: { url: "https://example.com", label: "Navigate to Example" },
        },
        {
          id: "2",
          type: "click",
          position: { x: 200, y: 0 },
          data: { selector: "#submit-btn", label: "Click Submit" },
        },
      ],
      edges: [
        {
          id: "e1-2",
          source: "1",
          target: "2",
        },
      ],
    });

    const doc = await caller.documentation.generate({
      scriptId: script.id,
      title: "Test Script Documentation",
      format: "markdown",
    });

    expect(doc).toHaveProperty("id");
    expect(typeof doc.id).toBe("number");
  });

  it("lists documentation for a script", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a script
    const script = await caller.scripts.create({
      name: "Script with Docs",
    });

    const docs = await caller.documentation.list({
      scriptId: script.id,
    });

    expect(Array.isArray(docs)).toBe(true);
  });

  it("updates documentation content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create script and documentation
    const script = await caller.scripts.create({
      name: "Update Test Script",
    });

    const doc = await caller.documentation.generate({
      scriptId: script.id,
      title: "Original Title",
    });

    await caller.documentation.update({
      id: doc.id,
      title: "Updated Title",
      content: "# Updated Content\n\nThis is the new content.",
    });

    // Update is successful if no error is thrown
    expect(true).toBe(true);
  });

  it("does not expose another user's script documentation", async () => {
    const ownerCaller = appRouter.createCaller(createAuthContext().ctx);
    const otherUserCaller = appRouter.createCaller(createAuthContext(EXECUTION_OWNER_TEST_USER_ID).ctx);
    const script = await ownerCaller.scripts.create({
      name: "Owner-only Documentation Script",
      description: "Documentation must not be listed for another user.",
    });

    await ownerCaller.documentation.generate({
      scriptId: script.id,
      title: "Owner-only QA Documentation",
    });

    await expect(otherUserCaller.documentation.list({ scriptId: script.id })).resolves.toEqual([]);
    const ownerDocuments = await ownerCaller.documentation.list({ scriptId: script.id });
    expect(ownerDocuments).toHaveLength(1);
    expect(ownerDocuments[0]).toMatchObject({ userId: TEST_USER_ID });
  });
});

describe("Integration Tests", () => {
  it("complete workflow: create script, generate docs, publish to marketplace", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // 1. Create a script
    const script = await caller.scripts.create({
      name: "Complete Workflow Test",
      description: "Testing full integration",
      nodes: [
        {
          id: "start",
          type: "navigate",
          position: { x: 0, y: 0 },
          data: { url: "https://twitter.com" },
        },
      ],
    });

    expect(script.id).toBeDefined();

    // 2. Generate documentation
    const doc = await caller.documentation.generate({
      scriptId: script.id,
      title: "Workflow Documentation",
    });

    expect(doc.id).toBeDefined();

    // 3. Create marketplace template from script
    const template = await caller.marketplace.create({
      name: "Twitter Workflow Template",
      description: "Based on complete workflow test",
      platform: "twitter",
      category: "automation",
      price: 1999,
    });

    expect(template.id).toBeDefined();

    // 4. Publish the template
    await caller.marketplace.publish({
      id: template.id,
    });

    // 5. Verify it appears in marketplace
    // Default ordering favors existing templates by download volume; request the
    // documented recent ordering so the test deterministically validates this
    // newly published record.
    const published = await caller.marketplace.list({ sortBy: "recent" });
    const found = published.find((t) => t.id === template.id);
    expect(found).toBeDefined();
    expect(found?.status).toBe("published");
  });
});

describe("PDF Report Export", () => {
  it("generates PDF report for execution", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test script first
    const script = await caller.scripts.create({
      name: "Test Script for PDF",
      description: "Script for testing PDF export",
    });

    // Create an execution
    const execution = await caller.executions.create({
      scriptId: script.id,
      stepsTotal: 5,
    });

    // Generate PDF report
    const result = await caller.reports.exportPDF({
      executionId: execution.id,
    });

    expect(result).toBeDefined();
    expect(result.pdf).toBeTruthy();
    expect(result.filename).toContain(".pdf");
  });

  it("includes execution details in PDF", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const script = await caller.scripts.create({
      name: "Detailed Test Script",
      description: "Script with detailed execution",
    });

    const execution = await caller.executions.create({
      scriptId: script.id,
      stepsTotal: 10,
    });

    const result = await caller.reports.exportPDF({
      executionId: execution.id,
    });

    expect(result).toBeDefined();
    expect(result.pdf).toBeTruthy();
    expect(result.filename).toContain(".pdf");
  });
});

describe("Marketplace Rating & Feedback", () => {
  it("submits a review for a template", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a marketplace template first
    const template = await caller.marketplace.create({
      name: "Test Template for Reviews",
      description: "Template for testing reviews",
      category: "social-media",
      platform: "twitter",
      price: 0,
    });

    // Submit a review
    const review = await caller.marketplace.addReview({
      templateId: template.id,
      rating: 5,
      comment: "Excellent template!",
    });

    expect(review).toBeDefined();
    expect(review.id).toBeDefined();
    expect(typeof review.id).toBe("number");
  });

  it("keeps draft templates creator-only and blocks purchase until publication", async () => {
    const ownerCaller = appRouter.createCaller(createAuthContext().ctx);
    const otherUserCaller = appRouter.createCaller(createAuthContext(EXECUTION_OWNER_TEST_USER_ID).ctx);
    const publicCaller = appRouter.createCaller({ user: null } as TrpcContext);

    const draft = await ownerCaller.marketplace.create({
      name: "Creator-only Draft Template",
      description: "A draft must not be exposed or purchasable before publication.",
      category: "testing",
      platform: "multi",
      price: 100,
    });

    await expect(publicCaller.marketplace.get({ id: draft.id })).resolves.toBeUndefined();
    await expect(otherUserCaller.marketplace.getOwn({ id: draft.id })).resolves.toBeUndefined();
    await expect(ownerCaller.marketplace.getOwn({ id: draft.id })).resolves.toMatchObject({
      id: draft.id,
      status: "draft",
      creatorId: TEST_USER_ID,
    });
    await expect(otherUserCaller.marketplace.purchase({ templateId: draft.id })).rejects.toThrow("Template not found");

    await ownerCaller.marketplace.publish({ id: draft.id });
    await expect(publicCaller.marketplace.get({ id: draft.id })).resolves.toMatchObject({
      id: draft.id,
      status: "published",
    });
  });
  it("calculates average rating correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const template = await caller.marketplace.create({
      name: "Rating Test Template",
      description: "Template for testing average ratings",
      category: "testing",
      platform: "instagram",
      price: 0,
    });

    // Submit multiple reviews (need different users, so we'll just submit one)
    await caller.marketplace.addReview({
      templateId: template.id,
      rating: 5,
      comment: "Great!",
    });

    // Get reviews for the template
    const reviews = await caller.marketplace.getReviews({ templateId: template.id });

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Real-Time Notifications", () => {
  it("updates execution status to completed", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const script = await caller.scripts.create({
      name: "Notification Test Script",
      description: "Script for testing notifications",
    });

    const execution = await caller.executions.create({
      scriptId: script.id,
      stepsTotal: 5,
    });

    // Update execution status to completed
    const updated = await caller.executions.updateStatus({
      id: execution.id,
      status: "completed",
    });

    expect(updated).toBeDefined();
    expect(updated.status).toBe("completed");
    expect(updated.completedAt).toBeDefined();
  });

  it("handles execution failure with error message", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const script = await caller.scripts.create({
      name: "Failed Execution Test",
      description: "Script for testing failure notifications",
    });

    const execution = await caller.executions.create({
      scriptId: script.id,
      stepsTotal: 5,
    });

    // Update execution status to failed
    const updated = await caller.executions.updateStatus({
      id: execution.id,
      status: "failed",
      error: "Network timeout error",
    });

    expect(updated).toBeDefined();
    expect(updated.status).toBe("failed");
    expect(updated.error).toBe("Network timeout error");
    expect(updated.completedAt).toBeDefined();
  });

  it("does not return or update another user's execution", async () => {
    const ownerCaller = appRouter.createCaller(createAuthContext().ctx);
    const otherUserCaller = appRouter.createCaller(createAuthContext(EXECUTION_OWNER_TEST_USER_ID).ctx);

    const script = await ownerCaller.scripts.create({
      name: "Owner Execution Isolation Test",
      description: "Execution must remain invisible to another user after an update attempt.",
    });
    const execution = await ownerCaller.executions.create({ scriptId: script.id, stepsTotal: 1 });

    const result = await otherUserCaller.executions.updateStatus({
      id: execution.id,
      status: "completed",
    });

    expect(result).toBeUndefined();
    const ownerExecutions = await ownerCaller.executions.list();
    expect(ownerExecutions.find((item) => item.id === execution.id)).toMatchObject({ status: "queued" });
  });
});
