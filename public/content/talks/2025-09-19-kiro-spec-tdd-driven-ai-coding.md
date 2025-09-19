---
title: "Kiro Spec: TDD-Driven AI Coding"
collection: talks
type: Blog
date: 2025-09-19
permalink: /talks/2025-09-19-kiro-spec-tdd-driven-ai-coding
excerpt: "Using Kiro-style specifications to drive AI coding with a test-first workflow."
tags:
  - TDD
  - AI
  - Kiro
  - Specifications
  - DevEx
  - Copilot
---

# Kiro Spec: TDD-Driven AI Coding

Modern AI coding tools are powerful, but without a tight feedback loop they can wander. Kiro specs give AI a crisp target: a compact, behavior-first spec that makes tests the source of truth. Pairing Kiro specs with TDD keeps humans in charge of intent while AI accelerates the path to green.

## TL;DR
- Write intent as a Kiro spec (small, testable, unambiguous).
- Translate that spec into executable tests first.
- Let AI generate or update code to satisfy the tests.
- Keep the loop tight: spec → tests → code → refactor.

## What is a Kiro spec?
A Kiro spec is a minimal, test-ready description of behavior:
- Single responsibility, crisp inputs/outputs
- Edge cases up front
- Examples that compile directly into tests
- Clear constraints and non-goals

Think of it as a terse contract your tests can enforce and your AI can aim for.

### Example (spec)
```text
Feature: Email normalization
Context: user signup
Inputs: arbitrary email strings
Behavior:
  - Trim surrounding whitespace
  - Lowercase the domain part only
  - Preserve quoted local-parts
  - Reject addresses with multiple '@'
Edge cases:
  - "  Alice@Example.COM  " → "Alice@example.com"
  - '"Weird Name"@Example.COM' → '"Weird Name"@example.com'
  - "a@@b.com" → error: invalid address
Non-goals: full RFC 5322 validation
```

## Turning Kiro specs into tests (TDD first)
Start by writing tests from the spec. Keep them small and readable.

```ts
// example: TypeScript/Jest
import { normalizeEmail } from "./email";

test("trims whitespace", () => {
  expect(normalizeEmail("  Alice@Example.COM  ")).toBe("Alice@example.com");
});

test("lowercases domain only and preserves quoted local part", () => {
  expect(normalizeEmail('\"Weird Name\"@Example.COM'))
    .toBe('\"Weird Name\"@example.com');
});

test("rejects multiple @", () => {
  expect(() => normalizeEmail("a@@b.com")).toThrow(/invalid/i);
});
```

Or in Python/pytest:

```py
def test_trims_whitespace():
    assert normalize_email("  Alice@Example.COM  ") == "Alice@example.com"

def test_lowercases_domain_only_and_preserves_quoted_local():
    assert normalize_email('\"Weird Name\"@Example.COM') == '\"Weird Name\"@example.com'

def test_rejects_multiple_at():
    with pytest.raises(ValueError):
        normalize_email("a@@b.com")
```

## The AI loop
- Prompt the AI with your Kiro spec and your failing tests.
- Ask for only what's required to make tests pass.
- Keep edits localized; prefer small, reviewable diffs.
- Rerun tests. If they pass, refactor and re-run.

### Prompt template
```text
You are implementing code to satisfy the following Kiro spec. Do not change test semantics. Keep changes minimal and well-commented. If logic is ambiguous, ask for clarification.

<repo-context>
(language, framework, file paths)
</repo-context>

<tests>
{FAILING TEST OUTPUT OR TEST FILES}
</tests>
```

## Why this works
- Tests anchor intent; AI has a verifiable target.
- Small specs encourage decomposition and iteration.
- Tight loops limit overreach and hallucinations.

## Tooling suggestions
- Editor: VS Code/Cursor with GitHub Copilot / OpenAI.
- CI: run tests on each PR; gate merges on green.
- Guardrails: lint, type-checks, and mutation testing for spec strength.

## Common pitfalls
- Over-broad specs → sprawling diffs.
- Hidden constraints → passing tests but wrong behavior.
- Unstable tests → flaky loops and brittle prompts.

## Workflow checklist
- [ ] Write/trim Kiro spec to a single responsibility
- [ ] Convert to tests first
- [ ] Run tests (expect red)
- [ ] Ask AI to make only the changes needed
- [ ] Get green; refactor; re-run
- [ ] Update spec/tests as behavior evolves

---
If you adopt Kiro specs with TDD, you keep humans in control of the "what," and let AI accelerate the "how."