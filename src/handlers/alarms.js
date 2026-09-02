const createAlarm = async (req,res) => {
    const userId = req.user.id // user contains email, userID, this is becayse we do requireAuth and store it inMemory
    console.log(userId)
}

module.exports = {createAlarm}