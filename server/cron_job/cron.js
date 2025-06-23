const cron = require("node-cron");
const { db } = require("../configuration/db");

cron.schedule("0 2 1 * *", async () => {
  try {
    console.log("🟢 Running monthly leave accrual job");

    const [employees] = await db.query(`SELECT id, emp_type_id FROM employee`);

    for (const emp of employees) {
      const [policies] = await db.query(
        `SELECT leave_type_id, accrual_per_month, max_days_per_year 
           FROM leave_policy 
           WHERE employee_type_id = ?`,
        [emp.emp_type_id]
      );

      for (const policy of policies) {
        const [existing] = await db.query(
          `SELECT id, total_leave 
             FROM leave_balance 
             WHERE employee_id = ? AND leave_type_id = ?`,
          [emp.id, policy.leave_type_id]
        );

        if (existing.length > 0) {
          const current = existing[0].total_leave;

          if (current < policy.max_days_per_year) {
            const leaveToAdd = Math.min(
              policy.accrual_per_month,
              policy.max_days_per_year - current
            );
            await db.query(
              `UPDATE leave_balance 
                 SET total_leave = total_leave + ? 
                 WHERE id = ?`,
              [leaveToAdd, existing[0].id]
            );
          }
        } else {
          const initial = Math.min(
            policy.accrual_per_month,
            policy.max_days_per_year
          );

          await db.query(
            `INSERT INTO leave_balance (employee_id, leave_type_id, total_leave) 
               VALUES (?, ?, ?)`,
            [emp.id, policy.leave_type_id, initial]
          );
        }
      }
    }
    console.log("✅ Leave accruals successfully applied.");
  } catch (err) {
    console.error("❌ Error during leave accrual job:", err.message);
  }
});
