# Order Validation Module — Technical Specification v3.2

**Last updated:** 2015-01-10
**Author:** Documentation Team
**Module:** ORDVAL (Order Validation)

---

## 1. Overview

ORDVAL validates customer orders before they enter the fulfillment pipeline.
The module checks account status, order type, and pricing rules.

**Entry point:** `ORDVAL(pCustId, pOrderType, pOrderAmt)` → returns `A` (approved) or `R` (rejected)

---

## 2. Account Status Validation

### 2.1 Cancelled Accounts

Accounts with status **C** (Cancelled) are **rejected** for all order types.

```
IF custStatus = 'C' → REJECT
```

### 2.2 Suspended Accounts

Accounts with status **S** (Suspended) are **rejected** for all order types.

```
IF custStatus = 'S' → REJECT
```

> **Note:** This rule applies universally. No exceptions exist for suspended accounts under any order type. This aligns with standard banking regulations and internal compliance policy.

*(This statement was true at the time of writing — but ORDVAL.rpgle has since been modified to include a DISC order exception under CS-4471. This documentation was never updated.)*

---

## 3. Pricing Rules

### 3.1 Standard Pricing

Standard pricing applies to all active accounts based on current PRICING file rates.

### 3.2 Legacy Pricing

Legacy plan migrations were **retired as of 2012**. All customers on legacy plans must be migrated to current pricing tables.

> **Note:** Special pricing arrangements for Plan 7 customers are no longer supported. Any remaining legacy plan codes should default to standard pricing.

*(This statement contradicts actual ORDVAL.rpgle code, which still contains locked-in pricing for Plan 7 per class action settlement 2009-CV-118.)*

---

## 4. Order Type Handling

ORDVAL supports the following order types:

| Order Type | Code | Description |
|-----------|------|-------------|
| Standard   | STND | Regular customer orders |
| Discount   | DISC | Discounted promotional orders |
| Express    | EXPR | Expedited shipping orders |
| Corporate  | CORP | Business-to-business orders |

All order types follow the same account validation rules defined in Section 2.

---

## 5. Error Handling

ORDVAL returns `R` for any validation failure and `A` for successful validation.

---

## 6. Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2015-01-10 | 3.2 | Doc Team | Updated suspended account policy — all suspended accounts uniformly blocked |
| 2012-11-15 | 3.1 | Doc Team | Removed legacy plan pricing — migrations retired |
| 2010-06-01 | 3.0 | Doc Team | Initial post-migration documentation |
