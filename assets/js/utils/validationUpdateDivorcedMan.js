

export function validationUpdateDivorcedMan(data) {
  if (!data.firstName || !data.middleName || !data.lastName || !data.phoneNumber 
      || !data.nationality  || !data.dateOfBirth) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }


 if (data.dateOfBirth == '') {
    return "يجب ادخال تاريخ الميلاد";
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = data.email || ''
  console.log(email ) 
  if ((email != null && email !== '' )&&!emailRegex.test(data.email)) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }


  const PhoneNumberRegex = /[0]{1}[9]{1}[1,2,4,3]{1}[0-9]{7}/;
  if (!PhoneNumberRegex.test(data.phoneNumber)) {
    return "يجب أن يكون رقم الهاتف بالصيغة 091/2/3/4*****";
  }


  if ((data.passportNumber != null && data.passportNumber !== '' ) && data.passportNumber.length !== 8) {
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
