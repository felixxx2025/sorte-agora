# User Flows - SORTE AGORA

## User Journey Maps

### New User Registration Flow

```
┌─────────────┐
│ Landing Page│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Click "Criar│
│   Conta"    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Registration│
│    Form     │
│ - Email     │
│ - Password  │
│ - Phone     │
│ - CPF       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Email       │
│ Verification│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Welcome     │
│  Bonus      │
│  Claim      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### Login Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter       │
│ Credentials │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ MFA Check   │
│ (if enabled)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### Deposit Flow

```
┌─────────────┐
│ Click       │
│ "Depositar" │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select      │
│  Method     │
│ (PIX)       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter       │
│  Amount     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Generate    │
│  PIX QR     │
│   Code      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Scan & Pay  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Payment     │
│ Processing  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Deposit     │
│  Confirmed  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Bonus       │
│  Applied    │
└─────────────┘
```

### Casino Game Flow

```
┌─────────────┐
│ Casino      │
│   Lobby     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select Game │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Game Loading│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Game        │
│  Session    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Place Bets  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Game Results│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Balance     │
│  Updated    │
└─────────────┘
```

### Sports Betting Flow

```
┌─────────────┐
│ Sportsbook  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select      │
│   Event     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select      │
│   Market    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select      │
│  Selection  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Add to      │
│  Bet Slip   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter Stake │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Confirm     │
│    Bet      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Bet Placed  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Track Bet   │
│  in My Bets │
└─────────────┘
```

### Withdrawal Flow

```
┌─────────────┐
│ Click       │
│ "Sacar"     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Select      │
│  Method     │
│ (PIX)       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter       │
│  Amount     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter PIX   │
│    Key      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Confirm     │
│ Withdrawal  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Processing  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Withdrawal  │
│  Completed  │
└─────────────┘
```

### KYC Verification Flow

```
┌─────────────┐
│ Dashboard   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Click       │
│ "Verificar  │
│  Conta"     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Upload      │
│  Document   │
│ (Front)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Upload      │
│  Document   │
│ (Back)      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Upload      │
│   Selfie    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Upload      │
│ Proof of    │
│  Address   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Submit for │
│  Review    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Under       │
│  Review    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Approved /  │
│  Rejected   │
└─────────────┘
```

### VIP Progression Flow

```
┌─────────────┐
│ Play Games  │
│ / Place Bets│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Earn VIP    │
│   Points    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Complete    │
│  Missions   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Level Up    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Unlock      │
│  Rewards   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Higher      │
│ Cashback    │
└─────────────┘
```

## Error State Flows

### Payment Failed Flow

```
┌─────────────┐
│ Payment     │
│  Processing│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Payment     │
│   Failed    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Show Error  │
│  Message   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Retry       │
│  Payment   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Contact     │
│  Support   │
└─────────────┘
```

### Session Expired Flow

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Session     │
│  Expired   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Show Modal  │
│ "Session    │
│  Expired"  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Redirect to │
│   Login     │
└─────────────┘
```

## Admin Flows

### User Management Flow

```
┌─────────────┐
│ Admin       │
│ Dashboard  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Users       │
│   List     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Search User │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ View User   │
│  Profile   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Take Action │
│ - Ban       │
│ - Verify    │
│ - Adjust    │
└─────────────┘
```

### Financial Review Flow

```
┌─────────────┐
│ Admin       │
│ Dashboard  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Pending     │
│ Withdrawals│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Review      │
│  Request   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Approve /   │
│  Reject    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Process     │
│  Payment   │
└─────────────┘
```

## Mobile-Specific Flows

### Mobile Deposit Flow

```
┌─────────────┐
│ Bottom Nav  │
│ "Carteira"  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Deposit     │
│   Button   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PIX QR Code │
│  Display   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Copy & Paste│
│  PIX Code  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Open Bank   │
│    App     │
└─────────────┘
```

### Mobile Bet Slip Flow

```
┌─────────────┐
│ Add         │
│  Selection │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Bet Slip    │
│  Opens     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Swipe Up    │
│ to Expand  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Enter Stake │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Swipe to    │
│  Confirm   │
└─────────────┘
```

## Onboarding Flow

### First-Time User Flow

```
┌─────────────┐
│ Registration│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Welcome     │
│  Tour      │
│ (Optional) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Claim       │
│ Welcome     │
│  Bonus     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Make First  │
│  Deposit   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Explore    │
│  Casino    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Place First │
│    Bet     │
└─────────────┘
```

## Support Flow

### Contact Support Flow

```
┌─────────────┐
│ Click       │
│ "Ajuda"     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FAQ         │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Issue Not   │
│  Resolved? │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Live Chat   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Describe    │
│  Issue     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Agent       │
│  Responds  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Issue       │
│  Resolved  │
└─────────────┘
```

## Responsible Gaming Flow

### Self-Exclusion Flow

```
┌─────────────┐
│ Settings   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Responsible│
│   Gaming   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Set Limits  │
│ - Deposit   │
│ - Loss      │
│ - Session   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Self-      │
│ Exclusion  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Confirm     │
│  Period    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Account     │
│  Restricted│
└─────────────┘
```

## Affiliate Flow

### Affiliate Registration Flow

```
┌─────────────┐
│ Landing Page│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ "Torne-se   │
│  Afiliado"  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Application │
│    Form     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Review      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Approved    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Get Tracking│
│    Link     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Start       │
│  Promoting  │
└─────────────┘
```
