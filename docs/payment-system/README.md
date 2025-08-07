# AsyncSite Payment System Documentation

## 📋 Document Structure

### 🎯 Main Architecture Document
- **[PAYMENT_SYSTEM_V2_FINAL.md](./PAYMENT_SYSTEM_V2_FINAL.md)** - **✅ FINAL VERSION FOR BACKEND IMPLEMENTATION**
  - Final payment system architecture (Version 2.0.0)
  - Payment Core/Gateway separation without orchestrator
  - S2S verification flow
  - Transaction ID + Smart Polling strategy
  - MySQL schema design
  - Clean Architecture implementation guide

### 📚 Implementation Guides
실제 구현 시 참고할 문서들:

- **[implementation-guide/](./implementation-guide/)**
  - `TOSS_PAYMENTS_INTEGRATION_FLOW.md` - TossPayments SDK integration examples
  - `CURRENT_STUDY_PAYMENT_INTEGRATION.md` - Integration guide for existing study system
  - `FRONTEND_PAYMENT_FLOW.md` - Frontend UI/UX flow design

### 🗄️ Archive
초기 브레인스토밍 및 이전 버전 문서들:

- **[archive/](./archive/)**
  - `PAYMENT_SYSTEM_ARCHITECTURE.md` - Initial architecture design (deprecated)
  - `PAYMENT_IDEAS_BRAINSTORMING.md` - Future expansion ideas
  - `PAYMENT_STRATEGY_ROADMAP.md` - Business strategy roadmap
  - `README.md` - Old documentation index

## 🚀 Quick Start for Backend Implementation

1. **Read Main Architecture**: Start with `PAYMENT_SYSTEM_V2_FINAL.md`
2. **Review Implementation Guides**: Check SDK integration examples in `implementation-guide/`
3. **Follow Clean Architecture**: Implement as per Section 7 of main document
4. **Test with Polling Strategy**: Implement Section 9 for response handling

## 📊 Current Architecture Summary

```
Payment Core Service ←→ Payment Gateway Service
        ↓                        ↓
   Transaction DB          PG Adapters (Toss)
        ↓
  Provisioning Service
```

### Key Decisions:
- ✅ No Orchestrator (Option 2 from architecture discussion)
- ✅ S2S Verification only (no frontend purchase calls)
- ✅ MySQL over PostgreSQL
- ✅ Transaction ID + Smart Polling for async handling
- ✅ Exponential Backoff: 0s → 1s → 2s → 3s → 5s

## 📝 Version History
- **v2.0.0** (2024-11-25): Current version with Core/Gateway separation
- **v1.0.0**: Initial design (archived)

---

*For backend implementation, focus on `PAYMENT_SYSTEM_V2_FINAL.md` as the single source of truth.*