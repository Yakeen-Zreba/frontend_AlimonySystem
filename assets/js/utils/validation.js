export function validateRegisterData(data) {
  if (!data.FirstName || !data.MiddleName || !data.LastName || !data.PhoneNumber || 
      !data.Gender || !data.Nationality || !data.Role || 
      !data.Username || !data.Password) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }


  if (data.Nationality === '0' && (!data.NID || data.NID.trim() === '')) {
    return "الرقم الوطني مطلوب للمواطنين الليبيين.";
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


if (data.Nationality === '0' && data.NID.length !== 12) {
  return "يجب أن يحتوي الرقم الوطني على 12 رقمًا.";
}else{

      const nidRegex = /[1]{1}[1]{1}[9]{1}[0-9]{9}|[2]{1}[1]{1}[9]{1}[0-9]{9}|[1]{1}[2]{1}[0]{1}[0-9]{9}|[2]{1}[2]{1}[0]{1}[0-9]{9}/;

       if (!nidRegex.test(data.NID)) {
    return "صيغة الرقم الوطني غير صحيحه ********119 او 219 او 120   او 220";
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