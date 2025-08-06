

export function validationUpdateDivorcedManOrAgents(data) {
  if (!data.firstName || !data.middleName || !data.lastName || !data.phoneNumber 
      || !data.nationality  || !data.dateOfBirth) {
    return "يرجى تعبئة جميع الحقول المطلوبة.";
  }


  if (data.nationality === '0' && (!data.nid || data.nid.trim() === '')) {
    return "الرقم الوطني مطلوب للمواطنين الليبيين.";
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


  if (data.nationality === '0' && data.nid.length !== 12) {
    return "يجب أن يحتوي الرقم الوطني على 12 رقمًا.";
  }else{
 
      const nidRegex = /[1]{1}[1]{1}[9]{1}[0-9]{9}|[2]{1}[1]{1}[9]{1}[0-9]{9}|[1]{1}[2]{1}[0]{1}[0-9]{9}|[2]{1}[2]{1}[0]{1}[0-9]{9}/;

       if (!nidRegex.test(   data.nid)) {
    return "صيغة الرقم الوطني غير صحيحه ********119 او 219 او 120   او 220";
  }
  }
}
