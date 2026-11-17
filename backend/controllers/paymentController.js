const { query, transaction } = require("../config/db");

// @desc    Get client payments from view_payment_summaries
// @route   GET /api/payments/client
// @access  Client only
const getClientPayments = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM view_payment_summaries
      WHERE client_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await query(sql, [req.user.id]);

    const totalSpent = rows
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return res.status(200).json({
      success: true,
      count: rows.length,
      totalSpent,
      payments: rows
    });
  } catch (error) {
    console.error("Get client payments error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching payments" });
  }
};

// @desc    Get freelancer earnings from view_payment_summaries
// @route   GET /api/payments/freelancer
// @access  Freelancer only
const getFreelancerEarnings = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM view_payment_summaries
      WHERE freelancer_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await query(sql, [req.user.id]);

    const totalEarned = rows
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return res.status(200).json({
      success: true,
      count: rows.length,
      totalEarned,
      earnings: rows
    });
  } catch (error) {
    console.error("Get freelancer earnings error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching earnings" });
  }
};

// @desc    Process a new payment (Client only) with ACID SQL Transaction
// @route   POST /api/payments
// @access  Client only
const createPayment = async (req, res) => {
  try {
    const { projectId, freelancerId, milestoneId, amount, paymentMethod = "UPI" } = req.body;

    if (!projectId || !freelancerId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Project ID, Freelancer ID, and amount are required."
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero."
      });
    }

    const txnRef = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Advanced SQL Concept: Multi-table ACID Transaction
    const payment = await transaction(async (txQuery) => {
      // 1. Insert Payment
      const payRes = await txQuery(
        `INSERT INTO payments 
         (project_id, client_id, freelancer_id, milestone_id, amount, payment_method, transaction_reference, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
         RETURNING *;`,
        [
          projectId,
          req.user.id,
          freelancerId,
          milestoneId || null,
          Number(amount),
          paymentMethod,
          txnRef
        ]
      );
      const newPay = payRes.rows[0];

      // 2. Update Client Profile total_spent
      await txQuery(
        `UPDATE client_profiles 
         SET total_spent = total_spent + $1 
         WHERE user_id = $2;`,
        [Number(amount), req.user.id]
      );

      // 3. Update Freelancer Profile total_earnings
      await txQuery(
        `UPDATE freelancer_profiles 
         SET total_earnings = total_earnings + $1 
         WHERE user_id = $2;`,
        [Number(amount), freelancerId]
      );

      // 4. If milestone linked, mark it as 'paid'
      if (milestoneId) {
        await txQuery(
          "UPDATE milestones SET status = 'paid' WHERE id = $1;",
          [milestoneId]
        );
      }

      // 5. Send notification to freelancer
      await txQuery(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, 'Payment Received', $2, 'payment', '/freelancer/earnings');`,
        [
          freelancerId,
          `Payment of $${Number(amount).toFixed(2)} has been deposited into your account via ${paymentMethod}.`
        ]
      );

      // 6. Record audit log
      await txQuery(
        `INSERT INTO audit_logs (entity_type, entity_id, action, details)
         VALUES ('payment', $1, 'PAYMENT_COMPLETED', $2);`,
        [
          newPay.id,
          `Transaction ${txnRef}: $${Number(amount).toFixed(2)} paid from Client #${req.user.id} to Freelancer #${freelancerId}`
        ]
      );

      return newPay;
    });

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully!",
      payment
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error processing payment"
    });
  }
};

module.exports = {
  getClientPayments,
  getFreelancerEarnings,
  createPayment
};
