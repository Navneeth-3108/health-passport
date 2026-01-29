export const handleEmergency = (req, res, next) => {
  const emergencyFlag = req.headers["x-emergency"] === "true" || req.body.emergency === true;
  req.isEmergency = emergencyFlag;
  next();
};