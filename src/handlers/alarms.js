const { user } = require('pg/lib/defaults')
const alarmService = require('../services/alarm')
/*
create the alarm
*/
const createAlarm = async (req,res) => {
    const {alarm_time, day_of_week} = req.body
    const userId = req.user.id // user contains email, userID, this is becayse we do requireAuth and store it inMemory
    
    try {
        const alarm = await alarmService.createAlarm(userId, alarm_time, day_of_week)
        return res.status(201).json({message: 'Alarm Created'})
    } catch (err) {
        if(err.code === 'Alarm_Time_Taken'){
            return res.status(409).json({message: err.message})
        }
        return res.status(500).json({message: "Something Went Wrong. Try again"})
    }
}
/*
Eager load all alarms
*/
const viewAlarm = async (req,res) => {
    const userId = req.user.id
    try{ 
     const alarms = await alarmService.viewAlarms(userId)
     return res.status(201).json({message: alarms})
    }catch(err){
        return res.status(500).json({message: "Something Went Wrong. Try again"})
    }
}
module.exports = {createAlarm, viewAlarm}