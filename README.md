# Async Job Processing Backend

A production-style asynchronous job processing system built with TypeScript (strict mode), Fastify, PostgreSQL, Redis, and BullMQ, featuring atomic state transitions, retry logic with exponential backoff, transactional consistency, and a minimal monitoring dashboard.

## Overview

This project implements a scalable backend architecture that separates request handling from background processing using a queue-based system.

It demonstrates:

Clean layered architecture

Strict TypeScript usage (no any)

Atomic state machine transitions

Transactional DB + queue consistency

Retry handling with backoff

Graceful shutdown

Rate limiting

Health checks

Interactive dashboard

___

### Architecture
```
Client (Next.js Dashboard)
        ↓
API Service (Fastify)
        ↓
PostgreSQL (Source of Truth)
        ↓
Redis (Queue Broker)
        ↓
Worker Service (BullMQ Consumer)
        ↓
PostgreSQL (State Updates)
```
### Core Principle

PostgreSQL is the only source of truth.
Redis is used purely as a transient message broker.

### How It Works
### 1️. Job Creation Flow

When a client submits a job:

API starts a database transaction

Inserts job into jobs table

Enqueues job ID into Redis (BullMQ)

Commits transaction only if enqueue succeeds

If enqueue fails → transaction rolls back
Prevents orphan jobs.

#### 2️. Job Processing Flow

Worker service:

Pulls job from Redis queue

Atomically updates status:
```
UPDATE jobs
SET status = 'RUNNING'
WHERE id = $1 AND status = 'QUEUED'

```

Executes background task

Updates status to:

COMPLETED

or FAILED (after retries exhausted)

#### Retry Logic

Managed by BullMQ

Configured with exponential backoff

Attempts tracked in DB

Automatically requeued if failure is transient

Marked FAILED when max attempts reached

### State Machine

Valid transitions enforced atomically:
```
QUEUED → RUNNING
RUNNING → COMPLETED
RUNNING → FAILED
FAILED → QUEUED (retry)
```
Illegal transitions are prevented at the SQL level.

No SELECT + UPDATE pattern used — atomic conditional updates prevent race conditions.

### Failure Handling
Redis Down

POST /jobs fails fast

GET endpoints continue working

DB remains consistent

DB Down

API returns 500

Health endpoint reports unhealthy

No system corruption

Worker Crash

BullMQ re-delivers job

Atomic transitions prevent state corruption

## Dashboard Features

Submit new job

Live polling updates

Expandable payload view

Filter by status

Search by Job ID

Status indicators

Smooth UI interactions

## ⚙ Tech Stack

TypeScript (strict mode)

Fastify

PostgreSQL

Redis

BullMQ

Next.js

Docker

Zod

Pino

## Hardening Features

Rate limiting

Structured logging

Graceful shutdown (SIGINT / SIGTERM)

Health checks for DB + Redis

Transactional boundaries

No unsafe casts

Strict type safety

## 📂 Project Structure

```
apps/
  api/        → Fastify API service
  worker/     → Background job processor
  web/        → Dashboard UI
packages/
  types/      → Shared TypeScript types
```
### Running Locally
1. Start Infrastructure
```
docker compose up -d
```
### 2. Start API
`
pnpm --filter @repo/api dev
`
### 3. Start Worker
`
pnpm --filter @repo/worker dev
`
### 4. Start Dashboard
`
pnpm --filter web dev
`
## Scalability Considerations

This architecture supports:

Horizontal scaling of workers

Independent scaling of API and worker

Queue-based load buffering

Retry with backoff

Future extension to:

Dead-letter queue

Priority queues

Metrics (Prometheus)

Distributed locking

Event-driven patterns

## Engineering Decisions

Postgres as durable state store

Redis only as transient broker

Atomic SQL updates to prevent race conditions

Transaction boundary around insert + enqueue

Explicit state machine enforcement

Separation of concerns (API vs Worker)
