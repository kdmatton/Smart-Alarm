const alarmService = require('../services/alarm')

const createAlarm = async (req,res) => {
    const {alarm_time, day_of_week} = req.body
    const userId = req.user.id // user contains email, userID, this is becayse we do requireAuth and store it inMemory
    
    try {
        const alarm = alarmService.createAlarm(userId, alarm_time, day_of_week)
        return res.status(201).json({message: 'Alarm Created'})
    } catch (err) {
        if(err === 'Alarm_Time_Taken'){
            return res.status(409).json({message: err.message})
        }
        return res.status(500).json({message: "Something Went Wrong. Try again"})
    }
    
}

module.exports = {createAlarm}