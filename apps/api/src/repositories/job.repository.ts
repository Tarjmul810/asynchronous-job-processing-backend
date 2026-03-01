
import { PoolClient } from "pg";
import { randomUUID } from "crypto";
import { pool } from "../lib/db";
import { JobStatus } from "@repo/types";
import { stat } from "fs";

export const insertJob = async (client: PoolClient, payload: unknown): Promise<string> => {
  const id = randomUUID();

  await client.query(`
    INSERT INTO jobs (
      id,
      payload,
      status,
      attempts,
      max_attempts
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [id, payload, "QUEUED", 0, 3]);
  
  
  return id;
};

export const findJobById = async(id: unknown) => {
  const result = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [id]);

  return result.rows[0] ?? null
}

export const findJobs = async (
  status?: JobStatus,
  limit?: number ,
  offset?: number 

) => {
  const values: unknown[] = [];
  let query = `SELECT * FROM jobs`;
  
  if (status) {
    values.push(status);
    query += ` WHERE status = $1`;
  }

  values.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const result = await pool.query(query, values);

  return result.rows
}