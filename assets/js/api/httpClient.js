
function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const now = Math.floor(Date.now() / 1000); // الوقت الحالي بالثواني
  return payload.exp < now;
}



export async function postData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "فشل الإرسال");
  }

  return response.json();
}

export async function postDataWithFile(url, data) {
  const token = localStorage.getItem("jwtToken");

if (isTokenExpired(token)) {
  alert("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجددًا.");
  localStorage.removeItem("jwtToken");
window.location.href = LOGIN_PAGE;
return;
}
  const response = await fetch(url, {
    method: "POST",
    headers: {

 "Authorization": `Bearer ${token}`
    },
    body: data,
  });

  if (!response.ok) {
    
     if (response.status == 413) {

      response.message = "حجم الملف/الطلب أكبر من الحد المسموح به على الخادم. تم رفع الحدود، أعد المحاولة. "
      return   response.json();
    }
    const result = await response.json();
    throw new Error(result.message || "فشل الإرسال");
  }

  return response.json();
}


export async function postAPI(url, data) {
  const token = localStorage.getItem("jwtToken");

if (isTokenExpired(token)) {
  alert("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجددًا.");
  localStorage.removeItem("jwtToken");
window.location.href = LOGIN_PAGE;
}
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" ,

 "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
     if (response.status === 401) {
      throw new Error("ليس لديك صلاحية للوصول إلى API");
    }

    const result = await response.json();
    throw new Error(result.message || "فشل الإرسال");
  }

  return response.json();
}


export async function putAPI(url, data) {
  const token = localStorage.getItem('jwtToken')

if (isTokenExpired(token)) {
  alert("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجددًا.");
  localStorage.removeItem("jwtToken");
window.location.href = LOGIN_PAGE;
    return
}
  const response = await fetch(url, {
    method: "Put",
    headers: { "Content-Type": "application/json" ,

 "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
     if (response.status == 401) {
      throw new Error("ليس لديك صلاحية للوصول إلى API");
    }

    const result = await response.json();
    throw new Error(result.message || "فشل الإرسال");
  }

  return response.json();
}
 
export async function GetAPI(url) {
 const token = localStorage.getItem("jwtToken");

if (isTokenExpired(token)) {
  alert("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجددًا.");
  localStorage.removeItem("jwtToken");
  console.log(LOGIN_PAGE)

window.location.href = LOGIN_PAGE;
return
}
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" ,

        "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
     if (response.status === 401) {
      throw new Error("ليس لديك صلاحية للوصول إلى API");
    }

    const result = await response.json();
    throw new Error(result.message || "فشل الاتصال ب API");
  }

  return response.json();
}
 

export async function deleteAPI(url) {
  const token = localStorage.getItem("jwtToken");

  if (isTokenExpired(token)) {
    alert("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجددًا.");
    localStorage.removeItem("jwtToken");
    window.location.href = LOGIN_PAGE;
    return;
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("ليس لديك صلاحية.");
    }

    const result = await response.json();
    throw new Error(result.message || "فشل الحذف");
  }

  return response.json();
}

