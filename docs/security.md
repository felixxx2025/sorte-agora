# Security Guidelines - SORTE AGORA

## Security Overview

This document outlines the comprehensive security measures implemented in the SORTE AGORA platform.

## OWASP Top 10 Compliance

### 1. Broken Access Control
- **Implementation**: Role-based access control (RBAC)
- **Guards**: AuthGuard, RolesGuard
- **API Protection**: All endpoints protected by default
- **Resource Ownership**: User can only access their own data

### 2. Cryptographic Failures
- **Encryption**: AES-256 for sensitive data
- **Hashing**: bcrypt for passwords (cost factor 12)
- **TLS**: 1.3 for all communications
- **Key Management**: Environment variables + AWS KMS (production)

### 3. Injection
- **ORM**: Prisma (parameterized queries)
- **Input Validation**: class-validator + Zod
- **Sanitization**: DOMPurify for user-generated content
- **SQL Injection Prevention**: ORM-based queries only

### 4. Insecure Design
- **Threat Modeling**: Completed during design phase
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting**: Per-endpoint limits
- **Input Validation**: Strict validation on all inputs

### 5. Security Misconfiguration
- **Hardening**: Security-hardened Docker images
- **Secrets Management**: Environment variables, never in code
- **Error Handling**: Generic error messages to users
- **Logging**: Comprehensive security logging

### 6. Vulnerable Components
- **Dependency Scanning**: Snyk + Dependabot
- **Regular Updates**: Weekly dependency updates
- **Vulnerability Monitoring**: Automated alerts
- **SBOM**: Software Bill of Materials maintained

### 7. Authentication Failures
- **MFA**: TOTP-based (Google Authenticator)
- **Session Management**: JWT with short expiration
- **Password Policy**: Minimum 12 chars, complexity required
- **Account Lockout**: After 5 failed attempts

### 8. Software & Data Integrity Failures
- **Code Signing**: All releases signed
- **CI/CD Security**: Branch protection, required reviews
- **Supply Chain**: Verified package sources
- **Backup Verification**: Regular integrity checks

### 9. Security Logging & Monitoring
- **Audit Trail**: All sensitive actions logged
- **Immutable Logs**: WORM storage for audit logs
- **Real-time Alerts**: Suspicious activity detection
- **SIEM Integration**: Security events sent to SIEM

### 10. Server-Side Request Forgery (SSRF)
- **Network Segmentation**: Backend cannot access internal network
- **URL Validation**: Strict allowlist for external URLs
- **Outbound Filtering**: Firewall rules for outbound traffic

## LGPD Compliance

### Data Collection
- **Consent**: Explicit consent required
- **Purpose**: Clearly stated purpose
- **Minimization**: Only collect necessary data
- **Transparency**: Privacy policy accessible

### Data Processing
- **Lawful Basis**: Consent, contract, legal obligation
- **Data Retention**: Minimum retention periods
- **Data Quality**: Accurate and up-to-date
- **Security**: Appropriate technical measures

### Data Subject Rights
- **Access**: Users can request their data
- **Correction**: Users can correct inaccurate data
- **Deletion**: Right to be forgotten (within legal limits)
- **Portability**: Data export available
- **Objection**: Users can object to processing

### Data Transfers
- **International**: Only to GDPR-compliant countries
- **Security**: Adequate protection measures
- **Contracts**: Standard contractual clauses

### Breach Notification
- **Timeline**: Within 72 hours of discovery
- **Authority**: ANPD notification
- **Affected**: Notify affected individuals
- **Documentation**: Maintain breach records

## Anti-Fraud System

### Fraud Detection Rules

```typescript
// Fraud detection rules
const FRAUD_RULES = {
  // Multiple accounts from same IP
  MULTIPLE_ACCOUNTS_SAME_IP: {
    threshold: 3,
    window: '1h',
    action: 'FLAG',
  },
  
  // Suspicious deposit patterns
  RAPID_DEPOSITS: {
    threshold: 5,
    window: '10m',
    action: 'BLOCK',
  },
  
  // Bonus abuse
  BONUS_ABUSE: {
    threshold: 10,
    window: '24h',
    action: 'REVIEW',
  },
  
  // Unusual betting patterns
  UNUSUAL_BETTING: {
    threshold: 3,
    window: '1h',
    action: 'FLAG',
  },
  
  // VPN/Proxy detection
  VPN_DETECTED: {
    action: 'REQUIRE_KYC',
  },
};
```

### Machine Learning Fraud Detection

```typescript
// ML-based fraud detection
@Injectable()
export class FraudDetectionService {
  async analyzeTransaction(transaction: Transaction): Promise<FraudScore> {
    const features = this.extractFeatures(transaction);
    const score = await this.mlModel.predict(features);
    
    if (score.risk > 0.8) {
      await this.blockTransaction(transaction.id);
      await this.notifySecurityTeam(transaction);
    }
    
    return score;
  }
  
  private extractFeatures(transaction: Transaction): FeatureVector {
    return {
      amount: transaction.amount,
      timeOfDay: new Date().getHours(),
      userAge: this.getUserAge(transaction.userId),
      transactionHistory: this.getUserTransactionHistory(transaction.userId),
      deviceFingerprint: this.getDeviceFingerprint(transaction.userId),
      ipReputation: this.getIpReputation(transaction.ipAddress),
    };
  }
}
```

## Anti-Bot System

### Bot Detection

```typescript
// Bot detection middleware
@Injectable()
export class AntiBotGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check rate limiting
    const isRateLimited = await this.rateLimitService.checkLimit(
      request.ip,
      100,
      60
    );
    
    if (isRateLimited) {
      throw new TooManyRequestsException();
    }
    
    // Check for bot signatures
    const isBot = this.detectBot(request);
    if (isBot) {
      await this.securityEventService.logEvent({
        type: 'BOT_DETECTED',
        severity: 'HIGH',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });
      return false;
    }
    
    // Challenge for suspicious requests
    if (await this.isSuspicious(request)) {
      return this.challengeService.presentChallenge(request);
    }
    
    return true;
  }
  
  private detectBot(request: Request): boolean {
    const botSignatures = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ];
    
    const userAgent = request.headers['user-agent'] || '';
    return botSignatures.some(sig => sig.test(userAgent));
  }
}
```

### CAPTCHA Integration

```typescript
// reCAPTCHA integration
@Injectable()
export class CaptchaService {
  async verifyToken(token: string): Promise<boolean> {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );
    
    return response.data.success && response.data.score > 0.5;
  }
}
```

## Rate Limiting

### Redis-based Rate Limiting

```typescript
@Injectable()
export class RateLimitService {
  constructor(private redis: Redis) {}
  
  async checkLimit(
    identifier: string,
    limit: number,
    window: number
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current <= limit;
  }
  
  async getRemaining(identifier: string, limit: number): Promise<number> {
    const key = `rate_limit:${identifier}`;
    const current = parseInt(await this.redis.get(key) || '0');
    return Math.max(0, limit - current);
  }
}
```

### Rate Limiting Strategy

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| POST /auth/login | 5 | 1 min | IP |
| POST /auth/register | 3 | 1 hour | IP |
| POST /financial/deposit | 10 | 1 min | User |
| POST /casino/bet | 100 | 1 min | User |
| POST /sports/bet | 50 | 1 min | User |
| GET /api/* | 1000 | 1 min | IP |

## Audit Logging

### Immutable Audit Logs

```typescript
@Injectable()
export class AuditLogService {
  async logEvent(event: AuditEvent): Promise<void> {
    const log = {
      id: cuid(),
      ...event,
      timestamp: new Date(),
      hash: this.generateHash(event),
    };
    
    // Write to WORM storage
    await this.wormStorage.write(log);
    
    // Also write to database for querying
    await this.prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        ipAddress: event.ipAddress,
        metadata: event.metadata,
      },
    });
  }
  
  private generateHash(event: AuditEvent): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(event))
      .digest('hex');
  }
}
```

### Audit Event Types

```typescript
enum AuditEventType {
  // Authentication
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  
  // Financial
  DEPOSIT_CREATED = 'DEPOSIT_CREATED',
  DEPOSIT_COMPLETED = 'DEPOSIT_COMPLETED',
  WITHDRAWAL_REQUESTED = 'WITHDRAWAL_REQUESTED',
  WITHDRAWAL_PROCESSED = 'WITHDRAWAL_PROCESSED',
  
  // Gaming
  BET_PLACED = 'BET_PLACED',
  BET_SETTLED = 'BET_SETTLED',
  GAME_SESSION_STARTED = 'GAME_SESSION_STARTED',
  GAME_SESSION_ENDED = 'GAME_SESSION_ENDED',
  
  // Admin
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  BONUS_CREATED = 'BONUS_CREATED',
  
  // Security
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

## Password Security

### Password Policy

```typescript
const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    /password/i,
    /123456/,
    /qwerty/i,
  ],
  commonPasswords: new Set([
    'password',
    '123456',
    'qwerty',
    // ... more common passwords
  ]),
};
```

### Password Hashing

```typescript
@Injectable()
export class PasswordService {
  private saltRounds = 12;
  
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  async validateStrength(password: string): Promise<ValidationResult> {
    const errors: string[] = [];
    
    if (password.length < PASSWORD_POLICY.minLength) {
      errors.push('Password too short');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain number');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain special character');
    }
    
    if (PASSWORD_POLICY.commonPasswords.has(password.toLowerCase())) {
      errors.push('Password is too common');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

## API Security

### API Key Management

```typescript
@Injectable()
export class ApiKeyService {
  async generateApiKey(userId: string): Promise<ApiKey> {
    const apiKey = this.generateSecureKey();
    const hashedKey = await this.hash(apiKey);
    
    return this.prisma.apiKey.create({
      data: {
        userId,
        hashedKey,
        name: `API Key ${new Date().toISOString()}`,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  }
  
  private generateSecureKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  async verifyApiKey(apiKey: string): Promise<User | null> {
    const hashedKey = await this.hash(apiKey);
    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { hashedKey },
      include: { user: true },
    });
    
    if (!keyRecord || !keyRecord.isActive || keyRecord.expiresAt < new Date()) {
      return null;
    }
    
    return keyRecord.user;
  }
}
```

### Request Signing

```typescript
@Injectable()
export class RequestSigningService {
  signRequest(data: any, secret: string): string {
    const timestamp = Date.now();
    const payload = JSON.stringify({ ...data, timestamp });
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return `${timestamp}.${signature}`;
  }
  
  verifyRequest(data: any, signature: string, secret: string): boolean {
    const [timestamp, sig] = signature.split('.');
    const age = Date.now() - parseInt(timestamp);
    
    if (age > 300000) { // 5 minutes
      return false;
    }
    
    const payload = JSON.stringify({ ...data, timestamp });
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return sig === expectedSig;
  }
}
```

## Data Encryption

### Sensitive Data Encryption

```typescript
@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  private ivLength = 16;
  private authTagLength = 16;
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    const combined = [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted,
    ].join('.');
    
    return Buffer.from(combined).toString('base64');
  }
  
  decrypt(encrypted: string): string {
    const combined = Buffer.from(encrypted, 'base64').toString();
    const [ivHex, authTagHex, encryptedHex] = combined.split('.');
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Security Headers

### HTTP Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self';
              connect-src 'self' https:;
              frame-src 'self' https:;
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'self';
              block-all-mixed-content;
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          },
        ],
      },
    ];
  },
};
```

## Security Monitoring

### Real-time Security Alerts

```typescript
@Injectable()
export class SecurityMonitoringService {
  @OnEvent('security.event')
  async handleSecurityEvent(event: SecurityEvent) {
    // High severity events trigger immediate alerts
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      await this.sendAlert(event);
    }
    
    // Log to SIEM
    await this.sendToSIEM(event);
    
    // Update metrics
    this.metricsService.incrementSecurityEvent(event.type, event.severity);
  }
  
  private async sendAlert(event: SecurityEvent): Promise<void> {
    await this.notificationService.send({
      channel: 'security',
      message: `Security Alert: ${event.type}`,
      details: event,
      priority: event.severity === 'CRITICAL' ? 'P1' : 'P2',
    });
  }
  
  private async sendToSIEM(event: SecurityEvent): Promise<void> {
    await this.siemClient.send({
      timestamp: event.timestamp,
      severity: event.severity,
      type: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      metadata: event.metadata,
    });
  }
}
```

## Incident Response

### Incident Response Plan

1. **Detection**
   - Automated monitoring alerts
   - User reports
   - Security team review

2. **Containment**
   - Isolate affected systems
   - Block malicious IPs
   - Suspend suspicious accounts

3. **Eradication**
   - Remove malicious code
   - Patch vulnerabilities
   - Update security rules

4. **Recovery**
   - Restore from clean backups
   - Verify system integrity
   - Resume normal operations

5. **Lessons Learned**
   - Post-incident review
   - Update procedures
   - Improve monitoring

## Security Testing

### Regular Security Assessments

- **Penetration Testing**: Quarterly
- **Vulnerability Scanning**: Weekly
- **Code Review**: All changes
- **Dependency Scanning**: Daily
- **Security Training**: Monthly for developers

### Security Checklist

- [ ] All endpoints authenticated
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Output encoding enabled
- [ ] Error handling secure
- [ ] Logging comprehensive
- [ ] Secrets managed properly
- [ ] Dependencies up-to-date
- [ ] Security headers configured
- [ ] TLS enabled everywhere
- [ ] Backup encryption enabled
- [ ] Incident response plan tested
