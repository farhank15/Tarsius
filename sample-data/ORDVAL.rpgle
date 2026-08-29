      *================================================================
      * ORDVAL — Order Validation Module
      * Last modified: 2015-03-22 by J. Hendricks
      * Purpose: Validates customer orders before processing
      * External deps: CUSTMAST, ORDHIST files
      *================================================================
       D ORDVAL           PR                  EXTPGM('ORDVAL')
       D  pCustId                       10A   CONST
       D  pOrderType                     4A   CONST
       D  pOrderAmt                      9P 2 CONST
       D  pResult                        1A

       D ORDVAL           PI
       D  pCustId                       10A   CONST
       D  pOrderType                     4A   CONST
       D  pOrderAmt                      9P 2 CONST
       D  pResult                        1A

      *----------------------------------------------------------------
      * Local variables
      *----------------------------------------------------------------
       D custStatus        S              1A
       D suspendedFlag     S              1A
       D discTypeFlag      S              1A
       D planId            S              5A
       D basePrice         S              9P 2
       D wsResult          S              1A

      *================================================================
      * Main logic
      *================================================================
       C                   EVAL      wsResult = 'A'
       C                   EXSR      $GETCUST
       C                   EXSR      $CHKSTATUS
       C                   EXSR      $CALCPRICE
       C                   EVAL      pResult = wsResult
       C                   RETURN

      *================================================================
      * $GETCUST — Retrieve customer master data
      *================================================================
       C     $GETCUST      BEGSR
       C                   KEYVLR    CUSTMAST     pCustId                   91
       C                   EXFMT     CUSTMAST                               92
       C                   MOVEL     CMSTAT       custStatus                93
       C                   MOVEL     CMSUSPND     suspendedFlag              94
       C                   MOVEL     CMPLAN       planId                    95
       C                   ENDSR

      *================================================================
      * $CHKSTATUS — Validate account status
      * BR-CANCELLED-BLOCK: Cancelled (C) accounts cannot submit orders
      * Source: Code + Doc (agreed) — explicit from spec v3.2
      *================================================================
       C     $CHKSTATUS    BEGSR
       C                   IF        custStatus = 'C'
       C                   EVAL      wsResult = 'R'
       C                   RETURN
       C                   ENDIF

      *================================================================
      * BR-SUSPENDED-BLOCK: Suspended (S) accounts blocked from orders
      * Source: Code + Doc (agreed) — explicit from spec v3.2
      *================================================================
       C                   IF        custStatus = 'S'
       C                   EVAL      wsResult = 'R'
       C                   RETURN
       C                   ENDIF

      *================================================================
      * BR-DISC-EXCEPTION: Suspended accounts MAY submit DISC orders
      * Source: CODE ONLY — this exception is NOT in the documentation
      * Reason: Ticket CS-4471 (2010 class action settlement)
      * Note: Doc says suspended accounts are always blocked, but
      *       ORDVAL has this exception. DO NOT REMOVE without legal.
      *================================================================
       C                   IF        suspendedFlag = 'Y'
       C                   AND       pOrderType = 'DISC'
       C                   EVAL      wsResult = 'A'
       C                   RETURN
       C                   ENDIF

      *================================================================
      * Default: reject silent
      *================================================================
       C                   EVAL      wsResult = 'R'
       C                   ENDSR

      *================================================================
      * $CALCPRICE — Calculate order pricing
      * BR-GRANDFATHER-PRICING: Plan-7 customers MUST get locked-in
      * pricing regardless of current price tables.
      * Source: CODE ONLY — undocumented, class action 2009-CV-118
      *================================================================
       C     $CALCPRICE    BEGSR
       C                   IF        planId = 'PLAN7'
      * Class action settlement 2009-CV-118 — locked pricing applies
       C                   EXSR      $GETLEGACYPRICE
       C                   ELSE
       C                   EXSR      $GETSTDPRICE
       C                   ENDIF
       C                   ENDSR

      *================================================================
      * $GETLEGACYPRICE — Legacy pricing for grandfathered plans
      *================================================================
       C     $GETLEGACYPRICE BEGSR
       C                   KEYVLR    PRICING      planId
       C                   EXFMT     PRICING
       C                   MOVEL     PRLEGACY     basePrice
       C                   ENDSR

      *================================================================
      * $GETSTDPRICE — Standard pricing
      *================================================================
       C     $GETSTDPRICE  BEGSR
       C                   KEYVLR    PRICING      planId
       C                   EXFMT     PRICING
       C                   MOVEL     PRSTDPRICE   basePrice
       C                   ENDSR
