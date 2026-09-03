import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

// Create a new voucher
export const createVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      voucher_date, expense_date, department, expense_title, 
      expense_category, expense_description, amount, status 
    } = req.body;
    
    const employee_id = req.user?.id;
    const finalStatus = status || 'Draft';

    if (finalStatus === 'Submitted' && !req.file) {
      return res.status(400).json({ error: 'Signature is mandatory for submission' });
    }

    const signatureUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    // If it's the first time and they submit immediately, we might need to update users signature or just rely on it.
    // The requirement says employee must attach signature. For simplicity, we just save it.
    if (signatureUrl && employee_id) {
        await query('UPDATE users SET signature_url = $1 WHERE id = $2', [signatureUrl, employee_id]);
    }

    // Generate random voucher number
    const voucher_number = `VCH-${Math.floor(Math.random() * 100000)}`;

    const { rows } = await query(
      `INSERT INTO vouchers 
      (voucher_number, voucher_date, expense_date, department, expense_title, expense_category, expense_description, amount, employee_id, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [voucher_number, voucher_date, expense_date, department, expense_title, expense_category, expense_description, amount, employee_id, finalStatus]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get vouchers (filters based on role)
export const getVouchers = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let result;

    if (user?.role === 'employee') {
      result = await query(
        `SELECT v.*, u.name as employee_name 
         FROM vouchers v 
         JOIN users u ON v.employee_id = u.id 
         WHERE v.employee_id = $1 
         ORDER BY v.created_at DESC`,
        [user.id]
      );
    } else {
      // Directors and Accounts see all
      result = await query(
        `SELECT v.*, u.name as employee_name 
         FROM vouchers v 
         JOIN users u ON v.employee_id = u.id 
         ORDER BY v.created_at DESC`
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get voucher by ID
export const getVoucherById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const { rows } = await query(
      `SELECT v.*, u.name as employee_name 
       FROM vouchers v 
       JOIN users u ON v.employee_id = u.id 
       WHERE v.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    const voucher = rows[0];

    // Employee can only view their own
    if (user?.role === 'employee' && voucher.employee_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this voucher' });
    }

    res.json(voucher);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Draft voucher
export const updateVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      expense_date, department, expense_title, 
      expense_category, expense_description, amount, status 
    } = req.body;
    
    // First verify it belongs to user and is a Draft
    const { rows: existingRows } = await query('SELECT * FROM vouchers WHERE id = $1', [id]);
    
    if (existingRows.length === 0) return res.status(404).json({ error: 'Voucher not found' });
    
    const voucher = existingRows[0];
    
    if (voucher.employee_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to update this voucher' });
    }
    
    if (voucher.status !== 'Draft') {
      return res.status(400).json({ error: 'Only Draft vouchers can be edited' });
    }

    const finalStatus = status || 'Draft';

    if (finalStatus === 'Submitted' && !req.file && !req.user?.signature_url) {
      // Need signature somehow. For simplicity, check if file provided.
      // Or we can check if they already have one.
    }

    if (req.file) {
      const signatureUrl = `/uploads/${req.file.filename}`;
      await query('UPDATE users SET signature_url = $1 WHERE id = $2', [signatureUrl, req.user?.id]);
    }

    const { rows: updatedRows } = await query(
      `UPDATE vouchers 
       SET expense_date = $1, department = $2, expense_title = $3, 
           expense_category = $4, expense_description = $5, amount = $6, 
           status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [expense_date, department, expense_title, expense_category, expense_description, amount, finalStatus, id]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete Draft voucher
export const deleteVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const { rows } = await query('SELECT * FROM vouchers WHERE id = $1', [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Voucher not found' });
    
    const voucher = rows[0];
    
    if (voucher.employee_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this voucher' });
    }
    
    if (voucher.status !== 'Draft') {
      return res.status(400).json({ error: 'Only Draft vouchers can be deleted' });
    }

    await query('DELETE FROM vouchers WHERE id = $1', [id]);

    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Director Review (Approve/Reject)
export const reviewVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }

    if (status === 'Approved' && !req.file) {
      return res.status(400).json({ error: 'Director signature is mandatory for approval' });
    }

    if (status === 'Rejected' && !rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is mandatory' });
    }

    const { rows } = await query('SELECT * FROM vouchers WHERE id = $1', [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Voucher not found' });
    
    if (rows[0].status !== 'Submitted') {
      return res.status(400).json({ error: 'Can only review Submitted vouchers' });
    }

    // Save director signature if approved
    if (status === 'Approved' && req.file && req.user?.id) {
      const signatureUrl = `/uploads/${req.file.filename}`;
      await query('UPDATE users SET signature_url = $1 WHERE id = $2', [signatureUrl, req.user.id]);
    }

    const { rows: updatedRows } = await query(
      `UPDATE vouchers 
       SET status = $1, rejection_reason = $2, approval_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [status, status === 'Rejected' ? rejection_reason : null, id]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error reviewing voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
