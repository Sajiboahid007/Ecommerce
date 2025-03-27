function getCookie(name) {
  let cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    let [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}
const cookie = getCookie("token");

const saveAjax = (url, jsonData) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(jsonData),
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};

const updateAjax = (url, jsonData) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "PUT",
      data: JSON.stringify(jsonData),
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};

const getAjax = (url) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "GET",
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};

const deleteAjax = (url) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "DELETE",
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      success: function (data) {
        resolve(data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
};
