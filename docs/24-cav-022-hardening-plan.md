# CAV-022 Hardening Plan — Performance, Accessibility, Recovery & E2E

## Context
CAV-022 is the final task of Canvas Editor v2.
All functional epics (36–44) are complete.
This plan breaks CAV-022 into four independent slices that can be parallelized.

---

## Slice CAV-022a — Performance Hardening

### Scope
Ensure canvas remains responsive with 200–500 node graphs.

### Actions

1. **Memoize nodesWithState/edgesWithSelection in canvas-viewport.tsx** (lines 143–178)
   - Wrap in `useMemo` with deps on `externalNodes`, `selectedNodeIds`, `selectedEdgeIds`, `pendingConnection`, `canvasMode`, `addEdgeSource`
   - Prevents 500+ object instantiations per unrelated re-render

2. **Zustand selector subscriptions in route files**
   - org.tsx, departments.$departmentId.tsx, workflows.$workflowId.tsx: replace `useVisualWorkspaceStore()` destructuring with individual selectors
   - Pattern: `const activeLayers = useVisualWorkspaceStore(s => s.activeLayers)`
   - Reduces re-renders from unrelated store property changes

3. **Single-pass filter in layoutWorkflowGraph** (graph-to-flow.ts lines 86–102)
   - Replace 4x `.filter()` with single reduce/accumulator pass
   - Minor but clean

4. **Stable nodeTypes/edgeTypes references audit**
   - Verify all ReactFlow `nodeTypes` props use module-level constants (already good, document for future)

### Files touched
- `apps/web/src/components/visual-shell/canvas-viewport.tsx`
- `apps/web/src/routes/projects/$projectId/org.tsx`
- `apps/web/src/routes/projects/$projectId/departments.$departmentId.tsx`
- `apps/web/src/routes/projects/$projectId/workflows.$workflowId.tsx`
- `apps/web/src/components/visual-shell/workflow-canvas.tsx`
- `apps/web/src/lib/graph-to-flow.ts`

### Tests
- Update existing canvas-viewport tests for memoized node/edge arrays
- Add perf-focused test: verify node identity stability when unrelated store props change

---

## Slice CAV-022b — Accessibility Hardening

### Scope
Bring interactive components to WCAG 2.1 AA baseline for keyboard and screen reader users.

### Actions

1. **Dialog/Modal roles** — 3 files
   - `entity-form-dialog.tsx`: add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap (trap Tab inside dialog), return focus on close
   - `keyboard-shortcuts-help.tsx`: add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap
   - `edge-delete-confirm.tsx`: add `role="alertdialog"`, `aria-modal="true"`, focus first action button on mount, return focus on dismiss

2. **Tab semantics** — 2 files
   - `inspector.tsx`: wrap tab buttons in `role="tablist"`, each button gets `role="tab"` + `aria-selected` + `aria-controls`, content panel gets `role="tabpanel"` + `aria-labelledby`
   - `explorer.tsx`: same tab pattern for explorer pill tabs

3. **Context menu roles** — 1 file
   - `context-menu.tsx`: wrapper gets `role="menu"`, items get `role="menuitem"`, section headers get `role="separator"`, arrow key navigation within menu

4. **Toggle button states** — 1 file
   - `canvas-toolbar.tsx`: add `aria-pressed` on overlay toggles (validation, operations), add `aria-live="polite"` on saving indicator

5. **Form field associations** — 1 file
   - `entity-form-dialog.tsx`: add `id` to inputs, `htmlFor` to labels

6. **Focus trap utility**
   - Create minimal `useFocusTrap(ref)` hook (no external dependency)
   - Used by dialog/modal components above

### Files touched
- `apps/web/src/components/visual-shell/entity-form-dialog.tsx`
- `apps/web/src/components/visual-shell/keyboard-shortcuts-help.tsx`
- `apps/web/src/components/visual-shell/edge-delete-confirm.tsx`
- `apps/web/src/components/visual-shell/inspector/inspector.tsx`
- `apps/web/src/components/visual-shell/explorer/explorer.tsx`
- `apps/web/src/components/visual-shell/context-menu.tsx`
- `apps/web/src/components/visual-shell/canvas-toolbar.tsx`
- `apps/web/src/hooks/use-focus-trap.ts` (new)

### Tests
- Dialog a11y tests: verify role, aria-modal, focus trap behavior, return focus
- Tab semantics tests: verify role="tablist"/"tab"/"tabpanel", aria-selected toggling
- Context menu tests: verify role="menu"/"menuitem", arrow key navigation
- Focus trap hook tests: verify Tab cycles within container, Shift+Tab reverses
- ~30 new tests expected

---

## Slice CAV-022c — Recovery & Robustness

### Scope
Prevent data loss and provide graceful error handling.

### Actions

1. **Error boundary** — root level
   - Create `ErrorBoundary` component wrapping canvas routes
   - Shows friendly error UI with "Reload" button
   - Logs error info (console for now)
   - Place in `__root.tsx` or wrap VisualShell

2. **Mutation error feedback**
   - `use-entity-mutation.ts`: add `onError` callback, surface via toast/notification
   - `use-relationship-mutation.ts`: same pattern
   - Create minimal `useToast` or inline error banner in VisualShell

3. **beforeunload warning**
   - Add `beforeunload` handler when `isPending` (entity or relationship mutation in flight)
   - Clean up on unmount

4. **Query client error handling**
   - `main.tsx`: add `onError` to QueryClient `defaultOptions.mutations`
   - Optional: add retry strategy for mutations (retry: 0, no auto-retry for writes)

5. **Workflow route parity**
   - Wire layout persistence in workflow route (currently missing)
   - Wire view state persistence in workflow route (currently missing)

### Files touched
- `apps/web/src/components/error-boundary.tsx` (new)
- `apps/web/src/routes/__root.tsx`
- `apps/web/src/hooks/use-entity-mutation.ts`
- `apps/web/src/hooks/use-relationship-mutation.ts`
- `apps/web/src/components/visual-shell/visual-shell.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/routes/projects/$projectId/workflows.$workflowId.tsx`

### Tests
- Error boundary tests: verify error catch, fallback UI, recovery
- Mutation error tests: verify error callback triggers
- beforeunload tests: verify event listener added/removed
- Workflow parity tests: verify layout/view persistence wired
- ~15 new tests expected

---

## Slice CAV-022d — E2E Test Foundation (Playwright)

### Scope
Set up Playwright and write critical-path e2e tests for the canvas editor.

### Actions

1. **Playwright setup**
   - Add `@playwright/test` as dev dependency
   - Create `playwright.config.ts` at root
   - Add `test:e2e` script to root package.json
   - Configure base URL, browser(s), screenshot on failure

2. **Critical-path e2e tests** (5–8 tests)
   - Navigation: load org canvas, verify nodes render, drilldown to department, back to org
   - Entity creation: open node palette, create department, verify node appears
   - Relationship creation: connect two nodes via add-edge mode, verify edge
   - Inspector editing: click node, edit field in inspector, verify change persists
   - Keyboard: undo/redo cycle, mode switching via shortcuts
   - View persistence: change filters, refresh page, verify filters restored
   - Diff: compare two releases, verify diff overlay renders

3. **CI integration**
   - Add e2e job to existing CI pipeline (if exists)
   - Or document manual run instructions

### Files touched
- `playwright.config.ts` (new)
- `e2e/` directory (new)
- `package.json` (root — add script + dev dependency)

### Tests
- 5–8 Playwright e2e tests covering canvas critical paths

---

## Execution Order

All four slices are independent and can be parallelized:

```
CAV-022a (perf)    ──┐
CAV-022b (a11y)    ──┤── all independent
CAV-022c (recovery)──┤
CAV-022d (e2e)     ──┘
```

Recommended sequence if serial: a → b → c → d (perf first unblocks large-graph testing).

---

## Acceptance Criteria (maps to checklist Block I)

- [ ] Canvas renders 300-node graph without >200ms frame drops (CAV-022a)
- [x] All dialogs have role="dialog", focus trap, return focus (CAV-022b)
- [x] Inspector/Explorer tabs have proper ARIA tab semantics (CAV-022b)
- [x] Context menu has role="menu"/"menuitem" (CAV-022b)
- [ ] Error boundary catches and displays canvas crashes (CAV-022c)
- [ ] Mutation errors surface to user (CAV-022c)
- [ ] Playwright is set up and runs 5+ critical-path tests (CAV-022d)
- [ ] Workflow route has layout+view persistence parity (CAV-022c)

---

## Out of Scope
- Full WCAG 2.1 AAA compliance
- Virtualization / windowing for 1000+ node graphs (future)
- Offline support
- Undo stack persistence across sessions
- Real-time collaboration (WebSocket)
