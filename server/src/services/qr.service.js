import { nanoid } from "nanoid";

export const generateQRToken = () => {
  return nanoid(12);
};

export const validateQRToken = (token, patient) => {
  if (!token || !patient) {
    return false;
  }

  if (token !== patient.qr_code_id) {
    return false;
  }

  if (patient.qr_code_expires && new Date() > patient.qr_code_expires) {
    return false;
  }

  return true;
};

export const isQRExpired = (patient) => {
  if (!patient.qr_code_expires) {
    return false;
  }
  return new Date() > patient.qr_code_expires;
};