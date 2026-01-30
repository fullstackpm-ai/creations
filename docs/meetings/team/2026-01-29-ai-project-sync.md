# AI Project Sync - January 29, 2026

## Context
Technical sync on AI/LLM infrastructure and prospect chatbot development

## Attendees
Akshay Ghurye, Tim Crowe, Alessandro (ALM), Amog Iska

## Summary
- **Prospect chatbot handoff**: Amog ready to start immediately; Alessandro's design doc approved and merged
- **Thread management**: Threads scoped per conversation (like ChatGPT), not cross-thread context; prospect chat will be single thread (simple use case)
- **Guardrails architecture**: Classifiers (not LLM calls) filter message intent BEFORE LLM processing - checks if Ender-related, categorizes intent
- **Prompt management debate**: Current design has no free-flow LLM conversation - uses tool calls and classifiers; prompts will evolve as product requirements come in
- **MCP servers vs documents**: Reached alignment - MCP servers for capabilities/actions, documents for workflow guidance (agents don't strictly follow document workflows)
- **Database access for debugging**: Alessandro to build SQL query MCP server; Amog already started similar work locally

## Technical Architecture Insights

### Current Chatbot Flow
1. **Classifier** (not LLM) - determines intent: asking question? saying hi? clarifying? etc.
2. **Tool call** - if action needed, executes specific tool (not generic LLM)
3. **RAG retrieval** - fetches relevant docs/data
4. **LLM response** - only called to construct final response with retrieved context

### Key Design Principle
> "There is no free-flow conversation with an LLM at this point" - Alessandro

This architecture provides natural prompt injection protection since classifiers filter before LLM processing.

### MCP vs Documents Decision Framework
| Use Case | Approach |
|----------|----------|
| Capabilities/actions | MCP server |
| Information retrieval | MCP server with indexed examples |
| Workflow guidance | Documents (but expect loose adherence) |
| Domain knowledge | Documents referenced by MCP servers |

**Why MCP over documents for capabilities:**
- Agents consider tools on every turn (more natural interface)
- Documents get partially read, not referred back to
- Tool calls are more reliable than hoping agent follows document instructions

## Decisions
- Amog starts prospect chatbot implementation immediately
- Alessandro builds SQL query MCP server for debugging (high value)
- Tim to document MCP vs documents framework in codebase
- Prospect chatbot MVP: use Jessica's prompt, Amog interprets how to implement
- Maintenance chatbot v1: Tim deciding whether to do himself or delegate

## Action Items
- [ ] @Tim: Create tickets for Amog's prospect chatbot work
- [ ] @Tim: Document MCP server vs document decision framework (MD file in codebase)
- [ ] @Tim: Create ticket for Alessandro's SQL query MCP server
- [ ] @Tim: Decide on maintenance chatbot v1 approach
- [ ] @Amog: Start prospect chatbot implementation
- [ ] @Amog: Share draft PR for DB access work by EOD
- [ ] @Alessandro: Build SQL query MCP server with indexed SQL examples
- [ ] @Akshay: Deconstruct Jessica's chatbot prompt to show how product should spec AI requirements

## Follow-up Topics
- Bedrock guardrails integration (not yet incorporated into design)
- Prompt management system (deferred - premature to add now)
- How product should think about AI requirements (Akshay to document)

## Reflections
- Alessandro's architecture is more sophisticated than initially understood - classifiers provide natural guardrails
- "No free-flow LLM" is a key safety pattern - every message goes through intent classification first
- Agents don't strictly follow workflows even with BMAD-style documents - need to design for loose adherence
- MCP servers + documents is the right combo: capabilities as tools, guidance as docs
- Quick iteration is the goal - estimates will be less accurate but that's acceptable for AI work

---
*Documented: 2026-01-29*
