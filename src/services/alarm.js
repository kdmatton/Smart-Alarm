const db = require('../config/db')

async function createAlarm(userId, alarm_time, day_of_week) {
    try {
        const result = await db.query(
            `INSERT INTO alarms (user_id, alarm_time, day_of_week)
             VALUES ($1, $2, $3)
             RETURNING alarm_id, user_id, alarm_time, day_of_week, is_enabled`,
            [userId, alarm_time, day_of_week]
        )
        return result.rows[0]
    } catch (err) {
        if (err.code === '23505') {
            const takenError = new Error('Alarm already exists for that time')
            takenError.code = 'Alarm_Time_Taken'
            throw takenError
        }
        throw err
    }
}

module.exports = { createAlarm }
