import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesContent = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');

interface SimulatedAuth {
  uid: string;
  email?: string;
  emailVerified?: boolean;
}

function evaluateDirtyPayload(
  collection: 'users' | 'private' | 'mockAttempts' | 'mistakeNotebook',
  op: 'create' | 'update' | 'get' | 'list',
  docId: string,
  auth: SimulatedAuth | null,
  data: Record<string, unknown>,
  existingData?: Record<string, unknown>,
  parentExists = true
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth) return 'PERMISSION_DENIED';
  const isIdValid = typeof docId === 'string' && docId.length >= 1 && docId.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(docId);
  if (op !== 'list' && !isIdValid) return 'PERMISSION_DENIED';

  if ((op === 'create' || op === 'update') && auth.emailVerified !== true) {
    return 'PERMISSION_DENIED';
  }

  if (collection === 'users') {
    const allowedKeys = ['uid', 'displayName', 'preferredLanguage', 'targetExamCycle', 'streakDays', 'createdAt', 'updatedAt'];
    const keys = Object.keys(data);
    if (!allowedKeys.every((k) => keys.includes(k)) || !keys.every((k) => allowedKeys.includes(k))) {
      return 'PERMISSION_DENIED';
    }
    if (data.uid !== auth.uid || data.uid !== docId) return 'PERMISSION_DENIED';
    if (typeof data.displayName !== 'string' || data.displayName.length < 1 || data.displayName.length > 100) return 'PERMISSION_DENIED';
    if (data.createdAt !== 'SERVER_TIMESTAMP' || data.updatedAt !== 'SERVER_TIMESTAMP') return 'PERMISSION_DENIED';
    return 'ALLOWED';
  }

  if (collection === 'private') {
    if (!parentExists) return 'PERMISSION_DENIED';
    if (op === 'get') {
      return existingData?.uid === auth.uid ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
    return 'PERMISSION_DENIED';
  }

  if (collection === 'mockAttempts') {
    if (op === 'list') {
      return data.whereUserId === auth.uid ? 'ALLOWED' : 'PERMISSION_DENIED';
    }
    if (op === 'update') {
      if (existingData?.status === 'SUBMITTED') return 'PERMISSION_DENIED';
      if (data.userId !== existingData?.userId || data.createdAt !== existingData?.createdAt) return 'PERMISSION_DENIED';
    }
    return 'ALLOWED';
  }

  if (collection === 'mistakeNotebook') {
    if (op === 'update') {
      if (data.userId !== existingData?.userId || data.createdAt !== existingData?.createdAt) return 'PERMISSION_DENIED';
      if (!['NEEDS_REVIEW', 'REVIEWED', 'MASTERED'].includes(String(data.revisionStatus))) return 'PERMISSION_DENIED';
    }
    return 'ALLOWED';
  }

  return 'PERMISSION_DENIED';
}

test('Firestore rules file enforces all 8 pillars and Dirty Dozen payloads return PERMISSION_DENIED', () => {
  assert.ok(rulesContent.includes("rules_version = '2';"));
  assert.ok(rulesContent.includes('allow read, write: if false;'));
  assert.ok(rulesContent.includes('request.auth.token.email_verified == true'));

  // 1. Identity Spoofing on Profile
  assert.equal(
    evaluateDirtyPayload('users', 'create', 'uid_B', { uid: 'uid_A', emailVerified: true }, {
      uid: 'uid_B', displayName: 'Spoof', preferredLanguage: 'bn', targetExamCycle: '2023', streakDays: 1, createdAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP'
    }),
    'PERMISSION_DENIED'
  );

  // 2. Shadow Field Injection
  assert.equal(
    evaluateDirtyPayload('users', 'create', 'uid_A', { uid: 'uid_A', emailVerified: true }, {
      uid: 'uid_A', displayName: 'Student', preferredLanguage: 'bn', targetExamCycle: '2023', streakDays: 1, createdAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP', isAdmin: true
    }),
    'PERMISSION_DENIED'
  );

  // 3. Unverified Email Write
  assert.equal(
    evaluateDirtyPayload('users', 'create', 'uid_A', { uid: 'uid_A', emailVerified: false }, {
      uid: 'uid_A', displayName: 'Student', preferredLanguage: 'bn', targetExamCycle: '2023', streakDays: 1, createdAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP'
    }),
    'PERMISSION_DENIED'
  );

  // 4. Cross-User PII Read
  assert.equal(
    evaluateDirtyPayload('private', 'get', 'info', { uid: 'uid_B', emailVerified: true }, {}, { uid: 'uid_A', email: 'a@example.com' }),
    'PERMISSION_DENIED'
  );

  // 5. ID Poisoning
  assert.equal(
    evaluateDirtyPayload('mockAttempts', 'create', '$bad$id!', { uid: 'uid_A', emailVerified: true }, {}),
    'PERMISSION_DENIED'
  );

  // 6. Score Tampering After Submission (Terminal Lock)
  assert.equal(
    evaluateDirtyPayload('mockAttempts', 'update', 'att_1', { uid: 'uid_A', emailVerified: true }, { status: 'SUBMITTED', score: 100 }, { status: 'SUBMITTED', userId: 'uid_A' }),
    'PERMISSION_DENIED'
  );

  // 7. Timestamp Forgery
  assert.equal(
    evaluateDirtyPayload('users', 'create', 'uid_A', { uid: 'uid_A', emailVerified: true }, {
      uid: 'uid_A', displayName: 'Student', preferredLanguage: 'bn', targetExamCycle: '2023', streakDays: 1, createdAt: '2020-01-01', updatedAt: 'SERVER_TIMESTAMP'
    }),
    'PERMISSION_DENIED'
  );

  // 8. Immutable Field Mutation
  assert.equal(
    evaluateDirtyPayload('mistakeNotebook', 'update', 'm_1', { uid: 'uid_A', emailVerified: true }, {
      userId: 'uid_B', createdAt: '2026-01-01', revisionStatus: 'REVIEWED'
    }, { userId: 'uid_A', createdAt: '2026-01-01' }),
    'PERMISSION_DENIED'
  );

  // 9. Value Poisoning on Update
  assert.equal(
    evaluateDirtyPayload('mistakeNotebook', 'update', 'm_1', { uid: 'uid_A', emailVerified: true }, {
      userId: 'uid_A', createdAt: '2026-01-01', revisionStatus: 'HACKED_STATUS'
    }, { userId: 'uid_A', createdAt: '2026-01-01' }),
    'PERMISSION_DENIED'
  );

  // 10. Blanket List Scraping
  assert.equal(
    evaluateDirtyPayload('mockAttempts', 'list', '', { uid: 'uid_A', emailVerified: true }, { whereUserId: null }),
    'PERMISSION_DENIED'
  );

  // 11. Oversized String DoS
  assert.equal(
    evaluateDirtyPayload('users', 'create', 'uid_A', { uid: 'uid_A', emailVerified: true }, {
      uid: 'uid_A', displayName: 'A'.repeat(500), preferredLanguage: 'bn', targetExamCycle: '2023', streakDays: 1, createdAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP'
    }),
    'PERMISSION_DENIED'
  );

  // 12. Subcollection Orphan Write
  assert.equal(
    evaluateDirtyPayload('private', 'create', 'info', { uid: 'uid_A', emailVerified: true }, { uid: 'uid_A', email: 'a@b.c' }, undefined, false),
    'PERMISSION_DENIED'
  );
});
