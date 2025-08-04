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
export async function postAPI(url, data) {
  const token = localStorage.getItem('jwtToken')
  console.log('token');
  console.log(token);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" ,

 "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "فشل الإرسال");
  }

  return response.json();
}
 
export async function GetAPI(url) {
  console.log('**122**');
    console.log('token');
   
  const token = localStorage.getItem('jwtToken');
   console.log(token);
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" ,

        "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "فشل الاتصال ب API");
  }

  return response.json();
}
 