# UI/UX audit baseline

Audited the running Compose application in Chromium using the seeded ADMIN, PM, ENGINEER, and CLIENT accounts. Captures are in the ignored local folder `test-results/ui-audit/`; the temporary capture test is not part of the product test suite.

## Findings

- The workspace has no persistent workspace frame: a thin white header contains a product name, text links, notification bell, and sign-out, while role identity only appears as a small uppercase label on each page. At 375px, all navigation links wrap into a second row with no mobile-specific navigation model.
- Dashboard composition is a generic four-metric strip followed by a large project card, status card, and a long activity card. It prioritizes totals over attention/next actions and is nearly identical for every role; at mobile widths the metric grid becomes a very long stack.
- The visual language relies on the same white bordered rounded card and light shadow for most unrelated content. Primary blue is used widely, while requirement status colors are inconsistent with the status badge component. Activity records consume full-width rows and use raw timestamps.
- Projects and project detail use repeated standalone cards. Client requirement intake shares a tall form column with an unbounded requirement list, which is especially long on mobile.
- Requirement detail's page title is only “Requirement”; the actual request title is missing from its header. Status/priority are detached from project context, no workflow progression or next-owner cue exists, and the PM triage panel is below the discussion/activity on mobile. Submission metadata is isolated in a separate card.
- Kanban is four equal columns with neutral empty lanes and large task cards. On small screens it collapses into a long sequence of columns, making cross-status scanning difficult; filters are not presented as a cohesive board toolbar.
- Comments and activity are separate large card sections with repeated explanatory text. Internal/client visibility is technically clear but visually indistinct from other form controls.
- Auth pages use a narrow centered card and a large unused canvas; they do not establish organization/workspace context. Registration and invite remain functional, but use the same form-card recipe.
- Loading, error, empty, and validation states exist, but are mostly plain text or generic containers rather than sharing a recognizable system.

## Scope and method

This is a frontend redesign. API, persistence, auth, roles, tenant scoping, state machines, notifications, SSE, and existing tests remain unchanged. Checked 1440px and 375px screenshots for role dashboards and board, and the 1440px, 1024px, 768px, and 375px requirement detail; also inspected projects, project detail, admin, registration, and invalid invite states. The existing end-to-end workflow and tenant-isolation checks passed before visual implementation.
