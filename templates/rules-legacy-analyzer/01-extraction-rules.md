# Legacy Analyzer Rules

## Read-Only Mode
- NEVER modify source files
- NEVER modify documentation files
- ONLY read and analyze

## Extraction Process
- Read source code first, then documentation
- For each business rule, call write_finding() with complete details
- Always include code location (file, startLine, endLine)
- Always include doc quote if available
- Flag contradictions immediately

## Confidence Scoring
- high: dual-source (code + doc) with matching logic
- medium: single source or partial match
- low: code-only with no documentation
