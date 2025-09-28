export function validateRegisterData(data) {
  if (!data.FirstName || !data.MiddleName || !data.LastName || !data.PhoneNumber || !data.DateOfBirth|| 
      !data.Nationality || !data.Role || 
      !data.Username || !data.Password) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = data.Email || '';  
  if (email && !emailRegex.test(email)) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }


  if (data.Password.length < 8) {
    return "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.";
  }


const phone = data.PhoneNumber.trim();  
const PhoneNumberRegex = /^09[1-4][0-9]{7}$/;

if (!PhoneNumberRegex.test(phone)) {
  return "يجب أن يكون رقم الهاتف بالصيغة 091/2/3/4 متبوعًا بـ 7 أرقام.";
}


if ((data.PassportNumber != null && data.PassportNumber !== '' ) && data.PassportNumber.length !== 8) {
  return "يجب أن يحتوي رقم جواز السفر على 8 حروف ارقام.";
}


if (data.Nationality === '0') {
  if (!data.NID || data.NID.trim() === '') {
    return "الرقم الوطني مطلوب للمواطنين الليبيين.";
  }

  if (data.NID.length !== 12) {
    return "يجب أن يحتوي الرقم الوطني على 12 رقمًا.";
  }

  const nidRegex = /^(119|219|120|220)[0-9]{9}$/;

  if (!nidRegex.test(data.NID)) {
    return "صيغة الرقم الوطني غير صحيحه. يجب أن يبدأ بـ 119 أو 219 أو 120 أو 220.";
  }
}

if (data.Role == '5') {
  if (!data.AgentName || data.AgentName.trim() === '') {
    return "يجب ادخال اسم الوكيل /ة";
  }
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

export function validateAddDivorcedManData(data) {
  if (!data.FirstName || !data.MiddleName || !data.LastName || !data.PhoneNumber || !data.DateOfBirth||
      !data.Nationality ||
      !data.Username || !data.Password) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = data.Email || '';  
  if (email && !emailRegex.test(email)) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }


  if (data.Password.length < 8) {
    return "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.";
  }


const phone = data.PhoneNumber.trim();  
const PhoneNumberRegex = /^09[1-4][0-9]{7}$/;

if (!PhoneNumberRegex.test(phone)) {
  return "يجب أن يكون رقم الهاتف بالصيغة 091/2/3/4 متبوعًا بـ 7 أرقام.";
}


if ((data.PassportNumber != null && data.PassportNumber !== '' ) && data.PassportNumber.length !== 8) {
  return "يجب أن يحتوي رقم جواز السفر على 8 حروف ارقام.";
}


if (data.Nationality === '0') {
  if (!data.NID || data.NID.trim() === '') {
    return "الرقم الوطني مطلوب للمواطنين الليبيين.";
  }

  if (data.NID.length !== 12) {
    return "يجب أن يحتوي الرقم الوطني على 12 رقمًا.";
  }

  const nidRegex = /^(119|219|120|220)[0-9]{9}$/;

  if (!nidRegex.test(data.NID)) {
    return "صيغة الرقم الوطني غير صحيحه. يجب أن يبدأ بـ 119 أو 219 أو 120 أو 220.";
  }
}

return null; 
}


export function validateWomanRepresentationData(data) {
  if (!data.FirstName || !data.MiddleName || !data.LastName || !data.PhoneNumber || !data.DateOfBirth|| 
      !data.Nationality || !data.Role || 
      !data.Username || !data.Password) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = data.Email || '';  
  if (email && !emailRegex.test(email)) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }


  if (data.Password.length < 8) {
    return "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.";
  }


const phone = data.PhoneNumber.trim();  
const PhoneNumberRegex = /^09[1-4][0-9]{7}$/;

if (!PhoneNumberRegex.test(phone)) {
  return "يجب أن يكون رقم الهاتف بالصيغة 091/2/3/4 متبوعًا بـ 7 أرقام.";
}


if ((data.PassportNumber != null && data.PassportNumber !== '' ) && data.PassportNumber.length !== 8) {
  return "يجب أن يحتوي رقم جواز السفر على 8 حروف ارقام.";
}


if (data.Nationality === '0') {
  if (!data.NID || data.NID.trim() === '') {
    return "الرقم الوطني مطلوب للمواطنين الليبيين.";
  }

  if (data.NID.length !== 12) {
    return "يجب أن يحتوي الرقم الوطني على 12 رقمًا.";
  }

  const nidRegex = /^(119|219|120|220)[0-9]{9}$/;

  if (!nidRegex.test(data.NID)) {
    return "صيغة الرقم الوطني غير صحيحه. يجب أن يبدأ بـ 119 أو 219 أو 120 أو 220.";
  }
}

if (data.Role == '5') {
  if (!data.AgentName || data.AgentName.trim() === '') {
    return "يجب ادخال اسم الوكيل /ة";
  }
}
return null; 
}