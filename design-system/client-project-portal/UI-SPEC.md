# Client Project Portal — operational UI spec

Product-specific companion to `MASTER.md`. This application is a client-to-engineering delivery workspace, not a general analytics dashboard. Keep the requirement’s path from client intake through PM triage and engineering delivery visible in page hierarchy.

## Product tone and composition

Premium through restraint: quiet warm-neutral canvas, white working surfaces, deep ink, a single trustworthy blue accent, and compact status colors with text labels. Avoid gradients, decorative chart chrome, ornamental hero areas, and card-on-card nesting. Design for scanning active work, not showcasing totals.

## Type

- Page title: 28–32px, semibold, tight tracking; show the actual project/requirement name.
- Section title: 16–18px, semibold.
- Body/control: 14–16px, regular/medium; 16px default on mobile forms.
- Supporting metadata: 12–13px, muted but contrast-compliant; pair dates with meaningful labels.
- Use existing Plus Jakarta Sans for product UI and tabular numerals for counts. Reserve uppercase eyebrow text for compact workspace/role context.

## Semantic color

- Canvas `#f5f7fa`; surface `#ffffff`; elevated surface `#ffffff` with restrained shadow; border `#dbe2ea`.
- Ink `#172536`; muted `#526273`; subtle `#69798a`.
- Primary/action `#2459a6` (white text); hover `#1b477f`; focus `#1557b0`.
- Success `#166534` on `#dcfce7`; warning `#854d0e` on `#fef3c7`; danger `#991b1b` on `#fee2e2`; info `#1e4d8f` on `#dbeafe`.
- Requirements share one status palette everywhere: Submitted=slate, In review=indigo, Needs info=amber, Approved=teal, In progress=blue, Delivered=green, Rejected=red. Tasks: To do=slate, In progress=blue, In review=amber, Done=green. Always show a readable label; color is never the only signal.

## Layout and shape

- Spacing base: 4px; common steps 8/12/16/24/32/40.
- Main content max width 1440px; desktop workspace uses a slim fixed-width left rail and fluid content, with a compact top utility bar only where necessary.
- Radius hierarchy: controls 6px, compact panels 8px, major grouped regions 10px; pills only for status/priority. Use 1px borders for separation. Shadows only for overlays and elevated interactive surfaces.
- Desktop dashboards: attention/next-action region first; role-relevant operational queue second; project/requirement progress and compact activity after. Keep client, PM, engineer, and admin task emphasis meaningfully distinct.
- Requirement detail: real title, project/client metadata, status path and owner/next action; description and task breakdown in the primary column; triage, submission facts, discussion/activity in a deliberate context rail. On mobile, put next action directly after the request header, then details/tasks and compact collaboration history.
- Board: persistent compact toolbar; four status lanes with counts and clear accent edges; concise cards with project, title, owner, estimate/due, and keyboard-operable native status selection. Mobile uses intentional single-lane/selected-status scanning instead of rendering four stacked empty-looking columns.
- Forms: readable bounded width, explicit labels/help/errors, grouped sections, concise action footer, minimum 44px targets; use inline panel forms rather than giant centered cards.

## Navigation, accessibility, and motion

- Role-aware sidebar groups: Overview, Delivery (Projects/Task board when permitted), and Organization (Clients & team when permitted). Keep role and organization name visible, user/profile and notification controls reachable, and active section unmistakable. At ≤767px use a labelled compact menu/drawer, not wrapped desktop links.
- Maintain semantic landmarks, skip link, keyboard access, visible focus, labelled controls, 4.5:1 text contrast, and reduced-motion support. Keep icon-only buttons labelled and touch targets ≥44px.
- Motion is limited to short color/opacity/position feedback for navigation, dropdown, toast, and status confirmation. Honor `prefers-reduced-motion`; no decorative looping animation.

## Components and implementation

Use the existing React/Tailwind component foundation and extract shared shell, page header, panel, button, status/priority badge, field, alert/toast, compact activity row, empty/loading/error states. Use Lucide icons for navigation and concise action cues. The repo does not currently include shadcn/ui; do not introduce a parallel component framework just to obtain primitives—prefer accessible existing/native controls unless an interaction genuinely needs a reusable primitive.
