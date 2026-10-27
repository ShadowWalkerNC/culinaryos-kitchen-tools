# Contribute a kitchen workflow

Start with **Issues → New issue → Skill or prompt proposal**, or submit a pull request. Toolkit use needs no toolkit account; GitHub submissions require a GitHub account. Use synthetic examples and original material you can license under MIT. Do not upload resident information, restaurant records, credentials, executable archives or proprietary vendor instructions.

Propose the smallest useful addition. Include audience, ordinary-language trigger, required inputs, numbered steps, output, tool boundaries, approval needs, a worked example and a missing-data example. Record measurement assumptions, source versions, rounding and allergen states where relevant. Extend existing workflows before adding duplicates.

## Maintainer review before inclusion

1. Treat submissions as untrusted text. Read before using with an AI. Do not run uploaded commands, macros, scripts or installers. Reject secrets, executable payloads, hidden instructions, requests to bypass review, data exfiltration and unsupported authority claims. Inspect file types, size, encoding, links and changes in an isolated review checkout. No automatic installation.
2. Confirm original authorship, MIT permission and absence of copied vendor instructions or personal records. A service subscription does not convey ownership of instruction text.
3. Review the use case, calculations, missing-data behavior, tools and approvals. Clinical, allergen, food-safety and jurisdiction-specific guidance needs qualified/source-backed review.
4. Add independent numerical and adversarial cases where warranted. Run typecheck, tests, build, scenario and package checks. Separate designed cases from executed results. Review accepted code with the repository security process; text review or passing tests cannot certify malware-free files.
5. A maintainer approves the final change for a versioned release. An AI draft or issue attachment is never automatically an installed skill.

## Text proposal template

```text
Name / audience:
User says:
Required inputs and unresolved settings:
Steps:
Expected output:
Tools and fallback:
Approvals / external actions:
Worked example (synthetic):
Blocked example:
Sources / authorship / MIT permission:
```

Report problems with the client/version, workflow, synthetic prompt, expected/actual results and minimal reproduction steps. There is no arbitrary-file upload service or automatic contribution approval in this release.
