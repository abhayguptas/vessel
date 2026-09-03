import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, users, organizations, apiKeys } from '@vessel/db-client';
import { generateTokens, hashApiKey } from '@vessel/auth';
import { logger } from '@vessel/logger';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const updateOrgSchema = z.object({
  organizationName: z.string().min(2),
});

export async function getMe(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.sub;
    const orgId = req.user.org;

    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    const [org] = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, orgId));

    if (!user || !org) {
      res.status(404).json({ error: 'User or organization not found' });
      return;
    }

    res.json({ 
      user: {
        id: userId,
        email: user.email,
        role: req.user.role,
        organizationId: orgId,
        organizationName: org.name
      } 
    });
  } catch (error) {
    logger.error(`Error in getMe: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateOrganization(req: any, res: Response): Promise<void> {
  try {
    const data = updateOrgSchema.parse(req.body);
    const orgId = req.user.org;

    await db.update(organizations)
      .set({ name: data.organizationName, updatedAt: new Date() })
      .where(eq(organizations.id, orgId));

    res.json({ message: 'Organization updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    logger.error(`Update org error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create org and user in a transaction
    const result = await db.transaction(async (tx) => {
      const [org] = await tx.insert(organizations).values({
        name: data.organizationName,
      }).returning();

      const [user] = await tx.insert(users).values({
        organizationId: org.id,
        email: data.email,
        passwordHash,
        role: 'owner',
      }).returning();

      return { org, user };
    });

    logger.info(`User registered: ${result.user.id} in org ${result.org.id}`);

    const tokens = generateTokens({
      sub: result.user.id,
      org: result.org.id,
      role: result.user.role,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
      tokens,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const foundUsers = await db.select().from(users).where(eq(users.email, data.email));
    if (foundUsers.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = foundUsers[0];
    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const tokens = generateTokens({
      sub: user.id,
      org: user.organizationId,
      role: user.role,
    });

    res.status(200).json({ tokens });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listApiKeys(req: any, res: Response): Promise<void> {
  try {
    const orgId = req.user.org;
    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      createdAt: apiKeys.createdAt,
    }).from(apiKeys).where(eq(apiKeys.organizationId, orgId));
    res.json({ keys });
  } catch (error) {
    logger.error(`Error listing API keys: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function generateApiKey(req: any, res: Response): Promise<void> {
  try {
    const orgId = req.user.org;
    const rawKey = 'vessel_live_' + crypto.randomBytes(24).toString('hex');
    const hashedKey = hashApiKey(rawKey);

    const name = req.body.name || 'New API Key';

    const [newKey] = await db.insert(apiKeys).values({
      organizationId: orgId,
      name,
      prefix: 'vessel_live_',
      keyHash: hashedKey,
      keyType: 'live',
    }).returning();

    res.status(201).json({
      message: 'API Key generated successfully',
      key: {
        id: newKey.id,
        name: newKey.name,
        prefix: newKey.prefix,
        createdAt: newKey.createdAt,
      },
      rawKey, // Only show once
    });
  } catch (error) {
    logger.error(`Error generating API key: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}
