export function validateRegisterData(data) {
  if (!data.FirstName || !data.MiddleName || !data.LastName || !data.PhoneNumber || !data.Email ||
      !data.PassportNumber || !data.Address || !data.NID || !data.DateOfBirth ||
      !data.Gender || !data.Nationality || !data.Role || !data.Username || !data.Password) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.Email)) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }

  if (data.Password.length < 8) {
    return "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.";
  }

    if (data.PhoneNumber.length < 10 || data.PhoneNumber.length > 12) {
    return "يجب أن يحتوي رقم الهاتف  على 10 أرقام على الأقل.";
  }

  if (data.PassportNumber.length != 8) {
    return "يجب أن يحتوي رقم جواز السفر  على 8 أرقام .";
  }

    if (data.NID.length != 12) {
    return "يجب أن يحتوي الرقم الوطني  على 12 رقم .";
  }

  return null;
}


export function validateRegisterData(data) {
  if (!data.FirstName || !data.MiddleName || !data.LastName || !data.PhoneNumber || !data.Email ||
      !data.PassportNumber || !data.Address || !data.NID || !data.DateOfBirth ||
      !data.Gender || !data.Nationality || !data.Role || !data.Username || !data.Password) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.Email)) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }

  if (data.Password.length < 8) {
    return "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.";
  }

    if (data.PhoneNumber.length < 10 || data.PhoneNumber.length > 12) {
    return "يجب أن يحتوي رقم الهاتف  على 10 أرقام على الأقل.";
  }

  if (data.PassportNumber.length != 8) {
    return "يجب أن يحتوي رقم جواز السفر  على 8 أرقام .";
  }

    if (data.NID.length != 12) {
    return "يجب أن يحتوي الرقم الوطني  على 12 رقم .";
  }

  return null;
}

export function validateLoginData(data) {
  if (!data.Username || !data.Password) {
    return "يرجى تعبئة اسم المستخدم وكلمة المرور.";
  }

  if (data.Password.length < 8) {
    return "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.";
  }

  return null;
}