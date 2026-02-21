# Testing Strategy: Comprehensive E2E Auth Workflows

This document outlines the strategy for performing full End-to-End (E2E) testing across all user portals using authentic Supabase credentials.

## 1. Test Data Management
Test credentials are stored in `test-credentials.json` (gitignored). These users have been seeded directly into the Supabase database.

### Test Accounts
| Role | Email | Redirects To |
| :--- | :--- | :--- |
| **Admin** | `luis@lprealestate.com` | `/admin` |
| **Agent** | `sarah@lprealestate.com` | `/portal` |
| **Loan Officer** | `m.chen@highlandslending.com` | `/portal` |
| **Client** | `robert.t@gmail.com` | `/dashboard` |

## 2. E2E Test Scenarios

### Authentication & Authorization
- **Login Switchboard**: Verify each role lands on the correct dashboard after login.
- **Middleware Guard**: Attempt to access `/admin` while logged in as a `client` (should redirect to `/dashboard`).
- **Session Persistence**: Ensure the navbar shows the "Sign Out" button across page refreshes.

### Role-Specific Workflows
- **Admin Workflow**:
    - Login as Luis.
    - View global stats (Active Pipeline, Total Clients).
    - Access Admin-only settings.
- **Professional Workflow**:
    - Login as Sarah.
    - Switch between clients in the Portal sidebar.
    - send messages in the Triad Chat.
- **Client Workflow**:
    - Login as Robert.
    - View personal Roadmap/Milestones in the Command Center.
    - Upload a document and verify it appears in the list.

## 3. Playwright Implementation
Tests should import credentials from the `test-credentials.json` file.

```typescript
import testData from '../test-credentials.json';

test('Admin can login and see dashboard', async ({ page }) => {
    const admin = testData.users.find(u => u.role === 'admin');
    await page.goto('/login');
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', testData.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
});
```

## 4. Maintenance
If database schema changes (e.g., new roles), update `test-credentials.json` and re-seed the database using the internal Supabase MCP tool or SQL scripts.
