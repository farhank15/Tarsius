# Funds Transfer Module (XFRFUN) — Technical Specification v4.1

**Last updated:** 2017-04-15  
**Author:** Core Banking Documentation Group  
**Module:** XFRFUN (CICS/DB2 Inter-Account Funds Transfer)  
**Platform:** IBM z/OS CICS Transaction Server / DB2  

---

## 1. Overview

XFRFUN processes retail and corporate inter-account fund transfers initiated via branch teller counters, ATMs, or digital banking gateways. It coordinates debiting the origin account (`COMM-FACCNO`), crediting the target account (`COMM-TACCNO`), and logging the transaction to DB2 `PROCTRAN`.

**Entry point:** `XFRFUN(DFHCOMMAREA)` → sets `COMM-SUCCESS` (`Y`/`N`) and `COMM-FAIL-CODE`.

---

## 2. Validation & Security Controls

### 2.1 Non-Positive Transfer Amount
Transfers with amount `<= 0.00` are rejected immediately.
```
IF COMM-AMT <= 0 → REJECT (FAIL-CODE '4')
```

### 2.2 Same-Account Transfer Block
Transferring funds where source and target account numbers and sortcodes match is strictly prohibited and triggers an abend audit.
```
IF COMM-FACCNO = COMM-TACCNO AND COMM-FSCODE = COMM-TSCODE → ABEND ('SAME')
```

### 2.3 Suspended Account Enforcement
Under enterprise risk policy, accounts flagged with Status **S** (Suspended/Frozen) are strictly barred from participating in any funds movement.
```
IF FROM-STATUS = 'S' OR TO-STATUS = 'S' → REJECT (FAIL-CODE 'S')
```

> **Compliance Directive:** Under Section 4.1 of the Core Banking Risk Handbook, suspended accounts are completely frozen. No incoming or outgoing funds transfers may execute against a suspended account under any circumstance. No exceptions exist for suspended accounts under any transfer type. This rule aligns with anti-fraud controls and standard regulatory compliance policy.

*(This statement was true at the time of writing — but XFRFUN.cbl has since been modified to include an inbound merchant refund exception (RFIN) under Ticket CB-9102 / US Federal Regulation E 12 CFR § 1005. This documentation was never updated.)*

---

## 3. Transfer Type Handling

XFRFUN supports the following transfer types:

| Transfer Type | Code | Description |
|---------------|------|-------------|
| Standard Wire | WIRE | Standard domestic interbank wire transfer |
| In-Branch     | BRAN | Teller counter internal transfer |
| Direct Debit  | DDEB | Automated recurring payment debit |
| Merchant Refund | RFIN | Inbound consumer merchant refund |

All transfer types follow the uniform account suspension policy defined in Section 2.3.

---

## 4. Error Codes & Return Values

| Return Code | Flag | Description |
|-------------|------|-------------|
| Normal      | Y    | Transfer completed successfully |
| Code '1'    | N    | Account record not found in DB2 |
| Code '2'    | N    | Target credit failed; origin debit rolled back |
| Code '3'    | N    | DB2 deadlock or database update error |
| Code '4'    | N    | Invalid or non-positive amount |
| Code 'S'    | N    | Account suspended or frozen |

---

## 5. Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2017-04-15 | 4.1 | CB Doc Group | Uniform freeze policy enforced for all suspended accounts |
| 2014-08-10 | 4.0 | CB Architecture | CICS Web Services interface & DB2 V11 compliance |
| 2008-01-20 | 3.0 | Jon Collett | Initial CICS/DB2 baseline release |
